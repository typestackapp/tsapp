#!/usr/bin/env node
import type { ConfigOptions } from "./common/config"
import type { ServerOptions } from "./common/service"
import type { GraphqlOptions } from "./common/graphql"
import { findTSAppRootDir } from "./common/util"
import minimist from "./lib/minimist"

const argv = minimist(process.argv.slice(2))
const action = argv['_'][0]
const env_vars: string[] | string | undefined  = argv?.e
const cwd = argv?.cwd || findTSAppRootDir()

console.log(`cwd: ${cwd}`)
console.log(`action: ${action}`)
console.log(argv)

if(!cwd) console.log(`Could not find tsapp root dir`)
if(!cwd) process.exit(1)

const config_options: ConfigOptions = {
    cwd
}

const service_options: ServerOptions = {
    server: argv?.server || "",
    name: argv?.name || "",
    env: argv?.env || "",
    tpl: argv?.tpl,
    e: env_vars ? typeof env_vars === 'string' ? [env_vars] : env_vars : [],
    pack: argv?.pack || undefined
}

const graphql_options: GraphqlOptions = {}

switch(action) {
    case 'config':
        console.log(`Generating configs`)
        import("./common/config").then(module => module.config(config_options))
    break
    case 'graphql':
        console.log(`Generating graphql`)
        import("./common/graphql").then(module => module.graphql(graphql_options))
    break
    case 'update':
        console.log(`Updating system`)
        import("./common/update").then(module => module.update())
    break
    case 'service':
        console.log(`Starting service`)
        import("./common/service").then(module => module.server(service_options))
    break
    default:
        console.log(`Unknown action: ${action}`)
        console.log(`Available actions: config, server, docker, test, update`)
    break
}