import { accessSchema } from "@typestackapp/core/models/user/access"
import { IAccessInput } from "@typestackapp/core/codegen/admin"
import { TokenDefaults, TokenDocument, TokenInput, TokenModel } from "@typestackapp/core/models/user/token"
import { Schema, Model, Types } from 'mongoose'
import { Serialize } from "@trpc/server/shared"
import { GrantType, OauthAppModel } from "@typestackapp/core/models/user/app/oauth"
import { BearerToken, Token } from "@typestackapp/core/models/user/util"

export const pack = "@typestackapp/core"
export const type = "UserBearerToken"
export const discriminator = `${pack}:${type}`


export interface BearerTokenInputData {
    grant_type: GrantType
    issuer: string
    access: IAccessInput[]
    token: BearerToken
}

export interface BearerTokenInput extends TokenInput {
    app_id: Types.ObjectId
    data?: BearerTokenInputData
}

export type BearerTokenDefaults = TokenDefaults & {
    type: typeof type
    pack: typeof pack
}

export type BearerTokenOutput = Serialize<BearerTokenInput & BearerTokenDefaults>
export type BearerTokenDocument = TokenDocument & BearerTokenDefaults & BearerTokenInput & {
    getToken(): Promise<BearerToken>
}

const tokenSchema = new Schema<Token>({
    tk: { type: String, required: true, index: true },
    exp: { type: String, required: true, index: true },
}, { _id: false })

const bearerTokenDataSchema = new Schema<BearerTokenInputData>({
    grant_type: { type: String, required: true, index: true },
    issuer: { type: String, required: true, index: true },
    access: { type: [accessSchema], required: false, index: true },
    token: {
        access: { type: tokenSchema, required: true, index: true },
        refresh: { type: tokenSchema, required: false, index: true },
    }
}, { _id: false })

const bearerTokenSchema = new Schema<BearerTokenDocument, Model<BearerTokenDocument>, BearerTokenDocument>({
    pack: { type: String, required: true, index: true, default: pack, immutable: true },
    type: { type: String, required: true, index: true, default: type, immutable: true },
    app_id: { type: Schema.Types.ObjectId, index: true, required: true },
    data: { type: bearerTokenDataSchema, required: false, index: true },
})

bearerTokenSchema.methods.getToken = async function() {
    const token_doc = this as BearerTokenDocument
    if(!token_doc.data) throw new Error("Token data not found")

    const app = await OauthAppModel.findById(token_doc.app_id)
    if(!app) throw new Error("App not found")

    const client = await app.getClient()
    if(!client) throw new Error("Client not found")

    // check if token is expired
    const at_exp = new Date(token_doc.data.token.access.exp)
    const now = new Date()

    if(at_exp < now) {
        const fresh_token = await client.getToken({
            app: app.data,
            token: token_doc.data.token
        })
        token_doc.data.token = fresh_token
        await token_doc.save()
    }

    return token_doc.data.token
}

export const BearerTokenModel = TokenModel.discriminator<BearerTokenDocument>(discriminator, bearerTokenSchema) 