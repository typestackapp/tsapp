import { GraphqlRouter, IResolvers, TSA } from "@typestackapp/core"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"

const access = TSA.config["@typestackapp/core"].access.ACTIVE
export const router = new GraphqlRouter<IResolvers<AccessRequest>>()

router.resolvers.Query.getAllAccessConfigs = {
    access: access.Access.getAllAccessConfigs,
    resolve: async (parent, args, context, info) => TSA.package.access
}