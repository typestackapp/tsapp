import { expect } from "chai"
import { secretCompare } from "@typestackapp/core/models/user/access/util"
import { tsapp } from "@typestackapp/core/env"

describe('Test users', () => {
    
    it('should check if password can be validated', async () => {
        const is_valid = secretCompare(tsapp.env.TSAPP_INIT_PSW as string, global.core_tsapp_test.root_user.psw)
        expect(is_valid).to.be.true
    })

    it('should check if password cant be validated', async () => {
        const is_valid = secretCompare("never-use-this-psw" as string, global.core_tsapp_test.root_user.psw)
        expect(is_valid).to.be.false
    })
})