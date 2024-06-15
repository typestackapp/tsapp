"use server"
import type { UserDocument } from '@typestackapp/core/models/user'
import type { EmailConfigDocument } from '@typestackapp/core/models/config/email'
import type { ChannelConfigDocument } from '@typestackapp/core/models/config/channel'
import type { TokenDocument } from '@typestackapp/core/models/user/token'
import type { JobList } from '@typestackapp/core/common/job'

import { Connection as DbConnection } from "@typestackapp/core/common/db"
import { Connection as RmqConnection } from "@typestackapp/core/common/rabbitmq/connection"
import tsapp from "@typestackapp/core/codegen/tsapp.json"
import config from "@typestackapp/core/codegen/config/output.json"
import {T as Config} from "@typestackapp/core/codegen/config/output"

export * from "./common/service"
export type * from "@typestackapp/core/codegen/system"

export { config }
export type { Config }
export const packages = tsapp.packages
export type Packages = keyof typeof packages

declare global {
    var tsapp : {
        [Package in Packages]: ServerGlobals<Package>
    }
    var core_tsapp_test: {
        root_user: UserDocument
        email_config: EmailConfigDocument
        email_channel_config: ChannelConfigDocument
        api_key: TokenDocument
        jobs: JobList
    }
}

export interface ServerGlobals<TPackage extends Packages> {
    config: Config[TPackage]
    db: DbConnection<TPackage>
    rmq: RmqConnection<TPackage>
    // job: any // JobList<TPackage>
    // type: { configs, jobs, consumers }
}

export const env = {
    TYPE: process.env.ENV as "prod" | "dev",
    TIME_ZONE: process.env.TIME_ZONE as string, // example: "America/Sao_Paulo"
    TSAPP_INIT_EMAIL: process.env.TSAPP_INIT_EMAIL as string,
    TSAPP_INIT_PSW: process.env.TSAPP_INIT_PSW as string,
    IP_CERTBOT: process.env.IP_CERTBOT as string, // example: "10.44.44.44"
    IP_HAPROXY: process.env.IP_HAPROXY as string, // example: "10.44.44.44"
    IP_RABBITMQ: process.env.IP_RABBITMQ as string, // example: "10.44.44.44"
    IP_MONGO_MASTER: process.env.IP_MONGO_MASTER as string, // example: "10.44.44.44"
    IP_TSAPP: process.env.IP_TSAPP as string, // example: "10.44.44.44"
    SERVER_DOMAIN_NAME: process.env.SERVER_DOMAIN_NAME as string, // example: "@typestackapp"
    PORT_HAPROXY_TSAPP: process.env.PORT_HAPROXY_TSAPP as string, // example: "7443" | "443"
    RCS: process.env.RCS as string, // rabbitmq consumer services, example: "core,example"
}

for(const pack of Object.keys(packages) as Packages[]) {
    global.tsapp = global.tsapp || {} as any
    global.tsapp[pack] = global.tsapp[pack] as any || {} as any
    global.tsapp[pack].config = global.tsapp[pack].config as any || config[pack] as any
}

// RABBITMQ CONSUMER SERVICES
export const rcs: string[] = []
if( env.RCS || env.RCS !== "" ) {
    const c_serv = env.RCS?.split(",")
    if(c_serv) rcs.push(...c_serv)
}