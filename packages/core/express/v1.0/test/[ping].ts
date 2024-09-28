import { ExpressRouter, TSA } from "@typestackapp/core"

const config = TSA.config["@typestackapp/core"]
export const router = new ExpressRouter<{
    get: {
        res: { data: boolean } 
        body: { status: number }
        params: { ping: string } 
        query: { test: "test string" }
    }
}>()

// GET: /api/core/v1.0/test/:ping || /api/@typestackapp/core/v1.0/test/:ping || /api/test/:ping
router.get = {
    path: "/api/test/:ping",
    access: config.access.ACTIVE.Test.getPing,
    resolve: (req, res, next) => {
        req.query.test = "test string"
        req.params.ping = "any string"
        req.body = {status: 20}
        console.log("get ping")
        res.send({data: true})
    }
}

// POST: /api/core/v1.0/test/:ping || /api/@typestackapp/core/v1.0/test/:ping
router.post = {
    access: config.access.ACTIVE.Test.getPing,
    resolve: [
        (req, res, next) => {
            console.log("post ping")
            next()
        },
        (req, res, next) => {
            console.log("post pong")
            throw new Error("Error")
        }
    ]
}