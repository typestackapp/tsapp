import { Options } from "amqplib"
import { Schema, Document, Model } from "mongoose"
import { ConfigInput, ConfigModel } from "."
import { ConsumerInput, consumerSchema } from "./consumer"
import { Packages } from "@typestackapp/core"

export const pack = "@typestackapp/core"
export const type = "ChannelConfig"
export const discriminator = `${pack}:${type}`

export type ChannelOptions = {
    channel?: {
        prefetch?: { // max count of messages to be processed at the same time for:
            channel?: number, // single channel
            global?: number // all channels
        }
    },
    queue?: Options.AssertQueue // queue options
    publish?: Options.Publish // publish to queue options
}

export interface ChannelConfigInput extends ConfigInput {
    data: {
        options?: ChannelOptions,
        consumers: ConsumerInput[]
        services: string[] // start all queue consumers on these services
        pack: Packages // consumer package
        type: string // consumer type
        path: string // consumer path
    }
}

export interface ChannelConfigDocument extends ChannelConfigInput, Document {
    pack: typeof pack
    type: typeof type
}

const channelConfigSchema = new Schema({
    pack: { type: String, required: true, index: true, default: pack, immutable: true },
    type: { type: String, required: true, index: true, default: type, immutable: true },
    data: {
        services: { type: [String], required: true },
        options: { type: Schema.Types.Mixed, required: false },
        type: { type: String, required: true },
        consumers: { type: [consumerSchema], required: true },
        pack: { type: String, required: true, index: true },
        path: { type: String, required: true, index: true },
    }
})

export const ChannelConfigModel = ConfigModel.discriminator<ChannelConfigDocument>(discriminator, channelConfigSchema) 