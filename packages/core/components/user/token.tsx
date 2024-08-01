'use client'
import React, { useContext } from 'react'
import { context } from '@typestackapp/core/components/global'
import '@typestackapp/core/next/public/tsapp.css'

export default function CreateTokenComponent() {
  const {tsappClient, session} = useContext(context)
  if(!session) throw new Error("Session not found")

  const handleSubmit = async (event: any) => {
    
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-grey rounded-md shadow-md px-4 py-8 gap-2 w-full border">
      
    </form>
  )
}