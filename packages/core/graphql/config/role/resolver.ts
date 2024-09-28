import { RoleConfigModel } from "@typestackapp/core/models/config/role"
import { GraphqlRouter, IResolvers, TSA } from "@typestackapp/core"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"

const config = TSA.config["@typestackapp/core"]
export const router = new GraphqlRouter<IResolvers<AccessRequest>>()

router.resolvers.Query.getAllRoles = {
    access: config.access.ACTIVE.RoleConfig.getAllRoles,
    resolve: async (parent, args, context, info) => RoleConfigModel.find()
}