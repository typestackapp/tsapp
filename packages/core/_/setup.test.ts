import { expect } from "chai"

describe('Test global variabless', () => {
    it('should have global config', () => {
        expect(global.tsapp["@typestackapp/core"].config).to.exist
    })

    it('should have global db', async () => {
        expect(global.tsapp["@typestackapp/core"].db.mongoose.core).to.exist
    })

    it('should have global jobs', () => {
        //expect(global.core_tsapp_test.jobs).to.exist
    })

    it('should have global rabbitmq', () => {
        //expect(global.core_tsapp_test.rmq).to.exist
    })
})