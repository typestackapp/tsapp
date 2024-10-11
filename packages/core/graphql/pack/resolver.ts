import { GraphqlContext, GraphqlRouter, IResolvers, Packages, TSA } from "@typestackapp/core"

const access = TSA.config["@typestackapp/core"].access.ACTIVE
export const router = new GraphqlRouter<IResolvers<GraphqlContext>>()

router.resolvers.Query.getAllPackageConfigs = {
    access: access.Pack.getAllPackageConfigs,
    resolve: async (parent, args, context, info) => 
        Object.entries(TSA.package.configs).map(([key, pack]) => {
        return {
            pack: key as Packages,
            ...pack
        }
    })
}