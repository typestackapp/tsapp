import { Packages } from "@typestackapp/core";
import { MongooseDocument } from "@typestackapp/core/models/util";
import { Schema, Types } from 'mongoose'

export interface MessageInput<TData> {
    data: TData
}

export interface MessageDocument<TData> extends MongooseDocument, MessageInput<TData> {
    pack: Packages
    type: string
    createdAt: Date
    updatedAt: Date
}

const messageSchema = new Schema<MessageDocument<any>>({
    data: { type:Schema.Types.Mixed, index:true },
},{ timestamps: true })

export const MessageModel = global.tsapp["@typestackapp/core"].db.mongoose.core.model<MessageDocument<any>>("messages", messageSchema)