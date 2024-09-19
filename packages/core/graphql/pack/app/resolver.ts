import { GraphqlRouter, TSA } from "@typestackapp/core"
import { IResolvers } from "@typestackapp/core"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"

const config = TSA.config["@typestackapp/core"]
export const router = new GraphqlRouter<IResolvers<AccessRequest>>()

