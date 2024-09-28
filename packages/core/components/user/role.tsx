'use client'
import React, { useContext } from 'react'
import { context } from '@typestackapp/core/components/global'
import '@typestackapp/core/next/public/tsapp.css'
import { getRoleManagerData, useQuery } from '@typestackapp/core/components/queries'

export default function RoleManagerComponent() {
    const { tsappClient, session } = useContext(context)
    const { data } = useQuery(getRoleManagerData)

    const handleSubmit = async (event: any) => {

    }

    return (<div>
        <h1>Role Manager</h1>
        {data?.getAllRoles && data.getAllRoles.map((role: any) => {
            return <div key={role._id}>{role.title}</div>
        })}
        <form onSubmit={handleSubmit} className="flex flex-col bg-grey rounded-md shadow-md px-4 py-8 gap-2 w-full border">
        </form>
    </div>)
}
