import { ExpressRouter, TSA } from "@typestackapp/core"

const config = TSA.config["@typestackapp/core"]
export const router = new ExpressRouter<{
    get: {
        res: { status: boolean } 
        body: { status: number }
        params: { params: "params"} 
        query: { query: "query" }
    }
}>()

router.get = {
    access: config.access.ACTIVE.Test.getPing,
    resolve: [
        (req, res, next) => {
            req.query.query = "query"
            req.params.params = "params"
            req.body = {status: 20}
            console.log("get ping")
        }
    ]
}

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