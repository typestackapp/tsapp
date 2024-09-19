import { EmailInput } from "@typestackapp/core/common/email"
import { Email } from   "@typestackapp/core/common/email"
import { EmailConfigModel } from "@typestackapp/core/models/config/email"
import { TSA } from "@typestackapp/core"

jest.setTimeout(10000) // extend timeout to 10 seconds

import { setup, Setup } from "@typestackapp/core/common/test/util"
var core_tsapp_test: Setup = {} as any
beforeAll(async () => {
    core_tsapp_test = await setup()
})

describe('Test email config', () => {

    it('should have usable email config', async () => {
        // sending via unvalid email config will thrown: "Exceeded timeout of 5000 ms for a test.
        const config = await EmailConfigModel.findOne({_id: core_tsapp_test.email_config._id})
        if(!config) throw "Config not found!"
        
        config.data.from = config.data.from
        await config.save()
        
        const emai_input: EmailInput = {
            receivers: TSA.config["@typestackapp/core"].system.DEV_EMAIL,
            subject: "Test: test configs",
            html: "Email message content from test: should have usable email config",
            attachments: []
        }

        await new Email( emai_input ).send( config )
    })

})