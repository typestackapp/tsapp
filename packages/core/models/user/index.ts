import { Types, Schema, Document, Model } from "mongoose"
import { IUserInput, IUserDocument as IUserDocument } from "@typestackapp/core"
import { accessSchema, AccessDocument } from '@typestackapp/core/models/user/access'
import { RoleConfigDocument, RoleConfigModel } from "@typestackapp/core/models/config/role"
import { GraphqlServerConfig } from '@typestackapp/core/common/server'
import { checkRoleAccessToGraphqlService } from "@typestackapp/core/models/user/access/util"

export type UserInput = IUserInput

export type UserDocument = IUserDocument & Document<Types.ObjectId> & {
    haveAccessToGraphqlService(options: GraphqlServerConfig): Promise<{user: UserDocument, role: RoleConfigDocument}>
}

export const userSchema = new Schema<UserDocument, Model<UserDocument>, UserDocument>({
    name: { type: String, required: true, unique: true, index: true },
    psw: { type: String, required: true },
    role: { type: String, required: true, index: true }
},{ timestamps:true })

userSchema.methods.haveAccessToGraphqlService = async function(options: GraphqlServerConfig) {
    const user = this as unknown as UserDocument
    const roleConfig = await RoleConfigModel.findOne({ "data.name": user.role })
    if (!roleConfig) throw `Role ${user.role} not found`
    await checkRoleAccessToGraphqlService(roleConfig, options)
    return { user, role: roleConfig }
}

export const UserModel = global.tsapp["@typestackapp/core"].db.mongoose.core.model('users', userSchema, "users")