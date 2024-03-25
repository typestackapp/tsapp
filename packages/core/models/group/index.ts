import { Packages } from "@typestackapp/cli/config"
import mongoose, { ObjectId, Schema, Types } from "mongoose"

export interface GroupInput<TData> {
    data: TData
}

export interface GroupDocument<TData> extends mongoose.Document, GroupInput<TData> {
    pack: Packages
    type: string
    createdAt: Date
    updatedAt: Date
}

export const groupSchema = new Schema<GroupDocument<any>>({
    data: { type: Schema.Types.Mixed, index: true }
}, { timestamps: true, discriminatorKey: 'pack' })

export const GroupModel = global.tsapp["@typestackapp/core"].db.mongoose.core.model<GroupDocument<any>>("groups", groupSchema)