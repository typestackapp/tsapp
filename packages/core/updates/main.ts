import { Types } from "mongoose"
import { generateKeyPair, exportJWK } from "jose"
import { JWKConfigDocument, JWKConfigInput, JWKConfigModel, AccessTokenJWKData, RefreshTokenJWKData } from "@typestackapp/core/models/config/jwk"
import { RoleConfigDocument, RoleConfigModel, RoleConfigInput } from "@typestackapp/core/models/config/role"
import { OauthAppInput, OauthAppModel } from "@typestackapp/core/models/user/app/oauth"
import { Transaction } from "@typestackapp/core/models/update"
import { secretHash, randomSecret } from "@typestackapp/core/models/user/access/util"
import { UserInput, UserModel } from "@typestackapp/core/models/user"
import { config, Config, Packages, IAccessInput } from "@typestackapp/core"
import { AccessDocument, AccessModel } from "@typestackapp/core/models/user/access"
import { tsapp, haproxy } from "@typestackapp/core/env"

export const system_admin_id = new Types.ObjectId("62082b4a4a13ab628afc0cce")
export const refresh_token_config_id = new Types.ObjectId("62082b4a4a13ab628afc0ccd")
export const access_token_config_id = new Types.ObjectId("62082b4a4a13ab628afc0ccc")
export const role_config_id = new Types.ObjectId("64ac53099725764a2af1feb2")
export const role_config_name = "SystemAdmin"
export const default_user_app_id = new Types.ObjectId("64ac53099725764a2af1feb3")
export const default_user_app_client_id = "5125b186995939a4b263b835670aab334787815b"
export const all_access_inputs: AccessDocument[] = getAllAccessInputs()

export function getAllAccessInputs(): AccessDocument[] {
    var _access: AccessDocument[] = []
    for(const [pack_key, pack] of Object.entries(config as Config)) {
        const active_access = pack?.access?.ACTIVE
        if(!active_access) continue
        let doc_input: IAccessInput = {
            status: "Enabled",
            pack: pack_key as Packages,
            resource: undefined, // allow access to all resources
            action: undefined, // allow access to all actions
            permissions: ["Read", "Write", "Update", "Delete"]
        }
        _access.push(new AccessModel(doc_input))
    }
    return _access
}

