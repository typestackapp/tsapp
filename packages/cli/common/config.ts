import fs from 'fs'
import { 
    copyConfigs, getConfigFile, mergeWithoutPublicRemoval, writeJsonTypeFile, 
    writePublicFile, addDefaultValues, emptyDir, prepareEnvVars, prepareDockerFile, 
    mkDirRecursive, getPackageConfigs
} from './util'
import child_process from 'child_process'
import * as crypto from 'crypto'
import { ENV, EnvObject, Module } from './env'

const exec = child_process.execSync

export type ConfigOptions = {
    cwd: string
    link: boolean // create symlinks
}

export type tsappDependencies = {
    [key: string]: {}
}

export const config = async (options: ConfigOptions) => {
    const CWD = options.cwd
    const LINK = options.link
    const core_dir = `${CWD}/packages/core`
    const module_folder = `${core_dir}/codegen/config`
    const pack_config_output = `${module_folder}/output.json`
    const pack_config_ts_output = `${module_folder}/output.ts`
    const tsapp = (await import(`${CWD}/package.json`)).tsapp
    const packages = getPackageConfigs()

    //write json to core/codegen/tsapp.json
    fs.writeFileSync(`${core_dir}/codegen/tsapp.json`, JSON.stringify({...tsapp, packages}, null, 4))

    // create module_folder if it dosent exist
    if(!fs.existsSync(`${module_folder}/source`)) mkDirRecursive(`${module_folder}/source`)

    // create empty config file before building
    if(!fs.existsSync(pack_config_output)) fs.writeFileSync(pack_config_output, JSON.stringify({}, null, 4))
    if(!fs.existsSync(pack_config_ts_output)) fs.writeFileSync(pack_config_ts_output, `export type T = {}`)

    // clean contents of source folder
    fs.existsSync(`${module_folder}/source`) && emptyDir(`${module_folder}/source`)

    // -------------------- PACKAGES --------------------
    // check if packages are installed
    var package_errors = false
    for(const [pack_key, _config] of Object.entries(packages)) {
        const package_reachable = fs.existsSync(`${CWD}/packages/${_config.alias}`)
        if(!package_reachable) {
            console.error(`Error:\t Package ${pack_key} is not accessiable via alias ${_config.alias}`)
            package_errors = true
        }
    }

    if(package_errors) {
        console.error(`Error:\t Fix package errors before continuing`)
        return
    }

    // -------------------- HAPROXY --------------------
    // create haproxy
    let haproxy_output_file_content: {[key: string]: string} = {}
    // foreach package
    for(const [pack_key, _config] of Object.entries(packages)) {
        // skip if _config.haproxy.rewrite is false
        if(_config.haproxy?.rewrite !== true) continue
        const haproxy_input_folder = `${CWD}/packages/${_config.alias}/haproxy/`
        
        // check if directory is empty and exists
        if(!fs.existsSync(haproxy_input_folder) || fs.readdirSync(haproxy_input_folder).length === 0) continue

        const haproxy_input_files = fs.readdirSync(haproxy_input_folder)
        
        for(const haproxy_input_file of haproxy_input_files) {
            const file_name = haproxy_input_file.split('.').slice(0, -1).join(' ')
            const haproxy_input_file_path = `${haproxy_input_folder}/${haproxy_input_file}`
            if(!fs.existsSync(haproxy_input_file_path)) {
                console.error(`Error:\t File ${haproxy_input_file_path} does not exist`)
                continue
            }
            const file_content = fs.readFileSync(haproxy_input_file_path, 'utf8')
            haproxy_output_file_content[file_name] = "# " + pack_key + ", " + file_name + "\n" + file_content + "\n"
        }
    }
    // write haproxy file
    let haproxy_output_content = ""
    const haproxy_output_folder = `${CWD}/packages/core/codegen/haproxy`
    const haproxy_output_file = `${haproxy_output_folder}/proxy.cfg`
    const haproxy_order = ["resolvers", "global", "defaults", "frontend", "backend" ]
    const haproxy_output_content_order: {file_name: string, content: string}[] = []
    for(const file_name of haproxy_order) {
        for(const [key, content] of Object.entries(haproxy_output_file_content)) {
            if(key.includes(file_name)) {
                haproxy_output_content_order.push({
                    file_name: key, 
                    content: content.split("\n").map(line => "\t" + line).join("\n")
                })
            }
        }
    }
    for(const content of haproxy_output_content_order) {
        haproxy_output_content += content.file_name + "\n" + content.content + "\n"
    }
    // create output folder if not exists
    fs.existsSync(haproxy_output_folder) || fs.mkdirSync(haproxy_output_folder)
    fs.writeFileSync(haproxy_output_file, haproxy_output_content)


    // ---------------- DOCKER / ENV --------------------
    for(const [pack_key, _config] of Object.entries(packages)) {
        const pack_folder = `${CWD}/packages/${_config.alias}`
        const docker_folder = `${pack_folder}/docker/`
        const env_files = fs.readdirSync(pack_folder).filter(file => file.includes('.env')&& !file.includes('example.'))
        const env_ts_file = `${pack_folder}/env.ts`
        const env_js_file = `${pack_folder}/env.js`
        const empty_docker_dirs: string[] = []
        let skip_validation = false

        if(!fs.existsSync(env_ts_file) && !fs.existsSync(env_js_file) && env_files.length > 0) {
            console.warn(`Missing env.js, will use .env ${env_files.join(', ')} files as is`)
            skip_validation = true
        }

        if(!skip_validation) {
            // create exmaple file
            try {
                const env_js = (await import(`${pack_folder}/env.js`)) as Module
                // filter out default
                let example_file: string = ''
                for(const [env_key, env] of Object.entries(env_js)) {
                    if(Array.isArray(env)) continue
                    example_file += '# ' + env_key + '\n' + env.exampleFile + '\n\n'
                }
                if(example_file !== '') fs.writeFileSync(`${pack_folder}/example.env`, example_file)
            } catch (error) {
                console.error(`Error while creating example.env in packages/${_config.alias} error: ${error}`)
            }
        }

        for(const env_file of env_files) {
            const env_file_name = env_file.split('.')[0]
            const env_file_tags = env_file.split('.').slice(1).slice(0, -1)
            const env_file_tag: string = env_file_tags.length > 0? `.${env_file_tags.join('.')}` : ''
            const env_file_path = `${pack_folder}/${env_file}`
            const output_folder = `${CWD}/docker-${env_file_name}/`
            const default_files = [] as string[]
            let env_vars: EnvObject = prepareEnvVars(env_file_path)
    
            // create project folder if not exists
            fs.existsSync(`${output_folder}`) || fs.mkdirSync(`${output_folder}`)
    
            // remove once all files in output_folder
            if(!empty_docker_dirs.includes(output_folder)) {
                emptyDir(output_folder)
                empty_docker_dirs.push(output_folder)
            }

            const docker_global_file_path = `${docker_folder}/compose.global.yml`
            const docker_global_file = fs.existsSync(docker_global_file_path)? fs.readFileSync(docker_global_file_path) : ""

            // check if directory is empty and exists
            if(!fs.existsSync(docker_folder) || fs.readdirSync(docker_folder).length === 0) continue

            if(!skip_validation) {
                // create default.env file
                try {
                    const env_js = (await import(`${pack_folder}/env.js`)) as Module
                    let default_file: string = ''
                    for(const [env_key, env] of Object.entries(env_js.default)) {
                        default_file += env.getDefaultEnvFile(env_file)
                    }
                    const default_env_file_name = `default.${_config.alias}.${env_file_name}${env_file_tag}.env`
                    fs.writeFileSync(`${output_folder}/${default_env_file_name}`, default_file)
                    default_files.push(`"./${default_env_file_name}"`)
                } catch (error) {
                    console.error(`Error while creating default.env file in packages/${_config.alias} error: ${error}`)
                }

                // load extra env vars from deps
                try {
                    const env_js = (await import(`${pack_folder}/env.js`)) as Module
                    for(const [env_key, env] of Object.entries(env_js)) {
                        if(Array.isArray(env)) continue
                        const deps_env_vars = env.getDepsEnvVars(env_file)
                        env_vars = { ...deps_env_vars, ...env_vars }
                    }
                } catch (error) {
                    console.error(`Error while loading deps in packages/${_config.alias} error: ${error}`)
                }
            }

            env_vars["@ALIAS"] = _config.alias
            env_vars["@DEFAULT_FILES"] = `[${default_files.join(', ')}]`

            // foreach docker-compose file in package
            const compose_files = fs.readdirSync(docker_folder)?.filter(file => file.includes('.yml') && !file.includes('global.yml'))
            for(const cfile of compose_files) {
                const input_file_path = `${docker_folder}/${cfile}`
                const docker_file_name = cfile.replace('.yml', '').replace('compose.', '')
                const output_file_path = `${output_folder}/compose.${_config.alias}.${docker_file_name}${env_file_tag}.yml`
                // console.log(`Creating ${output_file_path}`)
                // console.log(`Using ${input_file_path}`)
                prepareDockerFile(docker_global_file, env_vars, input_file_path, output_file_path, `${_config.alias}/${env_file}`)
            }

            // foreach docker file in package
            const docker_files = fs.readdirSync(docker_folder)?.filter(file => !file.includes('.yml') && file.startsWith('Dockerfile'))
            for(const dfile of docker_files) {
                const input_file_path = `${docker_folder}/${dfile}`
                const compose_file_name = dfile.replace('Dockerfile.', '')
                const output_file_path = `${output_folder}/Dockerfile.${_config.alias}.${compose_file_name}${env_file_tag}`
                // console.log(`Creating ${output_file_path}`)
                // console.log(`Using ${input_file_path}`)
                prepareDockerFile("", env_vars, input_file_path, output_file_path, `${_config.alias}/${env_file}`)
            }
        }
    }


    // -------------------- CONFIG --------------------
    // for each tsapp module in package.json create output config
    for(const [_package, _config] of Object.entries(packages)) {
        const module_output = `${module_folder}/source/${_package}`
        const source_folder = `${CWD}/packages/${_config.alias}/configs/source/`
        const mod_folder = `${CWD}/packages/${_config.alias}/configs/mod/`
        const output_folder = `${CWD}/packages/${_config.alias}/configs/output/`

        // if module_output dosent exist create it
        !fs.existsSync(module_output) && mkDirRecursive(module_output)
        // if mod_folder dosent exist create it
        !fs.existsSync(mod_folder) && mkDirRecursive(mod_folder)
        // if output_folder dosent exist create it
        !fs.existsSync(output_folder) && mkDirRecursive(output_folder)
        // if source_folder dosent exist skip
        if(!fs.existsSync(source_folder)) continue
    
        // build configs
        copyConfigs( source_folder, output_folder )
        
        for(const config_file_name of fs.readdirSync(output_folder)) {
            const output_file = `${output_folder}/${config_file_name}`
            const mod_file = `${mod_folder}/${config_file_name}`

            try {
                const output_file_content = JSON.parse(fs.readFileSync(output_file, 'utf8'))
                const mod_file_content = fs.existsSync(mod_file)?  JSON.parse(fs.readFileSync(mod_file, 'utf8')) : {}
    
                // merge mod file into output file
                const merged_file = mergeWithoutPublicRemoval(mod_file_content, output_file_content)

                // create prefixes
                // const prefixed_merged_file = addNamespaces(merged_file, config_file_name, _config.namespace)

                fs.writeFileSync(output_file, JSON.stringify(merged_file, null, 4))
            } catch (error) {
                console.error(`Error while merging ${output_file} and ${mod_file}`)
                console.error(error)
            }
        }
    }

    const configs = {} as any

    // merge each module config into one
    for(const [_package, _config] of Object.entries(packages)) {
        const output_folder = `${module_folder}/source/${_package}/`
        const input_folder = `${CWD}/packages/${_config.alias}/configs/output/`

        // create package config
        !configs[_package] && (configs[_package] = {})
        configs[_package].alias = _config.alias

        // foreach folder config file
        for(const _input_file of fs.readdirSync(input_folder)) {
            const input_file = `${input_folder}/${_input_file}`
            const output_file = `${output_folder}/${_input_file}`
            const file_name = _input_file.split('.')[0]

            const merged_file = getConfigFile(input_file)
            const content_server = addDefaultValues(merged_file.content, _input_file, _package)
            const content_public = addDefaultValues(merged_file.content_public, _input_file, _package)

            fs.writeFileSync(output_file, JSON.stringify(content_server, null, 4))
            writeJsonTypeFile(output_file)
            writePublicFile(output_file, content_public)

            configs[_package][file_name] = content_server
        }

        // fill empty configs
        const empty_configs = ['rabbitmq', 'db', 'consumers', "captcha", "graphql", "access"]
        for(const empty_config of empty_configs) {
            if(!configs[_package]) configs[_package] = {}
            if(!configs[_package][empty_config]) configs[_package][empty_config] = {ACTIVE: {}}
        }
    }

    // write config file
    fs.writeFileSync(pack_config_output, JSON.stringify(configs, null, 4))
    writeJsonTypeFile(pack_config_output)


    const output_dir = `${core_dir}/codegen/next`
    // delete `${output_dir}/app` and `${output_dir}/public`
    if(fs.existsSync(`${output_dir}/app`) && LINK) fs.rmSync(`${output_dir}/app`, { recursive:true })
    if(fs.existsSync(`${output_dir}/public`) && LINK) fs.rmSync(`${output_dir}/public`, { recursive:true })
    // create output_dir/app
    if(!fs.existsSync(`${output_dir}/app`) && LINK) fs.mkdirSync(`${output_dir}/app`, { recursive:true })
    // create output_dir/public
    if(!fs.existsSync(`${output_dir}/public`) && LINK) fs.mkdirSync(`${output_dir}/public`, { recursive:true })


    const linkFolder = (source: string, target: string) => {
        // use fs.linkSync to lin each file in source to target

        // if target dosent exist create it
        if(!fs.existsSync(target)) mkDirRecursive(target)

        // foreach file in source
        for(const file_name of fs.readdirSync(source)) {
            const source_file = `${source}/${file_name}`
            const target_file = `${target}/${file_name}`

            // if file is a folder
            if(fs.lstatSync(source_file).isDirectory()) {
                // if target folder dosent exist create it
                if(!fs.existsSync(target_file)) mkDirRecursive(target_file)
                // link folder
                linkFolder(source_file, target_file)
            }else {
                // if target file dosent exist create it
                if(!fs.existsSync(target_file)) {
                    fs.linkSync(source_file, target_file)
                }else {
                    console.warn(`File ${target_file} already exists`)
                }
            }
        }
    }


    // ------------------- NEXT -------------------
    const unlinkFolder = (target: string) => {
        // unlink all files in target

        // foreach file in target
        for(const file_name of fs.readdirSync(target)) {
            if(fs.lstatSync(`${target}/${file_name}`).isDirectory()) {
                // unlink folder
                unlinkFolder(`${target}/${file_name}`)
            } else {
                // unlink file
                if(LINK) fs.unlinkSync(`${target}/${file_name}`)
            }
        }
    }
    const getSymLink = (path: string) => {
        // path all upto last /
        let path_to_create = path.split('/').slice(0, -1).join('/')
        // remove last /
        let symlink_path = path.replace(/\/$/, '/')

        return {
            path_to_create,
            symlink_path
        }
    }

    if(LINK && fs.existsSync(`${output_dir}/app`)) unlinkFolder(`${output_dir}/app`)

    for(const [pack_key, _config] of Object.entries(packages)) {
        const output_app_dir = getSymLink(`${output_dir}/app/${_config.alias}`)
        const output_public_dir = getSymLink(`${output_dir}/public/${pack_key}`)
        const app_dir = `${CWD}/packages/${_config.alias}/next/app/`
        const public_dir = `${CWD}/packages/${_config.alias}/next/public/`

        // skip if next_dir does not exist
        if(!fs.existsSync(app_dir)) continue

        if(_config.disable_next_alias == true) {
            if(LINK) linkFolder(app_dir, `${output_dir}/app/`)
        }else {
            if(LINK) linkFolder(app_dir, output_app_dir.symlink_path)
        }

        // skip if public_dir does not exist
        if(!fs.existsSync(public_dir)) continue
        
        // create public symlink
        if(LINK && !fs.existsSync(output_public_dir.path_to_create)) mkDirRecursive(output_public_dir.path_to_create)
        if(LINK && fs.existsSync(output_public_dir.symlink_path)) fs.unlinkSync(output_public_dir.symlink_path)
        if(LINK) fs.symlinkSync(public_dir, output_public_dir.symlink_path, 'dir')
    }

    // if layout.tsx does not exist create it
    if(fs.existsSync(`${output_dir}/app/`) && !fs.existsSync(`${output_dir}/app/layout.tsx`)) {
        const layout = `
            import React from 'react'
            export default function RootLayout( { children } : { children: React.ReactNode } ) {
            return (
                <html>
                <head>
                    <title></title>
                </head>
                <body>
                    {children}
                </body>
                </html>
            )
            }
        `
        fs.writeFileSync(`${output_dir}/app/layout.tsx`, layout)
    }

    // ------------------- NEXT APPS -------------------
    // create file
    const apps_config: TSAppConfig[] = []

    const generateHash = function (str: string) {
        const hash = crypto.createHash('sha256')
        hash.update(str);
        return hash.digest('hex')
    }

    const pack_config = JSON.parse(fs.readFileSync(pack_config_output, 'utf8'))
    for(const [pack_key, _config] of Object.entries(pack_config) as any) {
        if(!_config.access?.ACTIVE) continue

        // loop trough each resource
        for(const [resource_key, _resource] of Object.entries(_config.access.ACTIVE)){
            // loop trough each action
            for(const [action_key, _action] of Object.entries(_resource)){
                if(_action.next)
                    apps_config.push({
                        alias: _config.alias,
                        pack: pack_key,
                        resource: resource_key,
                        action: action_key,
                        next: {
                            hash: generateHash(pack_key+"_"+resource_key+"_"+action_key),
                            import: _action.next.import,
                            title: _action.next.title || action_key,
                            group: _action.next.group || _config.alias || pack_key,
                            list: _action.next.list || "default"
                        }
                    })
            }
        }
    }

    //WRITE core/codegen/next/apps.tsx
    const apps_output_file = core_dir + "/codegen/next/apps.tsx"
    // if file exists remove it
    if(fs.existsSync(apps_output_file)) fs.unlinkSync(apps_output_file)

    const getAppsConfig = function (app: TSAppConfig) {
        let alias = app.alias

        if(typeof app.alias === "string") {
            alias = `"${app.alias}"`
        }

        if(app.alias === undefined) {
            alias = "undefined"
        }

        if(app.alias === null) {
            alias = "null"
        }

        return `
            {
                alias: ${alias},
                pack: "${app.pack}",
                resource: "${app.resource}",
                action: "${app.action}",
                next: {
                    hash: "${app.next.hash}",
                    import: dynamic(() => import("${app.next.import}"), {
                        ssr: false,
                        loading: () => <p>loading...</p>
                    }),
                    title: "${app.next.title}",
                    group: "${app.next.group}",
                    list: "${app.next.list}"
                }
            }
        `
    }

    // create file
    const apps_file = `
        import React from 'react'
        import dynamic from 'next/dynamic'
        // get permisions and filter apps by hash
        export const apps = [
            ${apps_config.map(getAppsConfig).join(',')}
        ]
    `
    fs.writeFileSync(apps_output_file, apps_file)



    // ------------------- GRAPHQL -------------------
    //WRITE core/codegen/next/graphql.tsx
    const getGraphqlConfig = function (uri: string, isPublic: boolean) {
        return `
            new ApolloClient({
                cache: new InMemoryCache(),
                link: setContext(async (_, { headers }) => {
                    if(${isPublic}){
                        return headers
                    } else {
                        const auth_headers = await tsappClient.getAuthHeaders()
                        return {
                            headers: {
                                ...headers,
                                ...auth_headers,
                            }
                        }
                    }
                }).concat(createHttpLink({
                    uri: "${uri}" // "https://localhost:7443/graphql/@typestackapp/core/system/"
                }))
            })
        `
    }

    const graphql_file = `
        import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"
        import { setContext } from '@apollo/client/link/context'
        import TSAppClient from "@typestackapp/core/models/user/app/oauth/client/tsapp"

        export function getGraphqlClients(tsappClient: TSAppClient) {
            return {
                {services}
            }
        }

        export type GraphqlClients = ReturnType<typeof getGraphqlClients>
    `
    let graphql_services = ""
    for(const [pack_key, _config] of Object.entries(pack_config) as any) {
        if( !_config?.graphql?.ACTIVE 
            || Object.keys(_config.graphql.ACTIVE).length === 0
        ) continue

        graphql_services = `${graphql_services}
            "${pack_key}": {
        `

        for(const [service_key, service] of Object.entries(_config.graphql.ACTIVE) as any) {
            if(!service.isServer) continue

            graphql_services = `${graphql_services}
                "${service_key}": ${getGraphqlConfig(`/graphql/${pack_key}/${service_key}/`, service.isPublic)},
            `
        }

        graphql_services = `${graphql_services}
            },
        `
    }

    fs.writeFileSync(`${core_dir}/codegen/next/graphql.ts`, graphql_file.replace('{services}', graphql_services))
}

type TSAppConfig = {
    alias: string | null | undefined
    pack: string
    resource: string
    action: string
    next: {
        hash: string
        import: string
        title: string
        group: string
        list: "default" | "grow"
    }
}