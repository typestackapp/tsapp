
import { randomSecret, secretCompare, secretHash } from "@typestackapp/core/models/user/access/util"
import { UserDocument, UserModel } from "@typestackapp/core/models/user"
import { BearerTokenModel, BearerTokenInput, BearerTokenDocument } from "@typestackapp/core/models/user/token/bearer"
import { ApiKeyTokenDocument } from "@typestackapp/core/models/user/token/apikey"
import { access_token_config_id, refresh_token_config_id } from "@typestackapp/core/models/update/main"
import { AccessTokenJWKData, RefreshTokenJWKData, JWKCache } from "@typestackapp/core/models/config/jwk"
import * as jose from 'jose'
import moment, { unitOfTime } from "moment"
import mongoose, { Types } from "mongoose"
import { tsapp } from "@typestackapp/core/env"
import { GrantType, OauthAppModel } from "@typestackapp/core/models/user/app/oauth"
import { TokenStatus } from "@typestackapp/core/models/user/token"

// returns a random secret
export function newApiKeySecret() {
    return randomSecret(40)
}

// hashses secret to be stored in db as key
export function hashApiKey(secret: string): string {
    return secretHash(secret)
}

// encodes api key and _id to be used in authorization header
export function encodeApiKey(_id: Types.ObjectId, key: string) {
    return Buffer.from(`${_id}:${key}`).toString('base64')
}

// decodes api key and _id from authorization header
export function decodeApiKey(base64: string): { _id: Types.ObjectId, secret: string } {
    const [ _id, secret ] = Buffer.from(base64, 'base64').toString().split(':')
    return {
        _id: new Types.ObjectId(_id),
        secret
    }
}

export function compareApiKey(secret: string, apiKey: ApiKeyTokenDocument){
    return secretCompare(secret, apiKey.data.key)
}

export type BearerKeyOptions = {
    _id?: mongoose.Types.ObjectId // custom mongo id
    time?: moment.Moment // overwrite current time
    issuer?: string // custom issuer

    refreshTokenRenewBefore?: string // time in which refresh token can be refreshed before it expires
    refreshTokenRenewAfter?: string // time in which refresh token can be refreshed after it expires
    refreshTokenExtendTime?: string // time in which refresh token will expire 
    refreshTokenExtendLifetime?: boolean // should refresh token lifetime be extended

    accessTokenExtendTime?: string // time in which access token will expire
    accessTokenRenewBefore?: string // time in which access token can be refreshed before it expires

    status?: TokenStatus
}

export interface OauthTokenPayload {
    _id: string
    user_id: string
    client_id: string
    issuer: string
}

export interface Token {
    tk: string
    exp: string
}

export interface BearerToken {
    access: Token
    refresh?: Token
}

export interface RefreshTokenPayload extends OauthTokenPayload {}
export interface AccessTokenPayload extends OauthTokenPayload {}
export interface RefreshTokenJWTPayload extends jose.JWTPayload, RefreshTokenPayload {}
export interface AccessTokenJWTPayload extends jose.JWTPayload, AccessTokenPayload {}

export interface RefreshTokenPayloadVerified {
    payload: RefreshTokenJWTPayload
    protectedHeader: jose.CompactJWEHeaderParameters
}

export interface AccessTokenPayloadVerified {
    payload: AccessTokenJWTPayload
    protectedHeader: jose.CompactJWEHeaderParameters
}

export function addTimeDuration(time: moment.Moment, duration: string): moment.Moment {
    var _time = time.clone()
    var _num = duration.match(/\d+/g) as string[]
    var _letr =  duration.match(/[a-zA-Z]+/g) as string[]
    var letr = _letr[0] as unitOfTime.DurationConstructor
    return _time.add(moment.duration(_num[0], letr ))
}

export function removeTimeDuration(time: moment.Moment, duration: string): moment.Moment {
    var _time = time.clone()
    var _num = duration.match(/\d+/g) as string[]
    var _letr =  duration.match(/[a-zA-Z]+/g) as string[]
    var letr = _letr[0] as unitOfTime.DurationConstructor
    return _time.subtract(moment.duration(_num[0], letr ))
}

