import { exec } from "child_process"

export type ServerOptions = {
    env: string // dev | prod
    server: string // next | api | jobs | graphql | rmq-${server_name}
    name: string // process name
    e: string[] // enviroment variables space separated key=value, example: --e PORT=3000 --e NODE_ENV=production
    tpl?: string // pm2 | any other template key
    pack?: string // pack name
}

export const server = async (options: ServerOptions) => {
    const module_folder = `${process.cwd()}/node_modules/@typestackapp/cli/config`
    const config = (await import(module_folder)).config

    const env = options.env
    const server = options.server
    const name = options.name
    const tpl = options?.tpl
    const pack = options.pack
    const template = config["@typestackapp/core"].services.ACTIVE.enviroments[env].templates[tpl]

    // prepare commands
    const script = config["@typestackapp/core"].services.ACTIVE.services[server][env].script
    const run_before_command = config["@typestackapp/core"].services.ACTIVE.services[server][env].before
    const config_args = config["@typestackapp/core"].services.ACTIVE.services[server][env].args

    // prepare enviroment variables
    const envs = options?.e ? options.e.reduce((acc, cur) => {
        const [key, value] = cur.split('=')
        acc[key] = value
        return acc
    }, {}) : {}
    const env_vars = { ...process.env, ...envs }

    var command = run_before_command ? `${run_before_command} && ` : ''
    command += template
        .replaceAll('${name}', name)
        .replaceAll('${script}', script)
        .replaceAll('${args}', config_args)
    
    // console.log(`Starting ${name} server in ${env} enviroment`)
    // console.log(`Enviroment variables: ${JSON.stringify(env_vars)}`)
    // console.log(`Command: ${command}`)
    
    const _process = exec(command, { env: env_vars })
    _process.stdout.on('data', function(data) {
        console.log(data.toString())
    })
}