'use client'

import React from 'react'
import { context } from '@typestackapp/core/components/global'
import { getRoleManagerData, useQuery, client } from '@typestackapp/core/components/queries'
import { AccessValidator } from '@typestackapp/core/models/user/access/util'
import { ValuesType } from 'utility-types'


type AccessStructure = {
  [role: string]: client.GetRoleManagerDataQuery["getAllAccessConfigs"]
}

const permissions: client.PermissionType[] = [
    client.PermissionType.Read, 
    client.PermissionType.Write,
    client.PermissionType.Delete,
    client.PermissionType.Update
]
const getAlias = (pack: string, data: client.GetRoleManagerDataQuery) => data?.getAllPackageConfigs.find(config => config.pack === pack)?.alias
const getRole = (roleId: string | undefined, data: client.GetRoleManagerDataQuery) => data?.getAllRoles?.find(role => role._id === roleId)

export default function RoleEditor() {
    const { tsappClient, session } = React.useContext(context)
    const query = useQuery(getRoleManagerData)
    const [data, setData] = React.useState<client.GetRoleManagerDataQuery | undefined>(query.data)
    const [selectedRole, setSelectedRole] = React.useState<string>()

    React.useEffect(() => {
        setData(query.data)
        if (query.data?.getAllRoles) {
            setSelectedRole(query.data.getAllRoles[0]._id)
        }
    }, [query.data])

    if (!data) return <div className="flex items-center justify-center h-screen">Loading...</div>

    return <div className="max-w-screen-lg h-full flex flex-col p-4">
        <div className="min-h-[50px]">
            {/* pick role dropdown */}
            <select className="p-2 border border-gray-300 rounded" defaultValue={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                {data?.getAllRoles?.map(role => <option key={role._id} value={role._id}>{role.data.name}</option>)}
            </select>

            {/* search */}
            <input type="text" className="p-2 border border-gray-300 rounded ml-2" placeholder="Search" />

            <button className="p-2.5 bg-primary text-white rounded ml-2">Update</button>

            {/* scope editor */}
            <ScopeEditor data={data} />
        </div>
        <div className="h-[calc(100%-50px)] overflow-auto">
            {/* role details */}
            <ScopeTable selectedRole={selectedRole} data={data} />
        </div>
    </div>
}

export function ScopeEditor({ data }: {data: client.GetRoleManagerDataQuery}) {
    const [selectedScope, setSelectedScope] = React.useState<string>("core.Auth.use")
    //const test: ValuesType<NonNullable<client.GetRoleManagerDataQuery["getAllAccessConfigs"]>>
    if (!selectedScope) return <div></div>
    
    return <div className='pt-2 flex items-center'>
        <select className="p-2 border border-gray-300 rounded" defaultValue={selectedScope} onChange={e => setSelectedScope(e.target.value)}>
            {data.getAllAccessConfigs.map((access, index) => <option key={index} value={access.pack}>{getAlias(access.pack, data)}</option>)}
        </select>
        <button className="p-2.5 bg-primary text-white rounded ml-2">Add</button>
    </div>
}

export function ScopeTable({ selectedRole, data }: {
    selectedRole: string | undefined,
    data: client.GetRoleManagerDataQuery 
}) {
    if(!selectedRole) return <div></div>
    const role = getRole(selectedRole, data)
    if(!role) return <div></div>
    const validator = new AccessValidator(role.data.resource_access)

    return <table className="w-full h-full table-auto border-r border-l">
        <thead className="mt-4 bg-gray-200 sticky top-0">
            <tr>
                <th className="py-2 border-r border-gray-300">Granted</th>
                <th className="py-2 border-r border-gray-300">Package</th>
                <th className="py-2 border-r border-gray-300">Resource</th>
                <th className="py-2 border-r border-gray-300">Action</th>
                <th className="py-2 border-r border-gray-300">Permission</th>
            </tr>
        </thead>
        <tbody>
            {data.getAllAccessConfigs.map((action, index) => 
                <tr key={index} className="border-b border-gray-300">
                    <td className="p-1 border-r border-gray-300 text-nowrap text-center">
                        {validator.checkAccess(action) ? "✅" : "❌"}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-nowrap">
                        {getAlias(action.pack, data)}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-nowrap">
                        {action.resource}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-nowrap">
                        {action.action}
                    </td>
                    <td className="p-1 border-r border-gray-300">
                        {action.auth?.permission || "-"}
                    </td>
                </tr>
            )}
        </tbody>
    </table>
}