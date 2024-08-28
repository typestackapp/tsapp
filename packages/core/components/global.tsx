"use client"
import { Dispatch, SetStateAction, createContext} from 'react'
import frontend from '@typestackapp/core/codegen/config/source/@typestackapp/core/frontend.public.json'
import TSAppClient from '@typestackapp/core/models/user/app/oauth/client/tsapp'
import type { ClientSession } from '@typestackapp/core/models/user/app/oauth/client'
import type { AdminApp } from '@typestackapp/core/components/util'

export type Session = {
    state: undefined | false | ClientSession,
    setState: Dispatch<SetStateAction<ClientSession | false>>
}

export type Apps = {
    state: undefined | AdminApp[],
    setState: Dispatch<SetStateAction<undefined | AdminApp[]>>
}

export abstract class IGlobalContext {
    abstract readonly config: typeof frontend
    abstract readonly tsappClient: TSAppClient
    
    apps: Apps | undefined

    get session(): Session | undefined {
        return this.session
    }

    set session(session: Session) {
        if(session !== undefined) throw new Error("Cannot set session")
        this.session = session
    }
}

export const context = createContext<IGlobalContext>({
    tsappClient: new TSAppClient(frontend),
    config: frontend,
    session: undefined,
    apps: undefined,
})