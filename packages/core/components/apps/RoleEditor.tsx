'use client'

import React from 'react'
import { context } from '@typestackapp/core/components/global'
import { getRoleManagerData, useQuery, client } from '@typestackapp/core/components/queries'
import { AccessValidator } from '@typestackapp/core/models/user/access/util'
import { ValuesType } from 'utility-types'

type AccessConfig = ValuesType<NonNullable<client.GetRoleManagerDataQuery["getAllAccessConfigs"]>>
type Scope = ValuesType<NonNullable<client.GetRoleManagerDataQuery["getAllAccessConfigs"]>>

const permissions: client.PermissionType[] = [
    client.PermissionType.Read, 
    client.PermissionType.Write,
    client.PermissionType.Delete,
    client.PermissionType.Update
]
const getAlias = (pack: string, data: client.GetRoleManagerDataQuery) => data?.getAllPackageConfigs.find(config => config.pack === pack)?.alias
const getRole = (roleID: string | undefined, data: client.GetRoleManagerDataQuery) => data?.getAllRoles?.find(role => role._id === roleID)

export default function RoleEditor() {
    const { tsappClient, session } = React.useContext(context)
    const query = useQuery(getRoleManagerData)
    const [data, setData] = React.useState<client.GetRoleManagerDataQuery | undefined>(query.data)
    const [roleID, setRoleID] = React.useState<string>()
    const [scope, setScope] = React.useState<Scope>()

    React.useEffect(() => {
        setData(query.data)
        if (query.data?.getAllRoles) {
            setRoleID(query.data.getAllRoles[0]._id)
            setScope(query.data.getAllAccessConfigs[0])
        }
    }, [query.data])

    if (!data) return <div className="flex items-center justify-center h-screen">Loading...</div>

    return <div className="max-w-screen-lg h-full p-4 flex flex-col overflow-x-auto overflow-y-hidden">
        <div>
            {/* pick role dropdown */}
            <select className="p-2 border border-gray-300 rounded" defaultValue={roleID} onChange={e => setRoleID(e.target.value)}>
                {data?.getAllRoles?.map(role => <option key={role._id} value={role._id}>{role.data.name}</option>)}
            </select>

            {/* search */}
            <input type="text" className="p-2 border border-gray-300 rounded ml-2" placeholder="Search" />
            
            {/* update */}
            <button className="p-2.5 bg-primary text-white rounded ml-2">Update</button>
        </div>
        <div className='max-h-1/2 overflow-auto'>
            <ScopeEditor roleID={roleID} data={data} scope={scope} />
        </div>
        <div className='overflow-auto'>
            <ScopeTable roleID={roleID} data={data} setScope={setScope} />
        </div>
    </div>
}

export function ScopeTable({ roleID, data, setScope }: {
    roleID: string | undefined,
    data: client.GetRoleManagerDataQuery,
    setScope: (scope: Scope) => void
}) {
    if(!roleID) return <div></div>
    const role = getRole(roleID, data)
    if(!role) return <div></div>
    const validator = new AccessValidator(role.data.resource_access)

    return <table className="w-full h-full table-auto border-r border-l">
        <thead className="bg-gray-200 sticky top-0">
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
                <tr 
                    onClick={() => setScope(action)}
                    key={index} 
                    className="border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
                    title={action?.info?.join("\n") || "-"}
                >
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

export function ScopeEditor({ roleID, data, scope }: {
    roleID: string | undefined,
    data: client.GetRoleManagerDataQuery,
    scope: Scope | undefined
}) {    
    const role = getRole(roleID, data)
    if(!scope || !role) return <div className="py-2"></div>
    
    const validator = new AccessValidator(role.data.resource_access)
    const access = validator.findAccessProvided(scope)
    
    return <div className='h-full py-2 flex flex-col'>
        <div className='text-lg font-semibold'>
            Scope: {getAlias(scope.pack, data)} - {scope.resource} - {scope.action}
        </div>
        <div className='ml-2'>
            Package:
            <ul>
                {access?.map((action, index) => 
                    <li key={index}>
                        {getAlias(action.pack, data)}.{action?.resource || "*"}.{action?.action || "*"}
                    </li>
                )}
            </ul>
        </div>
    </div>
}