import type tsapp_config from "@typestackapp/core/codegen/tsapp.json"
import type { Connections as DBConnections } from '@typestackapp/core/common/db'
import type { Connections as RMQConnections } from '@typestackapp/core/common/rabbitmq/connection'
import type { JobList } from '@typestackapp/core/common/job'

import { tsapp } from "@typestackapp/core/env"
import config from "@typestackapp/core/codegen/config/output.json"
import { T as Config} from "@typestackapp/core/codegen/config/output"
import { getPackageConfigs } from '@typestackapp/cli/common/util'
import { ExpressRouter, GraphqlRouter } from '@typestackapp/core/common/service'
import { IAccessOptions } from "@typestackapp/core/codegen/system"

export * from "@typestackapp/core/common/service"
export type * from "@typestackapp/core/codegen/system"

export { config }
export type { Config }
export type Packages = keyof typeof tsapp_config.packages

export class TSA {
    private static _init: Promise<void>
    private static _db: DBConnections
    private static _rmq: RMQConnections
    private static _jobs: JobList

    static async init(options?: {
        start_rmq_consumers?: boolean
        start_jobs?: boolean
    }) {
        if(TSA._init) return TSA._init
        return TSA._init = new Promise(async (resolve, reject) => {
            const DB = (await import("@typestackapp/core/common/db")).default
            TSA._db = await DB.getInstance()

            const ModelLoader = (await import('@typestackapp/core/common/model')).ModelLoader
            const { ConnectionList } = await import("@typestackapp/core/common/rabbitmq/connection")
            const JobList = (await import('@typestackapp/core/common/job')).JobList

            await ModelLoader.loadAllModels()
            TSA._rmq = await ConnectionList.initilize(options?.start_rmq_consumers)
            TSA._jobs = await JobList.getInstance(options?.start_jobs)

            resolve()
        })
    }

    static get rmq(): RMQConnections {
        return TSA._rmq
    }

    static get db(): DBConnections {
        return TSA._db
    }

    static get jobs(): JobList {
        return TSA._jobs
    }

    static get router() {
        return {
            graphql: <T>() => {
                return new GraphqlRouter()
            },
            express: <T>() => {
                return new ExpressRouter()
            },
            action: <T>() => {
                // TODO return next.js server action
            }
        }
    }

    static get rcs() {
        const rcs: string[] = []
        if( tsapp.env.TSAPP_RCS || tsapp.env.TSAPP_RCS !== "" ) {
            const c_serv = tsapp.env.TSAPP_RCS?.split(",")
            if(c_serv) rcs.push(...c_serv)
        }
        return rcs
    }

    static get config() {
        return config as Config
    }

    static get package() {
        const configs = getPackageConfigs() as {[key in Packages]: ReturnType<typeof getPackageConfigs>[string]}
        const keys = Object.keys(configs) as Packages[]

        // initilize object with empty arrays
        const access: IAccessOptions[] = []

        for(const key of keys) {
            const _config = config[key].access.ACTIVE
            for(const [_key, value] of Object.entries(_config)) {
                for(const [__key, __value] of Object.entries(value)) {
                    access.push(__value as any)
                }
            } 
        }

        return {
            configs,
            keys,
            access
        }
    }
}