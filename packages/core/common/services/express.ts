import { Packages } from "@typestackapp/core"
import DB from "@typestackapp/core/common/db"
DB.getInstance()
import express from "express"
import { ExpressRouter } from "@typestackapp/core"
import { ConnectionList } from "@typestackapp/core/common/rabbitmq/connection"
import { middleware, upsertRouterDocs } from "@typestackapp/core/models/user/access/middleware"
import { env, packages } from "@typestackapp/core"

async function initilize() {
    await DB.getInstance()
    await ConnectionList.initilize()
}

initilize().then(async () => {
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    const router = express.Router()
    const routers = new ExpressRouter()
    
    for (const pack_key of Object.keys(packages) as Packages[]) {
        const _root = `${process.cwd()}/node_modules/${pack_key}/express/`
        const _routers = await routers.loadExpressRoutes(_root, pack_key, `/api`)
        .catch(error => {
            console.log(`ERROR while loading api routes from pack: ${pack_key}: ${error}`)
            return []
        })
        upsertRouterDocs(_routers, pack_key)
    }
    
    // add api middleware at the begining of each router
    for(const _router of routers.getRouters()){
        if(_router.options) _router.handlers.unshift(middleware.api(_router.options))
    }

    routers.registerRoters(router)
    app.use(router)
    app.listen(8000)
})
.finally(() => {
    // CONSOLE LOG SERVER INFO
    console.log(`------------------API SERVER INFO---------------------`)
    console.log(`SERVER :  https://${env.SERVER_DOMAIN_NAME}/api`)
    console.log(`------------------------------------------------------`)
})