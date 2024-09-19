import { expect } from "chai"
import { TSA } from "@typestackapp/core"

describe('Test global variabless', () => {
    it('should have global config', () => {
        expect(TSA.config["@typestackapp/core"]).to.exist
    })

    it('should have global db', async () => {
        expect(TSA.db["@typestackapp/core"].mongoose.core).to.exist
    })

    it('should have global jobs', () => {
        //expect(global.core_tsapp_test.jobs).to.exist
    })

    it('should have global rabbitmq', () => {
        //expect(global.core_tsapp_test.rmq).to.exist
    })
})