'use client'

import React from 'react'
import { context } from '@typestackapp/core/components/global'
import { getRoleManagerData, useQuery, client } from '@typestackapp/core/components/queries'
import { AccessValidator } from '@typestackapp/core/models/user/access/util'

type AccessStructure = {
  [role: string]: {
    [pack: string]: client.GetRoleManagerDataQuery["getAllAccessConfigs"]
  }
}

function AccordionMenu({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
    const [open, setOpen] = React.useState<boolean>(true)
    return <div>
        <div className={className} onClick={() => setOpen(!open)}>
            <span className="ml-auto">{open ? "▼" : "►"}</span>
            <span>{title}</span>
        </div>
        {open && children}
    </div>
}

export default function RoleEditor() {
    const { tsappClient, session } = React.useContext(context)
    const query = useQuery(getRoleManagerData)
    const [data, setData] = React.useState<client.GetRoleManagerDataQuery | undefined>(query.data)
    const [selectedRole, setSelectedRole] = React.useState<string>()
    const access: AccessStructure = {}

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
            if (!access[role._id]) access[role._id] = {}
            if (!access[role._id][config.pack]) access[role._id][config.pack] = access[role._id][config.pack] = []
            access[role._id][config.pack].push(config)
        })
    })

    function AccessEditor() {
        if (!selectedRole) return <div></div>
        // const selected_access = access[selectedRole][selectedPack][selectedResource]
        // const role = getRole(selectedRole)
        // if(!selected_access || !role) return <div></div>
        // const role_access = role.data.resource_access
        // const valid = new AccessValidator(role_access)

        return <div>
            {/* {selected_access.map((config, index) => (
                <div key={index} className="mb-2 p-2 bg-secondary rounded-md">
                    <strong>Action:</strong> {config.resource}.{config.action}<br />
                    <strong>Accessable:</strong> {valid.checkResourceAccess([{
                        pack: config.pack,
                        resource: config.resource,
                        action: config.action,
                        permissions: ['Read'],
                        status: 'Enabled'
                    }]).has_full_access ? 'Yes' : 'No'}<br />
                    <strong>Tokens:</strong> {config.auth?.tokens?.join(", ") || "-"}<br />
                    <strong>Permission:</strong> {config.auth?.permission || "-"}<br />
                    <strong>Info:</strong>
                    <ul className="list-disc list-inside pl-2">
                        {config.info?.map((info, i) => <li key={i}>{info}</li>)}
                    </ul>
                </div>
            ))} */}
        </div>
    }
    
    function RoleEditor() {
        const role = getRole(selectedRole)
        if(!role || !selectedRole) return <div></div>
        const role_access = role.data.resource_access
        const all_role_access = access[selectedRole]


        const permisions: client.PermissionType[] = [
            client.PermissionType.Read, 
            client.PermissionType.Write,
            client.PermissionType.Delete,
            client.PermissionType.Update
        ]

        // create multi level list
        return <div className='h-full mt-4 flex flex-row gap-4'>
            {Object.entries(all_role_access).map(([pack, resources], index) => {
                const alias = getAlias(pack) || ""
                const resources_dropdown: { [key: string]: client.GetRoleManagerDataQuery["getAllAccessConfigs"] } = {}
                for (const resource of resources) {
                    if(resource.resource == undefined) continue
                    if (!resources_dropdown[resource.resource]) resources_dropdown[resource.resource] = []
                    resources_dropdown[resource.resource].push(resource)
                }

                return <div key={index} className="w-full ">
                    <AccordionMenu title={alias} className="border-b border-gray-300 cursor-pointer hover:bg-gray-100 text-lg">
                        <table className=" table-auto w-full border border-gray-300">
                            {Object.entries(resources_dropdown).map(([resource, actions], index) => {
                                return <>
                                    <thead>
                                        <tr className="bg-gray-200 border-b border-gray-300">
                                            <th className="px-4 py-1 border-r border-gray-300">Scope</th>
                                            <th className="px-4 py-1 border-r border-gray-300">Permission</th>
                                            <th className="px-4 py-1">Tokens</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actions.map((action, index) => (
                                            <tr key={index} className="border-b border-gray-300">
                                                <td className="px-4 border-r border-gray-300">
                                                    {alias}.{action.resource}.{action.action}
                                                </td>
                                                <td className="px-4 border-r border-gray-300">
                                                    {action.auth?.permission || "-"}
                                                </td>
                                                <td className="px-4">
                                                    {action.auth?.tokens?.join(", ") || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            })}
                        </table>
                    </AccordionMenu>
                </div>
            })}
        </div>
    }

    if (!data) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return <div className="p-4 w-full h-full">
        <div className="h-[100px] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4">User Role Editor</h1>

            {/* pick role dropdown */}
            <select className="p-2 border border-gray-300 rounded" defaultValue={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                {data?.getAllRoles?.map(role => <option key={role._id} value={role._id}>{role.data.name}</option>)}
            </select>

            <button className="p-2.5 bg-primary text-white rounded ml-2">Update</button>
        </div>
        <div className="h-[calc(100%-100px)]">
            {/* role details */}
            <RoleEditor />
        </div>
    </div>
}