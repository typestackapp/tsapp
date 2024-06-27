import * as jose from 'jose'
import mongoose from "mongoose"
import { AccessTokenJWTPayload, AccessTokenPayloadVerified, BearerKeyOptions, addTimeDuration, compareApiKey } from "@typestackapp/core/models/user/util"
import { decodeApiKey } from "@typestackapp/core/models/user/util"
import { ApiKeyTokenOutput } from "@typestackapp/core/models/user/token/apikey"
import { UserDocument, UserModel } from '@typestackapp/core/models/user'
import { IAccessInput, ITokenType, IExpressMethod, IGraphqlMethod } from '@typestackapp/core'
import { IServerAccess, IAccessOptions } from '@typestackapp/core'
import { Request, Response, NextFunction } from "express"
import { IGraphqlRouter, IExpressRouter, ExpressResponse, ExpressErrorResponse, GraphqlResovlerModule, GraphqlResovlerMethod } from '../../../common/service'
import { Packages, env } from "@typestackapp/core"
import { ApiKeyTokenModel } from '@typestackapp/core/models/user/token/apikey'
import { AccessTokenJWKData, JWKCache } from "@typestackapp/core/models/config/jwk"
import { access_token_config_id } from "@typestackapp/core/models/update/main"
import moment from 'moment'
import { UserAccessInput, UserAccessLogDocument, UserAccessLogInput, UserAccessLogModel, UserAccessModel, UserDevice } from '@typestackapp/core/models/user/access'
import { AccessValidator, secretCompare } from '@typestackapp/core/models/user/access/util'
import { OauthAppModel } from '@typestackapp/core/models/user/app/oauth'
import { getPackageVersion } from '@typestackapp/cli/common/util'

export type { Request, Response, NextFunction }
export type AccessInput = IAccessInput
export type AccessOptions = IAccessOptions

// request authorization data
interface AccessRequestData {
    id: mongoose.Types.ObjectId // request id
    middleware: MiddlewareResult
    log?: UserAccessLogDocument
    user?: UserDocument // user document is set if authorize middleware is used
    token?: AccessRequestToken // token is set if authorize middleware is used
    captcha?: CaptchaResponse // captcha is set if captcha middleware is used
}

export type AccessRequest = Request & AccessRequestData
export type ExpressResources = { [key in IExpressMethod]?: IAccessOptions }
export type ExpressRequestHandler = (req: AccessRequest, res: Response, next: NextFunction) => Promise<any> | any
| ((req: AccessRequest, res: Response) => Promise<any> | any)

export interface GraphqlServerAccess extends IServerAccess {
    serverMethod:  IGraphqlMethod
    serverType: "GRAPHQL"
    resolverName: string
}

export interface ExpressServerAccess extends IServerAccess {
    path: string[]
    serverMethod: IExpressMethod
    serverType: "EXPRESS"
}

export type ServerAccess =  GraphqlServerAccess | ExpressServerAccess

type MiddlewareResult = {
    error?: ExpressErrorResponse
    success: boolean,
}

interface UserTokenOutput {
    _id: string // token id
    user_id: string
    client_id?: string
    issuer?: string
}

interface AccessRequestToken extends UserTokenOutput {
    token_type: ITokenType
}

type UserToken<Token extends UserTokenOutput | undefined, Type extends ITokenType = ITokenType> = {
    user: UserDocument
    token: Token
    token_type: Type
}

export type ValidUserToken = 
| UserToken<ApiKeyTokenOutput, "ApiKey">
| UserToken<AccessTokenJWTPayload, "Bearer">
| UserToken<undefined, "Basic">

export type CaptchaOptions = {
    enabled: boolean
    type: string
    domains: string[]
    site_key: string
    secret_key: string
}

export type CaptchaResponse = {
    success: boolean,       // whether this request was a valid reCAPTCHA token for your site
    score: number,          // the score for this request (0.0 - 1.0)
    enabled: boolean,       // whether the user has disabled captcha
    action: string,         // the action name for this request (important to verify)
    challenge_ts: string,   // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
    hostname: string,       // the hostname of the site where the reCAPTCHA was solved
    'error-codes': string[] // optional
}

