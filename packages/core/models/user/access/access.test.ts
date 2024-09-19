import { expect } from "chai"
import moment from "moment"
import { DeepPartial } from "utility-types"
import { Types } from "mongoose"
import { newRefreshToken, newAccessToken } from "@typestackapp/core/models/user/util"
import { BearerTokenModel } from "@typestackapp/core/models/user/token/bearer"
import { default_user_app_client_id } from "@typestackapp/core/updates/main"
import { AccessInput, AccessOptions, UserAccessLogModel, UserAccessLogInput } from "@typestackapp/core/models/user/access"
import { AccessRequest, auth, validateApiKey, validateBearerKey } from "@typestackapp/core/models/user/access/middleware"
import { AccessValidator, AccessCheckOptions } from "@typestackapp/core/models/user/access/util"

var token: Awaited<ReturnType<typeof newRefreshToken>>
const client_id = default_user_app_client_id

import { api_key_base64, setup, Setup } from "@typestackapp/core/common/test/util"
var core_tsapp_test: Setup = {} as any
beforeAll(async () => {
    core_tsapp_test = await setup()
})

describe('Test Bearer token', () => {
    beforeAll(async () => {
        await BearerTokenModel.deleteMany({})
    })

    it('should use valid access token and suceed', async () => {
        token = await newRefreshToken(core_tsapp_test.root_user, client_id, "refresh_token", {
            time: moment().subtract(10, 'seconds'), // token was created 10 seconds ago
            accessTokenExtendTime: "20s" // access token is valid for 20 seconds
        })
        
        await validateBearerKey(token.key.access.tk, {
            time: moment().subtract(0, 'seconds'), // token is used now, should be valid and not throw any error
            accessTokenExtendTime: "20s" // access token is valid for 20 seconds
        }, "Bearer")
    })

    it('should use expired access token and fail', async () => {
        token = await newRefreshToken(core_tsapp_test.root_user, client_id, "refresh_token", {
            time: moment().subtract(20, 'seconds'), // token was created 20 seconds ago
            accessTokenExtendTime: "10s" // access token is valid for 10 seconds
        })
        
        const is_ok = await validateBearerKey(token.key.access.tk, {
            time: moment().subtract(0, 'seconds'), // token is used now, should be invalid and throw error
            accessTokenExtendTime: "10s"
        }, "Bearer")
        .then(user => false)
        .catch(error => true)

        expect(is_ok).to.be.equal(true)
    })

    it('should retrive new access token', async () => {
        const refresh_token = token.key.refresh.tk
        const acccess_token = token.key.access.tk

        token = await newAccessToken(refresh_token, acccess_token, {
            time: moment().subtract(0, 'seconds'), // token is used now, should allow to retrive new access token
            accessTokenExtendTime: "10s"
        })

        expect(token.key.access.tk).to.be.not.equal(acccess_token)
    })

    it('should retrive new refresh token', async () => {
        const refresh_token = token.key.refresh.tk
        const acccess_token = token.key.access.tk

        token = await newAccessToken(refresh_token, acccess_token, {
            time: moment().subtract(15, 'seconds'),
            refreshTokenRenewBefore: "5s",
            refreshTokenExtendTime: "30s",
            refreshTokenExtendLifetime: true
        })

        expect(token.key.refresh.tk).to.be.not.equal(refresh_token)
    })

    it('should not retrive new refresh token', async () => {
        const refresh_token = token.key.refresh.tk
        const acccess_token = token.key.access.tk

        token = await newAccessToken(refresh_token, acccess_token, {
            time: moment().subtract(15, 'seconds'),
            refreshTokenRenewBefore: "5s",
            refreshTokenExtendTime: "30s",
            refreshTokenExtendLifetime: false
        })
        expect(token.key.refresh.tk).to.be.equal(refresh_token)
    })
})


describe('Test ApiKey token', () => {
    beforeAll(async () => {
        // console.log(`Your api key secret: ${api_key_secret}`)
        console.log(`Your api key: ApiKey%20${api_key_base64}`)
    })

    it('should have global apikey', async () => {
        expect(core_tsapp_test.api_key).to.exist
    })

    it('should throw error while getting non existing apikey', async () => {
        const is_ok = await validateApiKey('some-random-key')
        .then(user => false)
        .catch(error => true)
        expect(is_ok).to.be.equal(true)
    })

    it('should use new apikey and get valid user key', async () => {
        const user = await validateApiKey(api_key_base64)
        expect(user).to.exist
    })
})


