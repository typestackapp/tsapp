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
            console.log("ping")
            next()
        },
        (req, res) => {
            console.log("pong")
            res.send({status: true})
        }
    ]
}