import { Packages, TSA } from "@typestackapp/core";
import mongoose, { ObjectId, Schema, Types } from "mongoose"

export interface UserInfoInput<TData> {
    data: TData
}

export interface UserInfoDocument<TData> extends mongoose.Document, UserInfoInput<TData> {
    pack: Packages
    type: string
    createdAt: Date
    updatedAt: Date
}

export const userInfoSchema = new Schema<UserInfoDocument<any>>({
    data: { type: Schema.Types.Mixed, index: true }
}, { timestamps: true, discriminatorKey: 'pack' })

export const UserInfoModel = TSA.db["@typestackapp/core"].mongoose.core.model<UserInfoDocument<any>>("user_info", userInfoSchema)