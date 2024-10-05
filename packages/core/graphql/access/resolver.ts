import { GraphqlContext, GraphqlRouter, IResolvers, TSA } from "@typestackapp/core"

const access = TSA.config["@typestackapp/core"].access.ACTIVE
export const router = new GraphqlRouter<IResolvers<GraphqlContext>>()

router.resolvers.Query.getAllAccessConfigs = {
    access: access.Access.getAllAccessConfigs,
    resolve: async (parent, args, context, info) => TSA.package.access
}