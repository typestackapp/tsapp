'use client'

import React from 'react'
import { context } from '@typestackapp/core/components/global'
import { getRoleManagerData, useQuery, client } from '@typestackapp/core/components/queries'
import { AccessValidator } from '@typestackapp/core/models/user/access/util'

type AccessStructure = {
  [role: string]: client.GetRoleManagerDataQuery["getAllAccessConfigs"]
}

export default function RoleEditor() {
    const { tsappClient, session } = React.useContext(context)
    const query = useQuery(getRoleManagerData)
    const [data, setData] = React.useState<client.GetRoleManagerDataQuery | undefined>(query.data)
    const [selectedRole, setSelectedRole] = React.useState<string>()
    const [selectedScope, setSelectedScope] = React.useState<string>("core.Auth.use")
    const all_role_access: AccessStructure = {}

    React.useEffect(() => {
        setData(query.data)
        if (query.data?.getAllRoles) {
            setSelectedRole(query.data.getAllRoles[0]._id)
        }
    }, [query.data])

    const getAlias = (pack: string) => data?.getAllPackageConfigs.find(config => config.pack === pack)?.alias

    const getRole = (roleId: string | undefined) => data?.getAllRoles?.find(role => role._id === roleId)

    data?.getAllRoles?.map(role => {
        data?.getAllAccessConfigs.map(config => {
            if (!all_role_access[role._id]) all_role_access[role._id] = []
            all_role_access[role._id].push(config)
        })
    })

    function ScopeEditor() {
        if (!selectedScope || !selectedRole) return <div></div>
        
        return <div className='min-h-[50px] pt-2'>
            Scope: {selectedScope}
        </div>
    }
    
    function RoleEditor() {
        const role = getRole(selectedRole)
        if(!role || !selectedRole) return <div></div>
        const granted_role_access = role.data.resource_access

        const permissions: client.PermissionType[] = [
            client.PermissionType.Read, 
            client.PermissionType.Write,
            client.PermissionType.Delete,
            client.PermissionType.Update
        ]

        // create multi level list
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
                {all_role_access[selectedRole].map((action, index) => 
                    <tr key={index} className="border-b border-gray-300">
                        <td className="p-1 border-r border-gray-300 text-nowrap text-center">
                            {new AccessValidator(granted_role_access).checkAccess(action) ? "✅" : "❌"}
                        </td>
                        <td className="p-1 border-r border-gray-300 text-nowrap">
                            {getAlias(action.pack)}
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

    if (!data) return <div className="flex items-center justify-center h-screen">Loading...</div>

    return <div className="w-full h-full flex flex-col p-4">
        <div className="min-h-[50px]">
            {/* pick role dropdown */}
            <select className="p-2 border border-gray-300 rounded" defaultValue={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                {data?.getAllRoles?.map(role => <option key={role._id} value={role._id}>{role.data.name}</option>)}
            </select>

            {/* search */}
            <input type="text" className="p-2 border border-gray-300 rounded ml-2" placeholder="Search" />

            <button className="p-2.5 bg-primary text-white rounded ml-2">Update</button>

            {/* scope editor */}
            <ScopeEditor />
        </div>
        <div className="h-[calc(100%-50px)] overflow-auto max-w-screen-lg">
            {/* role details */}
            <RoleEditor />
        </div>
    </div>
}