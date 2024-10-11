'use client'

import React from 'react'
import { context } from '@typestackapp/core/components/global'
import { getRoleManagerData, useQuery, client } from '@typestackapp/core/components/queries'

type AccessStructure = {
  [role: string]: {
    [pack: string]: {
      [resource: string]: client.GetRoleManagerDataQuery["getAllAccessConfigs"]
    }
  }
}

export default function RoleEditor() {
    const { tsappClient, session } = React.useContext(context)
    const { data } = useQuery(getRoleManagerData)
    const [selectedRole, setSelectedRole] = React.useState<string>()
    const [selectedPack, setSelectedPack] = React.useState<string>()
    const [selectedResource, setSelectedResource] = React.useState<string>()
    const access: AccessStructure = {}

    React.useEffect(() => {
        if (data?.getAllRoles) {
            setSelectedRole(data.getAllRoles[0]._id)
        }
    }, [data])

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
        const _access = access[selectedRole][selectedPack][selectedResource]
        if(!_access) return <div></div>

        return <div>
            {_access.map((config, index) => (
                <div key={index} className="mb-2 p-2 bg-secondary rounded-md">
                    <p><strong>Action:</strong> {config.action}</p>
                    <p><strong>Info:</strong> {config?.info?.join(', ')}</p>
                    <p><strong>Resource Action:</strong> {config.resourceAction}</p>
                </div>
            ))}
        </div>
    }

    function RoleEditor() {
        const role = getRole(selectedRole)
        if(!role || !selectedRole) return <div></div>

        return <div className='flex flex-row mt-4'>
            {/* pacakges */}
            <div className='p-2 pr-4 flex flex-col gap-2'>
                <div className='font-bold text-lg min-w-24'>Packages</div>
                {Object.entries(access[selectedRole]).map(([pack, resources]) => <div key={pack}>
                    <button title={pack} onClick={() => setSelectedPack(pack)} className={`${selectedPack === pack ? 'bg-primary text-white' : 'bg-gray-200'} p-2 rounded`}>
                        {getAlias(pack)}
                    </button>
                </div>)}
            </div>

            {/* resources */}
            <div className='p-2 border-l border-gray-300'>
                <div className='font-bold text-lg min-w-24'>Resources</div>
                <div className='flex flex-col gap-2'>
                    {Object.entries(access[selectedRole][selectedPack || ""] || {}).map(([resource, configs]) => <div key={resource}>
                        <button title={resource} onClick={() => setSelectedResource(resource)} className={`${selectedResource === resource ? 'bg-primary text-white' : 'bg-gray-200'} p-2 rounded`}>
                            {resource}
                        </button>
                    </div>)}
                </div>
            </div>

            {/* access */}
            <div className='p-2 w-full border-l border-gray-300'>
                <div className='font-bold text-lg min-w-24'>Access</div>
                <AccessEditor />
            </div>
        </div>
    }

    if (!data) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">User Role Editor</h1>
        {/* pick role dropdown */}
        <select className="p-2 border border-gray-300 rounded" defaultValue={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
            {data?.getAllRoles?.map(role => <option key={role._id} value={role._id}>{role.data.name}</option>)}
        </select>

        <button className="p-2.5 bg-primary text-white rounded ml-2">Update</button>

        {/* role details */}
        <RoleEditor />
    </div>
}