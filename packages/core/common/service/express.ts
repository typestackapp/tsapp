import { TSA, packages, Packages, ExpressRouter, IExpressRouter, ExpressResponse } from "@typestackapp/core"
import { tsapp } from "@typestackapp/core/env"
import express from "express"

TSA.init().then(async () => {
    const { middleware, upsertRouterDocs } = await import("@typestackapp/core/models/user/access/middleware")
    const app = express()
    app.use(express.json({ limit: "100mb" }))
    app.use(express.urlencoded({ extended: true , limit: "100mb" }))
    const router = express.Router()
    const router_docs: Map<Packages, IExpressRouter[]> = new Map()
    
    for (const pack_key of Object.keys(packages) as Packages[]) {
        const _root = `${process.cwd()}/node_modules/${pack_key}/express/`

        const routers = new ExpressRouter()
        const _routers = await routers.loadExpressRoutes(_root, pack_key, `/api`).catch(error => {
            console.log(`ERROR while loading api routes from pack: ${pack_key}: ${error}`)
            return []
        })

        // add api middleware at the begining of each router
        for(const _router of _routers) {
            // wrap each handler with try catch and return ErrorResponse if one off handler throws error
            for(const [index, handler] of _router.handlers.entries()) {
                _router.handlers[index] = async (req, res, next) => {
                    try {
                        await handler(req, res, next)
                    } catch (error) {
                        const response: ExpressResponse = {
                            error: { code: `unknown`, msg: `Error ${_router.options?.resourceAction}:${index} , ${error}`}
                        }
                        res.send(response)
                    }
                }
            }
            if(_router.options) _router.handlers.unshift(middleware.api(_router.options))
        }

        // register routers
        routers.register(router, _routers)
        router_docs.set(pack_key, _routers)
    }

    app.use(router)
    app.listen(8000)

    // upsert router docs
    for (const [pack_key, router] of router_docs) {
        await upsertRouterDocs(router, pack_key)
    }
})
.finally(() => {
    // CONSOLE LOG SERVER INFO
    console.log(`------------------API SERVER INFO---------------------`)
    console.log(`SERVER :  https://${tsapp.env.TSAPP_DOMAIN_NAME}/api`)
    console.log(`------------------------------------------------------`)
})