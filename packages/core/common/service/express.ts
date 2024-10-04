import { TSA } from "@typestackapp/core"
import express from "express"

TSA.init().then(async () => {
    const { upsertRouterDocs } = await import("@typestackapp/core/models/user/access/middleware")
    const { expressLoader } = await import("@typestackapp/core/common/service/loaders/express")

    const app = express()
    const server = app.listen({port: 8000})
    app.use(express.json({ limit: "100mb" }))
    app.use(express.urlencoded({ extended: true , limit: "100mb" }))

    // load express routers
    const {docs, router} = await expressLoader(server)
    app.use(router)

    // update router docs in db
    for (const [pack_key, router] of docs) {
        upsertRouterDocs(router, pack_key)
    }
})