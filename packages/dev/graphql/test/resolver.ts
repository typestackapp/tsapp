import { GraphqlContext, GraphqlRouter } from "@typestackapp/core"
import { IResolvers } from "@typestackapp/devcodegen/admin"
import { TSA } from "@typestackapp/core"

export const router = new GraphqlRouter<IResolvers<GraphqlContext>>()

router.resolvers.Query.getPing = {
    access: TSA.config["@typestackapp/dev"].access.ACTIVE.Test.getPing,
    resolve: async (parent, args, context, info) => true
}