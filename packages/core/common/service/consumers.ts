import { TSA } from "@typestackapp/core"

TSA.init({
    start_rmq_consumers: true
})
.finally(() => {
    // CONSOLE LOG SERVER INFO
    console.log(`------------------CONSUMERS SERVER INFO---------------------`)
    console.log(`SERVER :  ${TSA.rcs}`)
    console.log(`-------------------------------------------------------`)
})