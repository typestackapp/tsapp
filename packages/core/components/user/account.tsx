'use client'
import React from 'react'
import { useQuery } from "@apollo/client"
import { getAdminUserDataQuery } from '@typestackapp/core/components/admin'

export default function AccountComponent() {
  const { data } = useQuery(getAdminUserDataQuery, { fetchPolicy: "cache-first" })

  if(!data) return <div>Loading...</div>

  return (
    <div>
      Email: {data?.getCurrentUser?.email}
    </div>
  )
}