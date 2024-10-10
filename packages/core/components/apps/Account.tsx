'use client'
import React from 'react'
import { getAdminData, useQuery } from '@typestackapp/core/components/queries'
import { LogoutBtn } from '@typestackapp/core/components/util'

export default function Account() {
  const { data } = useQuery(getAdminData, { fetchPolicy: "cache-first" })

  if(!data) return <div>Loading...</div>

  const email = data?.getCurrentUser?.usn
  const roles = data?.getCurrentUser?.roles

  // shrink items
  return <div className="flex flex-col gap-2">
    <h1>Account Information</h1>
    <div>Email: {email}</div>
    <div>Roles: {roles?.map(role => role.data.name).join(', ')}</div>
    <div className="shrink"><LogoutBtn /></div>
  </div>
}