import { GraphqlRouter } from "@typestackapp/core"
import { UserModel } from "@typestackapp/core/models/user"
import { getCurrentUser, getUser } from "./schema"
import { IResolvers } from "@typestackapp/core"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"
import { RoleConfigModel } from "@typestackapp/core/models/config/role"
const { config } = global.tsapp["@typestackapp/core"]

export const router = new GraphqlRouter<IResolvers<AccessRequest>>({
    keys: ["UserOutput"],
})

router.resolvers.Query.getCurrentUser = {
    typedef: getCurrentUser,
    access: config.access.ACTIVE.User.getCurrentUser,
    resolve: async (parent, args, context, info) => {
        if(!context.user) return null
        return { ...context.user.toJSON(), role: null }
    }
}

router.resolvers.Query.getUser = {
    typedef: getUser,
    access: config.access.ACTIVE.User.getUser,
    resolve: async (parent, args, context, info) => {
        if(!args?.id) throw `Args, undefined user id`
        const user = await UserModel.findById(args.id)
        if(!user) return null
        return { ...user.toJSON(), role: null }
    }
}

router.resolvers.UserOutput.role = {
    access: config.access.ACTIVE.User.getUserRole,
    resolve: async (parent, args, context, info) => {
        if(!context.user) return null
        const role = await RoleConfigModel.findOne({ "data.name": context.user.role })
        if(!role) return null
        return role.toJSON()
    }
}