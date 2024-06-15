import { rcs } from "@typestackapp/core"
import DB from "@typestackapp/core/common/db"

async function initilize() {
    await DB.getInstance()
    const module = await import("@typestackapp/core/common/rabbitmq/connection")
    module.ConnectionInstance.start_consumers = true
    module.ConnectionList.initilize()
}

initilize().finally(() => {
    // CONSOLE LOG SERVER INFO
    console.log(`------------------CONSUMERS SERVER INFO---------------------`)
    console.log(`SERVER :  ${rcs}`)
    console.log(`-------------------------------------------------------`)
})