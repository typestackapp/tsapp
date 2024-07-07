import type { UserDocument } from '@typestackapp/core/models/user'
import type { EmailConfigDocument } from '@typestackapp/core/models/config/email'
import type { ChannelConfigDocument } from '@typestackapp/core/models/config/channel'
import type { TokenDocument } from '@typestackapp/core/models/user/token'
import type { JobList } from '@typestackapp/core/common/job'

import { DbConnection } from "@typestackapp/core/common/db"
import { RmqConnection } from "@typestackapp/core/common/rabbitmq/connection"
import { tsapp } from "@typestackapp/core/env"
import tsapp_config from "@typestackapp/core/codegen/tsapp.json"
import config from "@typestackapp/core/codegen/config/output.json"
import { T as Config} from "@typestackapp/core/codegen/config/output"
import { getPackageConfigs } from '@typestackapp/cli/common/util'

export * from "./common/service"
export type * from "@typestackapp/core/codegen/system"

export { config }
export type { Config }
export const packages = getPackageConfigs() as {[key in Packages]: ReturnType<typeof getPackageConfigs>[string]}
export type Packages = keyof typeof tsapp_config.packages

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
}

for(const pack of Object.keys(packages) as Packages[]) {
    global.tsapp = global.tsapp || {} as any
    global.tsapp[pack] = global.tsapp[pack] as any || {} as any
    global.tsapp[pack].config = global.tsapp[pack].config as any || config[pack] as any
}

// RABBITMQ CONSUMER SERVICES
export const rcs: string[] = []
if( tsapp.env.TSAPP_RCS || tsapp.env.TSAPP_RCS !== "" ) {
    const c_serv = tsapp.env.TSAPP_RCS?.split(",")
    if(c_serv) rcs.push(...c_serv)
}