export const upsertRouterDocs = async function (routers: IExpressRouter[] | IGraphqlRouter[], pack: Packages) {
    const _promsises = []

    for(const _router of routers) {
        const access_input: UserAccessInput = {
            pack: pack,
            version: getPackageVersion(pack),
            server: _router.server,
            access: _router.options ? _router.options : undefined
        }
        
        const query = UserAccessModel.findOneAndUpdate(
            {
                version: access_input.version,
                "server.path": access_input.server.path,
                "server.serverMethod": access_input.server.serverMethod,
                "server.serverType": access_input.server.serverType
            },
            access_input,
            { upsert: true, new: false }
        )
        
        _promsises.push(query.exec())
    }

    const res = await Promise.all(_promsises)
    return res
}

export const applyMiddlewareToGraphqlModule = function (module: GraphqlResovlerModule) {
    const resolvers: GraphqlResovlerMethod = {}

    for(const [k1, v1] of Object.entries(module)) {
        if(!v1) continue
        for(const [k2, v2] of Object.entries(v1)) {
            if(!v2) continue
            
            const resolver_name_l1 = k1 as string
            const resolver_name_l2 = k2 as string
            const resolver = v2
            var resolver_method = resolver.resolve
            const resovler_access = resolver.access
            
            if( resolver_method == undefined 
                || resolver_method == null 
                || typeof resolver_method !== 'function'
            ) continue

            if(resovler_access) {
                const new_resolver_method = async (parent: any, args: any, context: AccessRequest, info: any) => {
                    const res = await middleware.graphql(context, resovler_access)
                    const result = await resolver.resolve(parent, args, context, info)
                    if(result instanceof Error) throw result
                    return result
                }
                resolver_method = new_resolver_method
            }
            
            resolvers[resolver_name_l1] = {
                ...resolvers[resolver_name_l1],
                [resolver_name_l2]: resolver_method
            }
        }
    }
    return resolvers
}

export const middleware = {
    api: (options: IAccessOptions, catchResult: boolean = false): ExpressRequestHandler => {
        return async (req, res, next) => {
            req.middleware = await middlewares(req, options)

            if(!catchResult && !req.middleware.success) {
                const response: ExpressResponse = {
                    error: req.middleware.error,
                    data: undefined
                }
                res.send(response)
            }else {
                next()
            }
        }
    },
    graphql: async (context: AccessRequest, options: IAccessOptions, catchResult: boolean = false) => {
        context.middleware = await middlewares(context, options)
        if(!catchResult && !context.middleware.success) throw context.middleware.error?.msg
    }
}

export async function middlewares( req: AccessRequest, options: IAccessOptions ): Promise<MiddlewareResult> {
    let error = "unknown-error"
    let msg = "unknown-error"

    try {
        error = "invalid-req-id"
        req.id = req.id || new mongoose.Types.ObjectId()

        error = "invalid-log"
        await log(req, options)

        error = "access-disabled"
        await disabled(req, options)

        error = "invalid-limit"
        if(options.limit?.enabled == true) throw `Limit, limit is not supported yet`

        error = "invalid-auth"
        await auth(req, options)

        error = "invalid-captcha"
        await captcha(req, options)

        if(req.log) await req.log.addInfo(`middleware-ok`)
        return  { success: true }
    } catch (err) {
        if(req.log) await req.log.addInfo(error, `${err}`)
        return  { success: false, error: { code: error, msg: `${err}` } }
    }
}

export function getResourceInfo( options: IAccessOptions | undefined ): string {
    if(!options) return ''
    return `${options.resource}.${options.action}.`
}

