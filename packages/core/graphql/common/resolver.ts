import { GraphqlContext, GraphqlRouter } from "@typestackapp/core"
import { IResolvers } from "@typestackapp/core"
import { TSA } from "@typestackapp/core"

export const router = new GraphqlRouter<IResolvers<GraphqlContext>>()

