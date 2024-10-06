import moment from "moment"
import { CreateTRPCClientOptions, CreateTRPCProxyClient, HTTPHeaders, createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AuthUrlOptions, CallbackOptions, Client, ClientOptions, ClientSession, GetTokenOptions } from "@typestackapp/core/models/user/app/oauth/client"
import type { AuthInput, AuthOutput, AuthRouter } from "@typestackapp/core/express/auth"
import { GraphqlClients, getGraphqlClients } from "@typestackapp/core/codegen/next/graphql"

export default class TSAppClient extends Client {
    readonly auth: CreateTRPCProxyClient<AuthRouter> // auth trpc client
    readonly graphql: GraphqlClients // tsapp graphql clients
    options: ClientOptions
    session: ClientSession
    private sessionRequest: Promise<ClientSession> | undefined

    constructor(options: ClientOptions) {
        super()
        this.options = options
        this.session = {
            data: undefined,
            error: undefined,
        }
        this.auth = this.getAuthClient()
        this.graphql = getGraphqlClients(this)
    }

    async login(email: string, password: string): Promise<ClientSession> {
        const encoded = Buffer.from(`${email}:${password}`).toString('base64')
        const client = this.getAuthClient({ Authorization: `Basic ${encoded}` })
        const result = await client.token.password.mutate({client_id: this.options.client_id})
        return this.session = {
            data: result.data,
            error: result.error
        }
    }

    private getAuthClient(headers?: HTTPHeaders): CreateTRPCProxyClient<AuthRouter> {
        const client: CreateTRPCClientOptions<AuthRouter> = {
            links: [
                httpBatchLink({
                    url: `/api/auth`,
                    headers: async (opts) => {
                        if(headers) return headers
                        return await this.getAuthHeaders()
                    },
                })
            ]
        } as any
        return createTRPCProxyClient(client)
    }

    getCurrentSession(): ClientSession | false {
        var _session: ClientSession | false = false
        if (this.session.data) _session = this.session
        return _session
    }

    async getActiveSession() {
        if(this.isTokenValid()) return this.session
        const client = this.getAuthClient({})

        if(!this.sessionRequest)
            this.sessionRequest = client.token.session.mutate({client_id: this.options.client_id})

        const result = await this.sessionRequest
        return this.session = {
            data: result.data,
            error: result.error
        }
    }

    // returns header for bearer token
    async getAuthHeaders(): Promise<HTTPHeaders> {
        const session = await this.getActiveSession()
        if(!this.isTokenValid()) throw new Error("No valid token isTokenValid")
        if(session.data == undefined) throw new Error("Session token undefined")
        return {
            "Authorization": `Bearer ${session.data.access.tk}`
        }
    }

    async callback(options: CallbackOptions): Promise<ClientSession> {
        const response: ClientSession = {
            data: undefined,
            error: undefined
        }

        const body: AuthInput["token"]["authorization_code"] = {
            code: options.code,
            client_id: options.app.client_id,
            client_secret: options.app.client_secret
        }
        const url = options.app.token_url || `/api/auth/token/authorization_code`

        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(response => response.result as AuthOutput["token"]["authorization_code"])
        .then(result => {
            response.data = result.data
            response.error = result.error
        })
        .catch(error => {
            response.error = {
                code: "oauth-callback-fetch-error",
                msg: `${error}`
            }
        })

        return response
    }

    getAuthUrl(options: AuthUrlOptions): string {
        const url = `/api/auth/authorize`
        const params = new URLSearchParams({
            client_id: this.options.client_id,
            redirect_url: options.redirect_url,
            state: options.state
        })
        return `${url}?${params.toString()}`
    }

    async getToken(options: GetTokenOptions) {
        throw new Error("Method not implemented.")
        return {} as any
    }

    isTokenPresent() {
        return this.session?.data != undefined
    }

    isAccessTokenValid() {
        if(!this.session?.data) throw new Error("No session set at isAccessTokenValid")
        return moment(this.session.data.access.exp).isAfter(moment.utc())
    }

    isRefreshTokenValid() {
        if(!this.session?.data) throw new Error("No session set at isRefreshTokenValid")
        if(this.session.data.refresh == undefined) return true
        return moment(this.session.data.refresh.exp).isAfter(moment.utc())
    }
}