async function log( req: AccessRequest, options: IAccessOptions ): Promise<void> {
    if(options.log?.enabled == false) return

    const device: UserDevice = {
        ip_address: `${req.headers['x-forwarded-for']}` || req.ip || "",
        agent: req.headers['user-agent']
    }

    // resolve user_access id
    const user_access = await UserAccessModel.findOne({
        'version': getPackageVersion(options.pack),
        'pack': options.pack,
        'access.resource': options.resource,
        'access.action': options.action
    })
    
    const log_input: UserAccessLogInput = {
        req_id: req.id,
        device,
        access: (user_access) ? undefined : options,
        access_id: user_access?._id
    }

    const log = new UserAccessLogModel(log_input)
    req.log = await log.save()
}

async function disabled( req: AccessRequest, options: IAccessOptions ): Promise<void> {
    if(options.enabled == false)
        throw `Access to resource ${getResourceInfo(options)} is disabled`
}

export async function auth( req: AccessRequest, options: IAccessOptions ): Promise<void> {
    // show warning if user set auth.enabled to false
    if(options.auth?.enabled == false) {
        console.log(`WARNING, authentification disabled for ${getResourceInfo(options)}`)
        if(req.log) await req.log.addInfo(`auth-disabled`)
        return
    }

    // authentification by default is disabled
    if(options.auth?.enabled == undefined) return

    // already authentificated
    if(req.user && req.token) return

    const {user, token, token_type} = await validateUserToken(req, options)
    req.user = user

    if(!token){
        req.token = undefined
    }else{
        req.token = {
            _id: token._id,
            user_id: token.user_id,
            token_type
        }
    }

    if(req.log) {
        req.log.user = {
            id: user._id,
            token_id: token?._id,
            token_type,
        }
        await req.log.save()
    }

    // user key should have access to resource
    if(token_type == "ApiKey") {
        const validator = new AccessValidator(token.data.access)
        if(!validator.checkAccess(options))
            throw `Auth, user apikey has insuficient permission access to resource: ${getResourceInfo(options)}`
    } else if(token_type == "Bearer") {
        const app = await OauthAppModel.findOne({ "data.client_id": token.client_id })
        if(!app)
            throw `Auth, Bearer app:${token.client_id} not found`
        const validator = new AccessValidator(app.data.access)
        if(!validator.checkAccess(options))
            throw `Auth, user app: ${token.client_id} has insuficient permission access to resource: ${getResourceInfo(options)}`
    
    } else if(token_type == "Basic") {
        // do nothing
    } else {
        throw `Auth, undefined auth key`
    }
}

