import { GraphqlRouter } from "@typestackapp/core"
import { IResolvers } from "@typestackapp/core"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"
const { config } = global.tsapp["@typestackapp/core"]

export const router = new GraphqlRouter<IResolvers<AccessRequest>>()

router.resolvers.Query.getPing = {
    access: config.access.ACTIVE.Test.getPing,
    resolve: async (parent, args, context, info) => true
}