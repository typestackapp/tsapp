import { Types, Schema, Document, Model } from "mongoose"
import { IUserInput, IUserDocument as IUserDocument } from "@typestackapp/core"
import { accessSchema, AccessDocument } from '@typestackapp/core/models/user/access'
import { RoleConfigDocument, RoleConfigModel } from "@typestackapp/core/models/config/role"
import { GraphqlServerConfig } from '../../common/service'
import { checkRolesAccessToGraphqlService } from "@typestackapp/core/models/user/access/util"

export type UserInput = IUserInput

export type UserDocument = IUserDocument & Document<Types.ObjectId> & {
    haveAccessToGraphqlService(options: GraphqlServerConfig): Promise<{user: UserDocument, roles: RoleConfigDocument[]}>
}

export const userSchema = new Schema<UserDocument, Model<UserDocument>, UserDocument>({
    usn: { type: String, required: true, unique: true, index: true },
    psw: { type: String, required: true },
    roles: { type: [String], required: true, index: true }
},{ timestamps:true })

userSchema.methods.haveAccessToGraphqlService = async function(options: GraphqlServerConfig) {
    const user = this as unknown as UserDocument
    // search if user.roles is in RoleConfigModel
    const roleConfigs = await RoleConfigModel.find({ "data.name": { $in: user.roles } })
    if (!roleConfigs || roleConfigs.length === 0) throw `Role ${user.roles.toString()} not found`
    await checkRolesAccessToGraphqlService(roleConfigs, options)
    return { user, roles: roleConfigs }
}

export const UserModel = global.tsapp["@typestackapp/core"].db.mongoose.core.model('users', userSchema, "users")