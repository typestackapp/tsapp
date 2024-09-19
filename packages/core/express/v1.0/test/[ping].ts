import { ExpressRouter, TSA } from "@typestackapp/core"

const config = TSA.config["@typestackapp/core"]
export const router = new ExpressRouter()

router.get(
config.access.ACTIVE.Test.getPing,
(req, res, next) => {
    console.log("ping")
    next()
},
(req, res) => {
    console.log("pong")
    res.send({status: true})
})