describe('Test access', () => {
    const user_access: AccessInput = {
        pack: "@typestackapp/core",
        status: "Enabled",
        resource: "User",
        permissions: ["Write", "Delete"]
    }

    const user_read_access: AccessInput = {
        pack: "@typestackapp/core",
        status: "Enabled",
        resource: "User",
        action: "getCurrentUser",
        permissions: ["Read"]
    }

    const vuser_access = new AccessValidator([user_access])
    const vuser_read_access = new AccessValidator([user_read_access])

    it('should allow pass type AccessOptions to function checkAccess', async () => {
        const access: AccessInput[] = [] as AccessInput[]
        const options: AccessOptions = {} as AccessOptions
        const validator = new AccessValidator(access)
        validator.checkAccess(options)
    })

    it('should have access if auth.permission is undefined', async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "User",
            action: "getCurrentUser",
            auth: { permission: undefined }
        }
        expect(vuser_read_access.checkAccess(options)).to.be.equal(true)
    })

    it('should have access if auth.permission is Read', async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "User",
            action: "getCurrentUser",
            auth: { permission: "Read" }
        }
        expect(vuser_read_access.checkAccess(options)).to.be.equal(true)
    })

    it('should not have access if auth.permission is Write', async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "User",
            action: "getCurrentUser",
            auth: { permission: "Write" }
        }
        expect(vuser_read_access.checkAccess(options)).to.be.equal(false)
    })

    it('should have access via top level user_access', async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "User",
            action: "getCurrentUser",
            auth: { permission: "Write" }
        }
        expect(vuser_access.checkAccess(options)).to.be.equal(true)
    })

    it('should not have access via top level user_access', async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "Test",
            action: "getPing",
            auth: { permission: "Read" }
        }
        expect(vuser_access.checkAccess(options)).to.be.equal(false)
    })

    it('should not have access if user_access.status is Disabled' , async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "User",
            action: "getCurrentUser",
            auth: { permission: "Write" }
        }
        const validator = new AccessValidator([{ ...user_access, status: "Disabled" }])
        expect(validator.checkAccess(options)).to.be.equal(false)
    })

    it('should not have access to resource Test_getPing. Test_getPing is not defined on user_access' , async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "Test",
            action: "getPing",
            auth: { permission: "Write" }
        }
        const validator = new AccessValidator([{ ...user_access, action: undefined }])
        expect(validator.checkAccess(options)).to.be.equal(false)
    })

    it('should not have access for same resource on different pack' , async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/test" as any,
            resource: "User",
            action: "getCurrentUser",
            auth: { permission: "Write" }
        }
        const validator = new AccessValidator([{ ...user_access }])
        expect(validator.checkAccess(options)).to.be.equal(false)
    })

    it('should have access for same resource on same pack' , async () => {
        const options: AccessCheckOptions = {
            pack: "@typestackapp/core",
            resource: "User",
            action: "getCurrentUser",
            auth: { permission: "Write" }
        }
        const validator = new AccessValidator([{ ...user_access }])
        expect(validator.checkAccess(options)).to.be.equal(true)
    })

    it('should log user on auth' , async () => {
        const options: AccessOptions = {
            enabled: true,
            pack: "@typestackapp/core",
            resource: "User",
            action: "getCurrentUser",
            resourceAction: "User_getCurrentUser",
            log: { enabled: true },
            auth: { enabled: true, tokens: ["ApiKey"] }
        }

        const input: UserAccessLogInput = {
            req_id: new Types.ObjectId(),
            device: {
                ip_address: "10.10.10.44",
                agent: "test agent"
            },
            access: {
                enabled: true,
                resource: "User",
                action: "getCurrentUser",
                resourceAction: "User_getCurrentUser",
                pack: "@typestackapp/core",
                log: { enabled: true },
                auth: { enabled: true, tokens: ["ApiKey"] }
            }
        }

        const log = await UserAccessLogModel.create(input)

        const req: DeepPartial<AccessRequest> = {
            log,
            headers: {
                authorization: `ApiKey ${api_key_base64}`
            }
        }

        await auth(req as any, options)

        expect(req.log?.user).to.be.not.undefined
        expect(req.log?.user?.id).to.be.not.undefined
        expect(req.log?.user?.token_id).to.be.not.undefined
        expect(req.log?.user?.token_type).to.be.not.undefined
    })

})