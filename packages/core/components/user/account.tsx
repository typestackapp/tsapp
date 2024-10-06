'use client'
import React from 'react'
import { getAdminData, useQuery } from '@typestackapp/core/components/queries'

export default function AccountComponent() {
  const { data } = useQuery(getAdminData, { fetchPolicy: "cache-first" })

  if(!data) return <div>Loading...</div>

  return (
    <div>
      Email: {data?.getCurrentUser?.usn}
    </div>
  )
}