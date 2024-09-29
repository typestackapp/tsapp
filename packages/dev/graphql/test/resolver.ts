import { GraphqlRouter } from "@typestackapp/core"
import { IResolvers } from "@typestackapp/dev/codegen/system"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"
import { TSA } from "@typestackapp/core"

export const router = new GraphqlRouter<IResolvers<AccessRequest>>()

router.resolvers.Query.getPing = {
    access: TSA.config["@typestackapp/dev"].access.ACTIVE.Test.getPing,
    resolve: async (parent, args, context, info) => true
}