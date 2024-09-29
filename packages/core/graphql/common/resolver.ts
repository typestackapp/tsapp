import { GraphqlRouter } from "@typestackapp/core"
import { IResolvers } from "@typestackapp/core"
import { AccessRequest } from "@typestackapp/core/models/user/access/middleware"
import { TSA } from "@typestackapp/core"

export const router = new GraphqlRouter<IResolvers<AccessRequest>>()

