#!/usr/bin/env node
import type { ConfigOptions } from "./common/config"
import type { ServiceOptions } from "./common/service"
import type { GraphqlOptions } from "./common/graphql"
import type { InitOptions } from "common/init"
import { findTSAppRootDir } from "./common/util"
import { UpdateOptions } from "./common/update"
import minimist from "./lib/minimist"

const argv = minimist(process.argv.slice(2))
const action = argv['_'][0]
const cwd = argv?.cwd || findTSAppRootDir()

console.log(`cwd: ${cwd}`)
console.log(`action: ${action}`)
console.log(argv)

if(!cwd) console.log(`Could not find tsapp root dir`)
if(!cwd) process.exit(1)

const config_options: ConfigOptions = {
    cwd,
    link: (argv.link == undefined)? true : argv.link
}

const service_options: ServiceOptions = {
    cwd,
    up: argv?.up,
    env: argv?.env
}

const graphql_options: GraphqlOptions = {
    cwd
}

const update_options: UpdateOptions = {
    cwd
}

const init_options: InitOptions = {
    cwd,
    env: argv?.env
}

switch(action) {
    case 'config':
        import("./common/config")
        .then(module => module.config(config_options))
        .catch(error => console.log(error))
    break
    case 'graphql':
        import("./common/graphql")
        .then(module => module.graphql(graphql_options))
        .catch(error => console.log(error))
    break
    case 'update':
        import("./common/update")
        .then(module => module.update(update_options))
        .catch(error => console.log(error))
    break
    case 'service':
        import("./common/service")
        .then(module => module.service(service_options))
        .catch(error => console.log(error))
    break
    case 'init':
        import("./common/init")
        .then(module => module.init(init_options))
        .catch(error => console.log(error))
    break
    default:
        console.log(`Unknown action: ${action}`)
        console.log(`Available actions: init, config, service, docker, update`)
    break
}