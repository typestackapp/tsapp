'use client'
import React from 'react'
import { getAdminUserData, useQuery } from '@typestackapp/core/components/queries'

export default function AccountComponent() {
  const { data } = useQuery(getAdminUserData, { fetchPolicy: "cache-first" })

  if(!data) return <div>Loading...</div>

  return (
    <div>
      Email: {data?.getCurrentUser?.usn}
    </div>
  )
}