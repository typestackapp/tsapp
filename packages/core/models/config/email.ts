import SMTPTransport from "nodemailer/lib/smtp-transport"
import { ConfigModel, ConfigInput } from "."
import { Model, Schema, Document } from 'mongoose'
import { Address } from "nodemailer/lib/mailer"
import { MongooseDocument } from "@typestackapp/core/models/util"

export const pack = "@typestackapp/core"
export const type = "EmailConfig"
export const discriminator = `${pack}:${type}`

export interface EmailConfigInput extends ConfigInput {
    data: {
        from: Address
        auth: SMTPTransport | SMTPTransport.Options | string
    }
}

export type EmailConfigDocument = EmailConfigInput & MongooseDocument & {
    pack: typeof pack
    type: typeof type
}

const emailConfigSchema = new Schema({
    pack: { type: String, required: true, index: true, default: pack, immutable: true },
    type: { type: String, required: true, index: true, default: type, immutable: true },
    data: {
        from: { type: Schema.Types.Mixed, required:true, index: true },
        auth: { type: Schema.Types.Mixed, required:true, index: true }
    }
})

export const EmailConfigModel = ConfigModel.discriminator<EmailConfigDocument>(discriminator, emailConfigSchema) 