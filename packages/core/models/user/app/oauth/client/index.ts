import type { BearerToken } from "@typestackapp/core/models/user/util"
import type { ExpressResponse } from "../../../../../common/service"
import type { OauthAppData } from "@typestackapp/core/models/user/app/oauth"
import { Optional } from "utility-types"

export type ClientSession = ExpressResponse<BearerToken | undefined>

export type ClientOptions = {
    client_id: string
}

export type CallbackOptions = {
    app: OauthAppData
    code: string
    state: string
}

export interface GetTokenOptions {
    token: BearerToken
    app: OauthAppData
}

export type AuthUrlOptions = {
    client_id: string
    state: string
    redirect_url: string
}

export type Header = { [key: string]: string }

export abstract class Client<Session extends ClientSession = ClientSession> {
    abstract options: ClientOptions
    abstract session: Session

    abstract getAuthUrl(options: AuthUrlOptions): string
    abstract getToken(options: GetTokenOptions): Promise<BearerToken>
    abstract callback(options: CallbackOptions): Promise<ClientSession>
    
    abstract isTokenPresent(): boolean
    abstract isAccessTokenValid(): boolean
    abstract isRefreshTokenValid(): boolean
    isTokenValid(): boolean {
        return (
            this.isTokenPresent() &&
            this.isAccessTokenValid() &&
            this.isRefreshTokenValid()
        )
    }
}