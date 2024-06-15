import { IRoleConfigInput } from "@typestackapp/core"
import { accessSchema } from "@typestackapp/core/models/user/access"
import { ConfigModel, ConfigInput } from "@typestackapp/core/models/config"
import { Model, Schema, Document } from 'mongoose'
import { MongooseDocument } from "@typestackapp/core/models/util"

export const pack = "@typestackapp/core"
export const type = "RoleConfig"
export const discriminator = `${pack}:${type}`

export type RoleConfigInput = IRoleConfigInput

export type RoleConfigDocument = RoleConfigInput & MongooseDocument & {
    type: typeof type
    pack: typeof pack
}

const roleConfigSchema = new Schema({
    pack: { type: String, required: true, index: true, default: pack, immutable: true },
    type: { type: String, required: true, index: true, default: type, immutable: true },
    data: {
        name: { type: String, required:true, index: true },
        resource_access: { type: [accessSchema], required: true, index: true },
        graphql_access: { type: [Schema.Types.Mixed], required: true, index: true },
    }
})

// user_role is unique
roleConfigSchema.index({ "data.name": 1 }, { unique: true })

export const RoleConfigModel = ConfigModel.discriminator<RoleConfigDocument>(discriminator, roleConfigSchema) 