export const transaction: Transaction = async (session, update) => {
    const host = `https://${tsapp.env.TSAPP_DOMAIN_NAME}:${haproxy.env.HAPROXY_TSAPP_PORT}`

    // ADD JWT FOR REFRESH TOKEN
    const refresh_token_config = await JWKConfigModel.findOne({ _id: refresh_token_config_id }, {}, { session })
    if(!refresh_token_config) {
        const pair = await generateKeyPair("RS256")
        const key = await exportJWK(pair.privateKey)
        const refresh_token_config_input: JWKConfigInput<RefreshTokenJWKData> = {
            _id: refresh_token_config_id,
            created_by: system_admin_id,
            updated_by: system_admin_id,
            title: "Default refresh token jwt config",
            cacheSeconds: tsapp.env.TSAPP_ENV_TYPE == "dev" ? 20 : 3600,
            key,
            data: {
                renewBefore: tsapp.env.TSAPP_ENV_TYPE == "dev" ? "20s" : "60s",
                extendTime: tsapp.env.TSAPP_ENV_TYPE == "dev" ? "2m" : "30d",
                renewAfter: tsapp.env.TSAPP_ENV_TYPE == "dev" ? `60s` : `30d`,
                extendLifeTime: true,
                headerAlg: "RS256",
            }
        }
        await JWKConfigModel.findOneAndUpdate<JWKConfigDocument<RefreshTokenJWKData>>(
            { _id: refresh_token_config_id },
            refresh_token_config_input,
            { upsert: true, new: true, session }
        )
        update.log.push({ type: "refresh_token_config", msg: "upserted" })
    } else {
        update.log.push({ type: "refresh_token_config", msg: "already exists" })
    }


    // ADD JWT FOR ACCESS TOKEN
    const access_token_config = await JWKConfigModel.findOne({ _id: access_token_config_id }, {}, { session })
    if(!access_token_config) {
        const pair = await generateKeyPair("RS256")
        const key = await exportJWK(pair.privateKey)
        const access_token_config_input: JWKConfigInput<AccessTokenJWKData> = {
            _id: access_token_config_id,
            created_by: system_admin_id,
            updated_by: system_admin_id,
            title: "Default access token jwt config",
            cacheSeconds: tsapp.env.TSAPP_ENV_TYPE == "dev" ? 20 : 3600,
            key,
            data:{
                renewBefore: tsapp.env.TSAPP_ENV_TYPE == "dev" ? "10s" : "60s",
                extendTime: tsapp.env.TSAPP_ENV_TYPE == "dev" ? "24h" : "30m",
                headerAlg: "RS256",
            }
        }
        await JWKConfigModel.findOneAndUpdate<JWKConfigDocument<AccessTokenJWKData>>(
            { _id: access_token_config_id },
            access_token_config_input,
            { upsert: true, new: true, session }
        )
        update.log.push({ type: "access_token_config", msg: "upserted" })
    } else {
        update.log.push({ type: "access_token_config", msg: "already exists" })
    }

    
    // CREATE DEFAULT SystemAdmin USER ROLE CONFIG
    const role_config_input: RoleConfigInput = {
        _id: role_config_id,
        created_by: system_admin_id,
        updated_by: system_admin_id,
        title: "SystemAdmin role config",
        data: {
            name: role_config_name,
            resource_access: all_access_inputs,
            graphql_access: [{
                pack: "@typestackapp/core",
                services: ["admin"]
            }]
        }
    }
    await RoleConfigModel.findOneAndUpdate<RoleConfigDocument>(
        { _id: role_config_input._id },
        role_config_input,
        { upsert: true, new: true, session, setDefaultsOnInsert: true }
    )
    update.log.push({ type: "role_config", msg: "upserted" })


    // CREATE DEFAULT USER APP
    const default_user_app_input: OauthAppInput = {
        _id: default_user_app_id,
        actions: ["register", "login", "grant"],
        client: "@typestackapp/core/models/user/app/oauth/client/tsapp",
        data: {
            client_id: default_user_app_client_id,
            client_secret: randomSecret(40),
            access: all_access_inputs,
            roles: [role_config_name],
            grants: [
                { type: "authorization_code" },
                { type: "refresh_token" },
                { type: "password" },
                { type: "client_credentials" }
            ],
            callback_url: `${host}/auth/callback/5125b186995939a4b263b835670aab334787815b`,
            redirect_url: `${host}/admin`,
            token_url: tsapp.env.TSAPP_ENV_TYPE == "dev" ? `http://${tsapp.env.TSAPP_IP}:8000/api/auth/token` : `${host}/api/auth/token` 
        },
        icon: `https://${tsapp.env.TSAPP_DOMAIN_NAME}:${haproxy.env.HAPROXY_TSAPP_PORT}/public/logo.png`,
        name: tsapp.env.TSAPP_DOMAIN_NAME,
        description: `Use ${tsapp.env.TSAPP_DOMAIN_NAME} account`,
        created_by: system_admin_id,
        updated_by: system_admin_id
    }

    let default_user_app = await OauthAppModel.findOne({ _id: default_user_app_id }, {}, { session })
    update.log.push({ type: "default_user_app", msg: default_user_app ? "found" : "not found" })
    if(default_user_app) {
        default_user_app.data.access = all_access_inputs
        default_user_app.data.roles = [role_config_name]
        update.log.push({ type: "default_user_app", msg: "access updated" })
        await default_user_app.save({ session })
    } else {
        await OauthAppModel.findOneAndUpdate<OauthAppInput>(
            { _id: default_user_app_id },
            default_user_app_input,
            { upsert: true, new: true, session }
        )
        update.log.push({ type: "default_user_app", msg: "created" })
    }

    // UPDATE SYSTEM ADMIN USER
    const system_admin_input: UserInput = {
        _id: system_admin_id,
        usn: tsapp.env.TSAPP_INIT_EMAIL,
        psw: secretHash(tsapp.env.TSAPP_INIT_PSW),
        roles: ["SystemAdmin"]
    }
    await UserModel.findOneAndUpdate<UserInput>(
        { _id: system_admin_id },
        system_admin_input,
        { upsert: true, new: true, session }
    )
    update.log.push({ type: "system_admin", msg: "upserted" })
}