import { TSA, Packages, ExpressRouter, ExpressResponse, IExpressRouter } from "@typestackapp/core"
import { tsapp } from "@typestackapp/core/env"

import express from "express"
import http from "http"


export async function expressLoader(server: http.Server) {
    const { middleware } = await import("@typestackapp/core/models/user/access/middleware")

    const router = express.Router()
    const docs: Map<Packages, IExpressRouter[]> = new Map()

    for (const pack_key of Object.keys(TSA.package.configs) as Packages[]) {
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
        docs.set(pack_key, _routers)
    }

    // CONSOLE LOG SERVER INFO
    console.log(`------------------API SERVER INFO---------------------`)
    console.log(`SERVER :  https://${tsapp.env.TSAPP_DOMAIN_NAME}/api`)
    console.log(`------------------------------------------------------`)

    return {
        docs,
        router
    }
}