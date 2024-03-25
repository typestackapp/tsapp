'use client'
import Link from 'next/link'
import React, { useState, useContext } from 'react'
import { context } from '@typestackapp/core/components/global'

export default function AccountComponent() {
    const [ isOpen, setIsOpen ] = useState(false)
    const { tsappClient } = useContext(context)
        
    return (
        <div>
            <button onClick={()=>{setIsOpen(!isOpen)}}>Account</button>
            {isOpen && <AccountNav />}
        </div>
    )
}

function AccountNav() {
    return (
        <div>
            { true && <Link href="/admin/account">Profile info</Link> } <br/>
            {/*  { true && <Link href="tsapp/user/register">Register</Link> } <br/> */}
            {/*  { true && <Link href="tsapp/user/logout">Logout</Link> } <br/> */}
        </div>
    )
}