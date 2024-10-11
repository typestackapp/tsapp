'use client'

import React from 'react'
import { context } from '@typestackapp/core/components/global'
import { getRoleManagerData, useQuery, client } from '@typestackapp/core/components/queries'
import { AccessValidator } from '@typestackapp/core/models/user/access/util'

type AccessStructure = {
  [role: string]: {
    [pack: string]: {
      [resource: string]: client.GetRoleManagerDataQuery["getAllAccessConfigs"]
    }
  }
}

export default function RoleEditor() {
    const { tsappClient, session } = React.useContext(context)
    const query = useQuery(getRoleManagerData)
    const [data, setData] = React.useState<client.GetRoleManagerDataQuery | undefined>(query.data)
    const [selectedRole, setSelectedRole] = React.useState<string>()
    const [selectedPack, setSelectedPack] = React.useState<string>()
    const [selectedResource, setSelectedResource] = React.useState<string>()
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
            if (!access[role._id][config.pack]) access[role._id][config.pack] = {}
            if (!access[role._id][config.pack][config.resource]) access[role._id][config.pack][config.resource] = []
            access[role._id][config.pack][config.resource].push(config)
        })
    })

    function AccessEditor() {
        if (!selectedPack || !selectedRole || !selectedResource) return <div></div>
        const selected_access = access[selectedRole][selectedPack][selectedResource]
        const role = getRole(selectedRole)
        if(!selected_access || !role) return <div></div>
        const role_access = role.data.resource_access
        const valid = new AccessValidator(role_access)

        return <div>
            {selected_access.map((config, index) => (
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
            ))}
        </div>
    }

    function RoleEditor() {
        const role = getRole(selectedRole)
        if(!role || !selectedRole) return <div></div>
        const role_access = role.data.resource_access
        const resource_access = role_access.find(
            access => access.pack === selectedPack
            && access.resource === selectedResource
            && access.action === null
        )

        const permisions: client.PermissionType[] = [
            client.PermissionType.Read, 
            client.PermissionType.Write,
            client.PermissionType.Delete,
            client.PermissionType.Update
        ]

        return <div className='h-full mt-4 flex flex-row gap-4'>
            {/* packages */}
            <div className='p-2 border-l border-gray-300'>
                <div className='h-full flex flex-col gap-2 overflow-y-auto overflow-x-hidden'>
                    <div className='font-bold text-lg min-w-24'>Packages</div>
                    {Object.entries(access[selectedRole]).map(([pack, resources]) => <div key={pack}>
                        <button title={pack} onClick={() => setSelectedPack(pack)} className={`${selectedPack === pack ? 'bg-primary text-white' : 'bg-gray-200'} p-2 rounded`}>
                            {getAlias(pack)}
                        </button>
                    </div>)}
                </div>
            </div>

            {/* resources */}
            <div className='p-2 border-l border-gray-300'>
                <div className='h-full flex flex-col gap-2 overflow-y-auto overflow-x-hidden'>
                    <div className='font-bold text-lg min-w-24'>Resources</div>
                    {Object.entries(access[selectedRole][selectedPack || ""] || {}).map(([resource, configs]) => <div key={resource}>
                        <button title={resource} onClick={() => setSelectedResource(resource)} className={`${selectedResource === resource ? 'bg-primary text-white' : 'bg-gray-200'} p-2 rounded`}>
                            {resource}
                        </button>
                    </div>)}
                </div>
            </div>

            {/* access */}
            <div className='p-2 w-full border-l border-gray-300'>
                <div className='h-full flex flex-col gap-2 overflow-y-auto overflow-x-hidden'>
                    <div className='font-bold text-lg min-w-24'>Access</div>
                    
                    {resource_access && <div className='flex flex-row gap-2'>
                        <div>Apply to all:</div>
                        {permisions.map(permission => <div key={permission}>
                            <label className='flex items-center gap-1'>
                                <input
                                    type='checkbox' 
                                    defaultChecked={resource_access.permissions.includes(permission)}
                                />
                                {permission}
                            </label>
                        </div>)}
                    </div>}   
                    <AccessEditor />
                </div>
            </div>
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