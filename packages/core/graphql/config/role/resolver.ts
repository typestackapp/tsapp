import { RoleConfigModel } from "@typestackapp/core/models/config/role"
import { GraphqlContext, GraphqlRouter, IResolvers, TSA } from "@typestackapp/core"

const config = TSA.config["@typestackapp/core"]
export const router = new GraphqlRouter<IResolvers<GraphqlContext>>()

router.resolvers.Query.getAllRoles = {
    access: config.access.ACTIVE.RoleConfig.getAllRoles,
    resolve: async (parent, args, context, info) => RoleConfigModel.find()
}