// middleware for validating captcha request
async function captcha(req: AccessRequest, options: IAccessOptions): Promise<CaptchaResponse> {
    return new Promise<CaptchaResponse>((resolve, reject) => {
        req.captcha = {
            success: false,
            enabled: false,
            score: 0,
            action: '',
            challenge_ts: '',
            hostname: '',
            'error-codes': [`Captcha, is disabled for resource ${getResourceInfo(options)}`]
        }

        if(options?.captcha == undefined || options.captcha.enabled == false) return resolve(req.captcha)
        const type = options.captcha.type
        const pack = options.captcha.pack
        const token = req.headers['x-captcha-token']
        const captcha_options = global.tsapp[pack].config.captcha.ACTIVE
        const captcha_config = Object.values<CaptchaOptions>(captcha_options).find((c) => c.type == type)

        if(captcha_config == undefined) throw `Captcha, is undefined, please define captcha config for resource ${getResourceInfo(options)}`

        const is_enabled = captcha_config.enabled as boolean
        if( is_enabled == false ) return resolve(req.captcha)
        
        if(!token || typeof token !== 'string') throw "Captcha, token x-captcha-token was not found in request headers"

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${captcha_config.secret_key}&response=${token}`
        fetch(url, {
            method: 'POST',
        })
        .then(res => res.json())
        .then(async json => {
            json = {...json, enabled: true } as CaptchaResponse

            if(req.log) {
                req.log.captcha = json
                await req.log.save()
            }

            if( json.success ) {
                req.captcha = json
                resolve(json)
            } else {
                reject(`Error, Captcha, ${json['error-codes']}`)
            }
        })
        .catch(err => {
            reject(err)
        })
    })
}

// Validates user provided token
export async function validateUserToken( req: Request, options?: IAccessOptions): Promise<ValidUserToken> {
    var authParamKeyName = undefined

    if(options?.auth?.authParamKeyName) {
        authParamKeyName = req.params[options.auth?.authParamKeyName]
    }

    const auth_header = authParamKeyName || req?.headers?.authorization
    if( !auth_header ) throw `Auth, Authorization header or parametre is not set`

    let auth: string[] = []
    for (const delimiter of [" ", ":", "%20"]) {
        auth = auth_header.split(delimiter)
        if (auth.length === 2) break
    }
    
    if( auth.length != 2 ) throw `Auth, Invalid authorization delemetre`

    const auth_type = auth[0] as ITokenType
    const auth_token = auth[1]
    
    if(options) {
        if(!options?.auth?.tokens)
            throw `Auth, authTypes is undefined for resource: ${getResourceInfo(options)}`

        // check auth type for resource if set
        if(!options.auth?.tokens.includes(auth_type))
            throw `Auth, type: ${auth_type} not allowed for resource: ${getResourceInfo(options)}`
    }

    let valid_user_key: ValidUserToken
    
    // check auth key validity
    switch (auth_type) {
        case "ApiKey":
            valid_user_key = await validateApiKey(auth_token)
        break
        case "Bearer":
            valid_user_key = await validateBearerKey(auth_token)
        break
        case "Basic":
            valid_user_key = await validateBasicKey(auth_token)
        break
        default:
            console.log(`
                WARNING, Auth, type ${auth_type} can't be used by authorizadion middleware, 
                if you wish to disable auth validation set isAuthorizationEnabled: true for: 
                resource: ${options?.resource}
                path: ${getResourceInfo(options)}'
                req.url: ${req.url}
                req.method: ${req.method}
            `)
            throw `Auth, type ${auth_type} not valid auth type, for more info see logs`
    }

    req.user = valid_user_key.user
    return valid_user_key
}

export const validateBasicKey = async ( base64: string ): Promise<ValidUserToken> => {
    const [usn, psw] = Buffer.from(base64, 'base64').toString().split(':')
    const user = await UserModel.findOne({ usn })
    if(!user) throw "user not found"
    const match = secretCompare(psw, user.psw)
    if(!match) throw "invalid password"
    return { user, token: undefined, token_type: "Basic" }
}

export const validateApiKey = async ( base64: string ): Promise<ValidUserToken> => {
    const { _id, secret } = decodeApiKey(base64)
    const token = await ApiKeyTokenModel.findOne({_id})
    if(!token) throw "api key not found"
    if(!compareApiKey(secret, token)) throw "invalid api key"
    const user = await UserModel.findOne({ _id:token.user_id })
    if(!user) throw "user not found"
    return { user, token: token.toJSON(), token_type: "ApiKey" }
}

export const validateBearerKey = async ( access_token: string, options: BearerKeyOptions = {} ): Promise<ValidUserToken> => {
    const access_jwk = await JWKCache.get<AccessTokenJWKData>(access_token_config_id)
    const issuer = env.SERVER_DOMAIN_NAME
    const access_token_key = await jose.importJWK(access_jwk.key)
    const verified_access_token = await jose.jwtVerify(access_token, access_token_key, { issuer }) as AccessTokenPayloadVerified
    const extendedTime = options.accessTokenExtendTime || access_jwk.data.extendTime

    if(!verified_access_token.payload.iat) throw "Access token iat not set"
    const issuedAt = moment.unix(verified_access_token.payload.iat)
    if(addTimeDuration(issuedAt, extendedTime).unix() < moment.utc().unix()) throw "Access token expired"
    
    const user = await UserModel.findOne({ _id: verified_access_token.payload.user_id })
    if(!user) throw "user not found"
    return { user, token: verified_access_token.payload, token_type: "Bearer" }
}