export async function newRefreshToken(user: UserDocument, client_id: string, grant_type: GrantType, options: BearerKeyOptions)
: Promise<{doc: BearerTokenDocument, output: Required<BearerToken>, token_payload: OauthTokenPayload}> 
{
    const utc_time = options.time || moment.utc()
    const access_jwk = await JWKCache.get<AccessTokenJWKData>(access_token_config_id)
    const refresh_jwk = await JWKCache.get<RefreshTokenJWKData>(refresh_token_config_id)
    const refresh_token_key = await jose.importJWK(refresh_jwk.key)
    const access_token_key = await jose.importJWK(access_jwk.key)
    const token_id = options._id || new mongoose.Types.ObjectId()
    const issuer = options.issuer || tsapp.env.TSAPP_DOMAIN_NAME
    const status = options.status || "active"

    const refreshTokenExtendTime = options.refreshTokenExtendTime || refresh_jwk.data.extendTime
    const refreshTokenRenewAfter = options.refreshTokenRenewAfter || refresh_jwk.data.renewAfter
    const refreshTokenRenewBefore = options.refreshTokenRenewBefore || refresh_jwk.data.renewBefore
    const refreshTokenExtendLifetime = options.refreshTokenExtendLifetime || refresh_jwk.data.extendLifeTime

    const accessTokenExtendTime = options.accessTokenExtendTime || access_jwk.data.extendTime
    const accessTokenRenewBefore = options.accessTokenRenewBefore || access_jwk.data.renewBefore

    // new expiration dates
    const rt_exp = addTimeDuration(utc_time, refreshTokenExtendTime).toDate()
    const at_exp = addTimeDuration(utc_time, accessTokenExtendTime).toDate()

    const app = await OauthAppModel.findOne({"data.client_id": client_id})
    if(!app) throw 'App not found'

    const token_payload: OauthTokenPayload = {
        _id: token_id.toString(),
        user_id: user._id.toString(),
        client_id,
        issuer
    }

    const refresh_token = await new jose.SignJWT({...token_payload})
    .setProtectedHeader({ alg: refresh_jwk.data.headerAlg })
    .setIssuedAt(utc_time.unix())
    .setIssuer(issuer)
    .sign(refresh_token_key)

    const access_token = await new jose.SignJWT({...token_payload})
    .setProtectedHeader({ alg: access_jwk.data.headerAlg })
    .setIssuedAt(utc_time.unix())
    .setIssuer(issuer)
    .sign(access_token_key)
    
    const token: Required<BearerToken> = {
        refresh: {
            tk: refresh_token,
            exp: rt_exp.toISOString()
        },
        access: {
            tk: access_token,
            exp: at_exp.toISOString()
        }  
    }

    const key_input: BearerTokenInput = {
        _id: token_id,
        app_id: app._id,
        status,
        user_id: user._id,
        data: {
            grant_type,
            access: app.data.access,
            issuer,
            token
        }
    }

    const token_doc = new BearerTokenModel(key_input)
    await token_doc.save()

    return {
        doc: token_doc,
        token_payload,
        output: token
    }
}

