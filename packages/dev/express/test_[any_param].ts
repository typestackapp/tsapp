import { ExpressRouter, TSA } from "@typestackapp/core"

const config = TSA.config["@typestackapp/dev"]
export const router = new ExpressRouter<{
    get: {
        res: { data: boolean } 
        body: { status: number }
        params: { any_param: string } 
        query: { test: "test string" }
    }
}>()

// GET: /api/dev/test/:any_param || /api/@typestackapp/dev/test/:any_param || /api/test/:any_param
router.get = {
    path: "/api/test/:any_param",
    access: config.access.ACTIVE.Test.getPing,
    resolve: (req, res, next) => {
        req.query.test = "test string"
        req.params.any_param = "any string"
        req.body = {status: 20}
        console.log("get ping")
        res.send({data: true})
    }
}

// POST: /api/dev/test/:any_param || /api/@typestackapp/dev/test/:any_param
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