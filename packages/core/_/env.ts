import DB from "@typestackapp/core/common/db"
// jest should have any global promise to execute beforeAll
DB.getInstance()

global.core_tsapp_test = global?.core_tsapp_test || {} as any

beforeAll(async () => {
    await DB.getInstance()
    const module = require("@typestackapp/core/_/setup")
    await module.setup()
})