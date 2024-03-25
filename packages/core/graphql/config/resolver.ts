import { ConfigModel } from "@typestackapp/core/models/config"
import { PipelineStage } from "mongoose"
import { GraphqlRouter, IResolvers } from "@typestackapp/core"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"
const { config } = global.tsapp["@typestackapp/core"]

export const router = new GraphqlRouter<IResolvers<AccessRequest>>()

router.resolvers.Query.searchConfigs = {
    access: config.access.ACTIVE.Config.searchConfigs,
    resolve: async (parent, args, context, info) => {
        // TODO check acces to config

        const text = args.search.text
        const limit = args?.search?.limit || 10
        const offset = args?.search?.offset || 0

        const query: PipelineStage[] = [
            { $match: { $text: { $search: text } } },
            { $addFields: { score: {$meta: "textScore"} } },
        ]

        const _total = await ConfigModel.aggregate([
            ...query,
            { $count: "total" },
        ])

        const total = _total[0].total
        const list = await ConfigModel.aggregate([
            ...query,
            { $sort: { score: { $meta: "textScore" } } },
            { $skip: offset },
            { $limit: limit },
        ])

        console.log(list)

        return { list, total }
    }
}

router.resolvers.Query.getConfig = {
    access: config.access.ACTIVE.Config.getConfig,
    resolve: async (parent, args, context, info) => {
        // TODO check acces to config
        return await ConfigModel.findById(args.id)
    }
}