import { accessSchema } from "@typestackapp/core/models/user/access"
import { IAccessInput } from "@typestackapp/core/codegen/system"
import { TokenDefaults, TokenDocument, TokenInput, TokenModel } from "@typestackapp/core/models/user/token"
import { Schema, Model } from 'mongoose'
import { Serialize } from "@trpc/server/shared"

export const pack = "@typestackapp/core"
export const type = "UserApiKeyToken"
export const discriminator = `${pack}:${type}`

export interface ApiKeyTokenInput extends TokenInput {
    data: {
        key: string
        access: IAccessInput[]
        description: string | undefined
    }
}

export type ApiKeyTokenDefaults = TokenDefaults & {
    type: typeof type
    pack: typeof pack
}

export type ApiKeyTokenOutput = Omit<Serialize<ApiKeyTokenInput & ApiKeyTokenDefaults>, "_id" | "user_id"> & {
    _id: string
    user_id: string
}
export type ApiKeyTokenDocument = TokenDocument & ApiKeyTokenDefaults & ApiKeyTokenInput

const apiKeyTokenSchema = new Schema<ApiKeyTokenDocument, Model<ApiKeyTokenDocument>, ApiKeyTokenDocument>({
    pack: { type: String, required: true, index: true, default: pack, immutable: true },
    type: { type: String, required: true, index: true, default: type, immutable: true },
    data: {
        key: { type: String, required:true, index: true },
        access: { type: [accessSchema], required:true, index: true },
        description: { type: String, required:false, index: true },
    }
})

export const ApiKeyTokenModel = TokenModel.discriminator<ApiKeyTokenDocument>(discriminator, apiKeyTokenSchema) 