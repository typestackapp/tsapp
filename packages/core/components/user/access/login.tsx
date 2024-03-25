'use client'
import React, { useContext } from 'react'
import { context } from '@typestackapp/core/components/global'
import '@typestackapp/core/next/public/tsapp.css'

export default function LoginComponent() {
  const {tsappClient, session} = useContext(context)
  if(!session) throw new Error("Session not found")

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    const email = event.target.email.value
    const password = event.target.password.value
    tsappClient.login(email, password)
    .then((response) => session?.setState(response))
    .catch((error) => alert(error))
  }

  const getError = () => {
    if(!session || !session.state || !session.state?.error)
     return <></>
    
    if(session.state.error.code == "invalid-auth-no-token-found")
      return <></>
    
    return <>
      Error: {session.state?.error.code}<br></br>
      Message: {session.state?.error.msg}<br></br>
    </>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-grey rounded-md shadow-md px-4 py-8 gap-2 w-full border">
      <h1 className="text-2xl font-bold flex justify-center">
        Sign In
      </h1>
      
      <label htmlFor="email" className="block text-gray-700 text-sm font-bold">
        Email
      </label>
      <input type="email" id="email" name="email" placeholder="email@example.com" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      
      <label htmlFor="password" className="block text-gray-700 text-sm font-bold">
        Password
      </label>
      <input id="password" type="password" placeholder="******************" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
      
      <div className="flex justify-center text-red-500 text-sm">
        {getError()}
      </div>
      
      <div className="flex items-center justify-between">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Sign In
        </button>
        <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
          Forgot Password?
        </a>
      </div>
    </form>
  )
}