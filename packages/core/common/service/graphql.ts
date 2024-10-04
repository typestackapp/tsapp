import compression from 'compression'
import express from 'express'
import { TSA } from "@typestackapp/core"

TSA.init().then( async () => {
    const { upsertRouterDocs } = await import("@typestackapp/core/models/user/access/middleware")
    const { graphqlLoader } = await import("@typestackapp/core/common/service/loaders/graphql")
    const app = express().use(compression())
    const server = app.listen({ port: 8002 })

    // load graphql routers
    const {docs, router} = await graphqlLoader(server)
    app.use(router)

    // update router docs in db
    upsertRouterDocs(docs, '@typestackapp/core')
})