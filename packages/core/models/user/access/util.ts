
import crypto from "crypto"
import type { IAccessStatus, IPermissionType } from '@typestackapp/core/codegen/system'
import type { GraphqlServerConfig } from '@typestackapp/core/common/server'
import type { RoleConfigDocument } from '@typestackapp/core/models/config/role'
import type { AccessCheckOptions } from "@typestackapp/core/models/user/access/middleware"
import type { AccessOutput } from "@typestackapp/core/models/user/access"

export function secretCompare(secret: string, saved_salt_hash: string, iterations: number = 1000, keylen: number = 64, digest: string = 'sha512'): boolean {
    var [salt, hash] = saved_salt_hash.split('.')
    var _hash = crypto.pbkdf2Sync(secret, salt, iterations, keylen, digest).toString(`hex`); 
    return _hash === hash;
}

export function secretHash(secret: string, iterations: number = 1000, keylen: number = 64, digest: string = 'sha512'): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(secret, salt, iterations, keylen, digest).toString(`hex`)
    return `${salt}.${hash}`
}

export function randomSecret(str_length: number): string {
    const rand = crypto.randomBytes(str_length);
    return rand.toString('base64').slice(0, str_length);
}

export async function checkRoleAccessToGraphqlService(role: RoleConfigDocument, options: Pick<GraphqlServerConfig, "pack" | "name">): Promise<boolean> {
    const graphql_access = role.data.graphql_access.find( access => access.pack === options.pack )
    if (!graphql_access) throw `Role ${role.data.name} not have access to ${options.pack}`

    const services = graphql_access.services
    if (!services.includes(options.name)) `Role ${role.data.name} not have access to ${options.pack}:${options.name}`

    return true
}


export function checkAccessToAllResources( has_access: AccessOutput[], access_required: AccessOutput[]){
    const ok: AccessCheckOptions[] = []
    const bad: AccessCheckOptions[] = []
    for(const required of access_required) {
        for(const permission of required.permissions) {
            const options: AccessCheckOptions = {
                resource: required.resource,
                action: required.action,
                pack: required.pack,
                auth: {
                    permission
                }
            }
            if(!checkResourceAccess(has_access, options)) {
                bad.push(options)
            }else {
                ok.push(options)
            }
        }
    }

    return {
        has_all_access: bad.length == 0,
        has_partial_access: ok.length > 0,
        ok, // list of access required and found
        bad // list of access required but not found
    }
}

export function checkResourceAccess( user_has_access: AccessOutput[], options: AccessCheckOptions ): boolean {
    const enabled_access_status: IAccessStatus[] = ["Enabled", "EnabledByUser"]
    const required_permission: IPermissionType | undefined = options.auth?.permission || undefined
    const required_resource = options.resource
    const required_action = options.action
    const required_pack = options.pack

    if(required_permission == undefined) return true
    // TODO integrate pack
    for(const user_access of user_has_access) {
        // pack keys should match
        if(user_access.pack != required_pack) continue

        // resource keys should match
        if(user_access.resource != required_resource) continue

        // user access should be enabled
        if(!enabled_access_status.includes(user_access.status)) continue

        // access via top level resource
        if( true
            && user_access.action == undefined 
            && user_access.resource == required_resource
            && user_access.permissions.includes(required_permission)
        ) return true

        // access via lower level action
        if( true
            && user_access.action == required_action 
            && user_access.resource == required_resource
            && user_access.permissions.includes(required_permission)
        ) return true
    }

    return false
}