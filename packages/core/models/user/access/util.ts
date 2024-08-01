
import crypto from "crypto"
import type { IAccessInput, IAccessStatus, IPermissionType, IAccessOptions } from '@typestackapp/core/codegen/system'
import type { RoleConfigDocument } from '@typestackapp/core/models/config/role'
import type { AccessOutput } from "@typestackapp/core/models/user/access"
import type { Maybe } from "graphql/jsutils/Maybe"
import type { GraphqlServerConfig } from "@typestackapp/cli/common/util"

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

export async function checkRolesAccessToGraphqlService(roles: RoleConfigDocument[], options: Pick<GraphqlServerConfig, "pack" | "name">): Promise<boolean> {
    for(const role of roles) {
        if(await checkRoleAccessToGraphqlService(role, options) === true) {
            return true
        }
    }
    const role_names = roles.map( role => role.data.name ).toString()
    throw `Roles ${role_names} does not have access to ${options.pack}`
}

export async function checkRoleAccessToGraphqlService(role: RoleConfigDocument, options: Pick<GraphqlServerConfig, "pack" | "name">): Promise<boolean> {
    const graphql_access = role.data.graphql_access.find( access => access.pack === options.pack )
    if (!graphql_access) {
        return false
    }

    const services = graphql_access.services
    if (!services.includes(options.name)) `Role ${role.data.name} not have access to ${options.pack}:${options.name}`

    return true
}

export function arrayToObject(array: [], keyField: string) {
    return array.reduce((obj, item) => {
        obj[item[keyField]] = item;
        return obj;
    }, {});
}

export interface AccessCheckOptions extends Pick<IAccessOptions, "pack" | "resource"> {
    action?: Maybe<IAccessOptions["action"]> | undefined, 
    auth?: Maybe<{
        permission?: Maybe<IPermissionType>
    }>
}

export class AccessValidator {
    private access_provided: AccessOutput[] | IAccessInput[] = []

    constructor(access_provided: AccessOutput[][] | IAccessInput[][] | AccessOutput[] | IAccessInput[]) {
        for(const access of access_provided) {
            if(Array.isArray(access)) {
                this.access_provided.push(...access as any)
            }else {
                this.access_provided.push(access as any)
            }
        }
    }

    getAccessProvided() {
        return this.access_provided
    }

    getOptions(access: AccessOutput | IAccessInput, permission?: IPermissionType): AccessCheckOptions {
        return {
            resource: access.resource,
            action: access.action,
            pack: access.pack,
            auth: { permission }
        }
    }
    
    checkResourceAccess(access_required: AccessOutput[] | IAccessInput[]) {
        const has_access: AccessCheckOptions[] = []
        const no_access: AccessCheckOptions[] = []
        for(const required of access_required) {
            for(const permission of required.permissions) {
                const options = this.getOptions(required, permission)
                if(!this.checkAccess(options)) {
                    no_access.push(options)
                }else {
                    has_access.push(options)
                }
            }
        }
    
        return {
            has_full_access: no_access.length == 0,
            has_partial_access: has_access.length > 0,
            has_access, // list of access required and found
            no_access // list of access required but not found
        }
    }
    
    checkAccess( options: AccessCheckOptions ): boolean {
        const enabled_access_status: IAccessStatus[] = ["Enabled"]
        const required_permission: IPermissionType | undefined = options.auth?.permission || undefined
        const required_resource = options.resource
        const required_action = options.action
        const required_pack = options.pack
    
        if(required_permission == undefined) return true
        // TODO integrate pack
        for(const user_access of this.access_provided) {
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
}