import { expect } from "chai"
import { TSA } from "@typestackapp/core"

import { setup, Setup } from "@typestackapp/core/common/test/util"
var core_tsapp_test: Setup = {} as any
beforeAll(async () => {
    core_tsapp_test = await setup()
})

describe('Test global variabless', () => {
    it('should have global config', () => {
        expect(TSA.config["@typestackapp/core"]).to.exist
    })

    it('should have global db', async () => {
        expect(TSA.db["@typestackapp/core"].mongoose.core).to.exist
    })

    it('should have global jobs', () => {
        expect(core_tsapp_test.jobs).to.exist
    })
})