export async function newAccessToken( refresh_token: string, access_token: string, options: BearerKeyOptions )
: Promise<{output: Required<BearerToken>, token_payload: OauthTokenPayload}> 
{
    const utc_time = options.time || moment.utc()
    const access_jwk = await JWKCache.get<AccessTokenJWKData>(access_token_config_id)
    const refresh_jwk = await JWKCache.get<RefreshTokenJWKData>(refresh_token_config_id)
    const refresh_token_key = await jose.importJWK(refresh_jwk.key)
    const access_token_key = await jose.importJWK(access_jwk.key)
    const issuer = options.issuer || tsapp.env.TSAPP_DOMAIN_NAME

    const refreshTokenExtendTime = options.refreshTokenExtendTime || refresh_jwk.data.extendTime
    const refreshTokenRenewAfter = options.refreshTokenRenewAfter || refresh_jwk.data.renewAfter
    const refreshTokenRenewBefore = options.refreshTokenRenewBefore || refresh_jwk.data.renewBefore
    const refreshTokenExtendLifetime = options.refreshTokenExtendLifetime || refresh_jwk.data.extendLifeTime

    const accessTokenExtendTime = options.accessTokenExtendTime || access_jwk.data.extendTime
    const accessTokenRenewBefore = options.accessTokenRenewBefore || access_jwk.data.renewBefore

    // new expiration dates
    const rt_exp = addTimeDuration(utc_time, refreshTokenExtendTime).toDate()
    const at_exp = addTimeDuration(utc_time, accessTokenExtendTime).toDate()

    // decode tokens
    const verified_refresh_token = await jose.jwtVerify(refresh_token, refresh_token_key, {issuer}) as RefreshTokenPayloadVerified
    const verified_access_token = await jose.jwtVerify(access_token, access_token_key, {issuer}) as AccessTokenPayloadVerified

    // checck if both tokens has same user_id and _id and client_id
    if(verified_refresh_token.payload.user_id != verified_access_token.payload.user_id) throw 'Invalid refresh token'
    if(verified_refresh_token.payload._id != verified_access_token.payload._id) throw 'Invalid refresh token'
    if(verified_refresh_token.payload.client_id != verified_access_token.payload.client_id) throw 'Invalid refresh token'

    // get user and key docs
    const user_doc = await UserModel.findById(verified_refresh_token.payload.user_id)
    if(!user_doc) throw 'User not found'
    const token_doc = await BearerTokenModel.findById(verified_refresh_token.payload._id)
    if(!token_doc) throw 'Key not found'
    if(!["active", "initilized"].includes(token_doc.status)) throw `key status: ${token_doc.status} is not valid`

    if(verified_refresh_token.payload.iat == undefined) throw 'Refresh token iat is undefined'
    const RTiat = moment.unix(verified_refresh_token.payload.iat)
    const isRefreshTokenExpired = addTimeDuration(RTiat, refreshTokenExtendTime).unix() < utc_time.unix()
    const canRefreshTokenBeRenewedBefore = removeTimeDuration(RTiat, refreshTokenRenewBefore).unix() < utc_time.unix()
    const canRefreshTokenBeRenewedAfter = addTimeDuration(RTiat, refreshTokenRenewAfter).unix() > utc_time.unix()

    if(!token_doc.data) throw 'Key refresh token is undefined'

    if(!refreshTokenExtendLifetime && isRefreshTokenExpired) {
        throw 'Refresh token expired'
    } else if(refreshTokenExtendLifetime && (canRefreshTokenBeRenewedAfter || canRefreshTokenBeRenewedBefore)) {
        refresh_token = await new jose.SignJWT({...verified_refresh_token.payload})
        .setProtectedHeader({ alg: refresh_jwk.data.headerAlg })
        .setIssuedAt(utc_time.unix())
        .setIssuer(issuer)
        .sign(refresh_token_key)

        if(!token_doc.data.token.refresh) throw 'Refresh token is undefined'
        token_doc.data.token.refresh.exp = rt_exp.toISOString()
        token_doc.data.token.refresh.tk = refresh_token
    }

    if(verified_access_token.payload.iat == undefined) throw 'Access token iat is undefined'
    const ATiat = moment.unix(verified_access_token.payload.iat)
    const isAccessTokenExpired = addTimeDuration(ATiat, accessTokenExtendTime).unix() < utc_time.unix()
    const canAccessTokenBeRenewed = removeTimeDuration(ATiat, accessTokenRenewBefore).unix() < utc_time.unix()
    if(isAccessTokenExpired || canAccessTokenBeRenewed) {
        access_token = await new jose.SignJWT({...verified_access_token.payload})
        .setProtectedHeader({ alg: access_jwk.data.headerAlg })
        .setIssuedAt(utc_time.unix())
        .setIssuer(issuer)
        .sign(access_token_key)

        if(!token_doc.data.token.access) throw 'Access token is undefined'
        token_doc.data.token.access.exp = at_exp.toISOString()
        token_doc.data.token.access.tk = access_token
    }

    await token_doc.save()

    const token: Required<BearerToken> = {
        refresh: {
            tk: refresh_token,
            exp: rt_exp.toISOString()
        },
        access: {
            tk: access_token,
            exp: at_exp.toISOString()
        }
    }

    return {
        token_payload: verified_refresh_token.payload,
        output: token
    }
}