import {} from "@typestackapp/core"
import { ModelLoader } from "@typestackapp/core/common/model"
import DB from "@typestackapp/core/common/db"
DB.getInstance()

import { JobList } from "@typestackapp/core/common/job"
import { ConnectionList } from "@typestackapp/core/common/rabbitmq/connection"

DB.getInstance()
.then(async () => {
    await ConnectionList.initilize()
    await ModelLoader.loadAllModels()
    await JobList.getInstance(true)
})
.finally(() => {
    // CONSOLE LOG SERVER INFO
    console.log(`------------------JOBS SERVER INFO---------------------`)
    console.log(`SERVER :  JOBS initilized`)
    console.log(`-------------------------------------------------------`)
})