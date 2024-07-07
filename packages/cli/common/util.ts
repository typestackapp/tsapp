import fs from 'fs'
import path from 'path'
import merge from '../lib/merge'

type Config = any
type Packages = string
type GraphqlResovlerModule = any
type GraphqlRouter<T> = any
type GraphqlServerConfig = any
type IGraphqlRouter = any

export function getPackageConfigs() {
    const packages: {
        [key: string]: {
            haproxy?: { 
                rewrite: boolean
            },
            disable_next_alias?: true,
            version: string, 
            alias: string 
        }
    } = {}

    const cwd = findTSAppRootDir()
    const packages_path = `${cwd}/packages/`
    const main = `${cwd}/package.json`
    const main_package = JSON.parse(fs.readFileSync(main, 'utf8'))
    const packages_list = main_package?.tsapp?.packages

    if(!packages_list) {
        console.log(`Error, missing packages in ${main}`)
        return packages
    }

    if(!packages_list["@typestackapp/core"]) {
        console.log(`Error, missing @typestackapp/core in ${main}`)
        return packages
    }

    for(const [pack_key, pack] of Object.entries(packages_list) as any) {
        // loacate package in packages_path
        const installed_packages = fs.readdirSync(packages_path)
        let alias: string | undefined = undefined
        let version: string | undefined = undefined

        for(const installed_pack of installed_packages) {
            const pack_path = `${packages_path}${installed_pack}/package.json`

            // check if package if package.json exists
            if(!fs.existsSync(pack_path)) continue

            const pack = JSON.parse(fs.readFileSync(pack_path, 'utf8'))
            if(pack.name == pack_key) {
                alias = installed_pack
                version = pack.version
                break
            }
        }

        if(!alias || !version) {
            console.log(`Error, missing ${pack_key} in ${packages_path}`)
            continue
        }

        packages[pack_key] = {
            ...pack,
            alias,
            version,
        }
    }

    // console.log(packages)
    return packages
}

export function getPackageVersion(pack: Packages): string {
    const packages = getPackageConfigs()
    if(!packages[pack]?.version) return "-"
    return packages[pack]?.version
}

export function extractArg(args: any, arg_name: string, required: boolean) {
    const arg_value = args[arg_name]
    if(!arg_value && required){
        throw new Error(`Start server argument ${arg_name} is required`)
    }
    return arg_value
}

export function getDefaultOpts(options: any) {

    function isEnabled(input: any, overwrite: any) {
        if(typeof overwrite == 'boolean') return overwrite
        if(input == undefined) return undefined
        if(Array.isArray(input)) return undefined
        if(Object.keys(input).length == 0) return undefined
        return true
    }

    function getDefault(input: any, defaults: any) {
        if(input == undefined) return undefined
        const enabled = isEnabled(input, input?.enabled)
        if(enabled == undefined) return undefined

        return {
            ...input,
            ...defaults,
            enabled,
        }
    }

    return {
        ...options,
        enabled: isEnabled(options, options?.enabled || true),
        resource: options.resource,
        action: options.action,
        resourceAction: options.resourceAction,
        auth: getDefault(options.auth, {}),
        limit: getDefault(options.limit, {
            limitInterval: options.limit?.limitInterval || '1m',
            limitTreshold: options.limit?.limitTreshold || 500,
        }),
        log: getDefault({
            ...options?.log,
            enabled: options?.log?.enabled != undefined ? options?.log?.enabled : true
        }, {}),
        type: getDefault(options.type, {})
    }
}

export function buidCountryConfig(tsapp_src: string, output_folder: string) {
    const source_file = `${tsapp_src}/countrys.json`
    const dest_file = `${output_folder}/countrys.json`

    // copy source file to dest file
    fs.copyFileSync(source_file, dest_file)

    function cleanCountryList(list: any[]) {
        const new_list = []
        for(let country of list) {
            // convert form stirng to int
            if(country.population)
                country.population = parseInt(country.population)

            if(country.area)
                country.area = parseInt(country.area)
                new_list.push(country)
        }
        return new_list;
    }

    const countrys = JSON.parse(fs.readFileSync(dest_file, 'utf8'))
    const country_lists = countrys.LISTS
    const list = cleanCountryList(countrys.DATA.list)
    const tz = countrys.DATA.tz

    function generateCountryList(list: any[], tz_list: any[]) {

        function resolveTimeZones(alpha2: string, tz_list: any[]) {
            const tz_list_arr = []

            for(let i = 0; i < tz_list.length; i++) {
                const tz = tz_list[i]
                
                if(!tz.alpha2) continue

                const alpha2_list = tz.alpha2.split(',')
                if(alpha2_list.includes(alpha2)) {
                    tz_list_arr.push(tz)
                }
            }
            
            return tz_list_arr
        }

        var country_list: { [key: string]: any } = {}

        for(let i = 0; i < list.length; i++) {
            const country = list[i]
            const country_obj = {
                ...country,
                timezones: resolveTimeZones(country.alpha2, tz_list)
            }
            country_list[country.alpha2] = country_obj
        }

        return country_list
    }

    function resolveCountry(alpha2: string, country_list: any) {
        return country_list[alpha2]
    }

    const country_list = generateCountryList(list, tz)
    var countrys_json: any = {}

    // build defined country lists from object or array
    for(const [list_key, list_value] of Object.entries(country_lists)) {
        countrys_json[list_key] = {}
        
        // if list value is object 
        if(typeof list_value === "object" && !Array.isArray(list_value)) {
            let _list_value = list_value as {}
            for(let [country_key, country_value] of Object.entries(_list_value)) {
                let _country_value = (isObject(country_value)) ? country_value as {} : {}
                countrys_json[list_key][country_key] = {...resolveCountry(country_key, country_list), ..._country_value}
                // console.log(countrys_json[list_key][country_key])
            }
            continue
        }

        // if list value is array
        if(Array.isArray(list_value)) {
            // foreach array item
            for(let country_key of list_value) {
                countrys_json[list_key][country_key] = resolveCountry(country_key, country_list)
            }
            continue
        }
    }

    const country_output = {
        ...countrys_json,
        ALL: {...country_list, ...countrys_json.ALL},
        DATA: countrys.DATA
    }

    // rewrite country file
    fs.writeFileSync(dest_file, JSON.stringify(country_output, null, 4))
}

export function copyConfigs(src_folder: string, dest_folder: string) {
    const files = fs.readdirSync(src_folder)

    // create destination folder if not exist
    !fs.existsSync(dest_folder) && fs.mkdirSync(dest_folder, { recursive:true }) 

    for(const file_name of files) {
        const src_file = src_folder+file_name;
        const dst_file = dest_folder+file_name;
        // remove file if exists
        fs.existsSync(dst_file) && fs.unlinkSync(dst_file)
        // copy file
        fs.copyFileSync(src_file, dst_file)
    }
}

export function writePublicFile(dest_file: string, content: any) {
    const file_content = JSON.stringify(content, null, 4)
    const file_path = dest_file.replace('.json', '.public.json')
    fs.writeFileSync(file_path, file_content)
    writeJsonTypeFile(file_path)
}

export function writeJsonTypeFile(dest_file: string) {
    const file_content = `export type T = ${fs.readFileSync(dest_file, 'utf8')}`
    const file_path = dest_file.replace('.json', '.ts')
    fs.writeFileSync(file_path, file_content)
}

// updates single configuration file
export function getConfigFile(dest_file: string, mod_file: string | undefined = undefined) {
    // if dest file not exist, copy source file
    let mod_config = {}

    if(mod_file && fs.existsSync(mod_file)) {
        mod_config = JSON.parse(fs.readFileSync(mod_file, 'utf8'))
    }

    const dest_config = JSON.parse(fs.readFileSync(dest_file, 'utf8'))
    const obj = getConfigObj(mod_config, dest_config, false)
    const obj_public = getConfigObj(mod_config, dest_config, true)

    return {
        name: dest_file.replace(/^.*[\\\/]/, '').split('.')[0],
        ext: dest_file.replace(/^.*[\\\/]/, '').split('.')[1],
        path: dest_file,
        content: obj,
        content_public: obj_public
    }
}

export function isArray(value: any){
    return Array.isArray(value)
}

export function isObject(obj: any){
    return typeof obj === "object" && !isArray(obj) && obj !== null && !isUndefined(obj)
}

export function isEmpty(obj: any){
    return Object.keys(obj).length === 0
}

export function isUndefined(value: any){
    return typeof value === "undefined"
}

export function objKeysIncludes(obj: any, prefix: string){
    for(const k in obj) {
        if(isObject(obj[k]) && objKeysIncludes(obj[k], prefix)) {
            return true
        }

        if(k.includes(prefix)) {
            return true
        }
    }

    return false
}

export function cleanObjKeyNames(obj: any, prefix: string, export_public: boolean, is_public_obj: boolean){
    // deep copy object
    obj = JSON.parse(JSON.stringify(obj))

    for(const key in obj){
        let is_public_obj_tmp = is_public_obj ? true : key.startsWith('@')

        const new_key = key.replace(prefix, '')
        
        // removes prefix from key names
        if(key.startsWith(prefix)) {
            obj[new_key] = obj[key]
            delete obj[key]
        }

        // removes keys that do not start with prefix
        if(!isObject(obj[new_key]) && export_public && !key.startsWith(prefix) && !is_public_obj_tmp) {
            delete obj[new_key]
        }

        if(isObject(obj[new_key]) && obj[new_key] !== null && obj[new_key] !== undefined ) {
            obj[new_key] = cleanObjKeyNames(obj[new_key], prefix, export_public, is_public_obj_tmp)
        }
    }

    return obj
}

export function cleanDestObject(dest_obj: any, is_public_obj: boolean = false, is_root_obj: boolean = true){
    dest_obj = JSON.parse(JSON.stringify(dest_obj))
    if(dest_obj === undefined) return {}

    const is_empty = isEmpty(dest_obj)

    for(const key in dest_obj){
        const is_public_obj_tmp = is_public_obj ? true : key.startsWith('@')

        if(isObject(dest_obj[key])) {
            const new_val = cleanDestObject(dest_obj[key], is_public_obj_tmp, false)
            if(!is_public_obj_tmp && ( isUndefined(new_val) || isEmpty(new_val) )) {
                delete dest_obj[key]
            }else{
                dest_obj[key] = new_val
            }
        }else{
            if(!is_public_obj_tmp) {
                delete dest_obj[key]
            }
        }
    }

    if(!is_root_obj && !is_empty && isEmpty(dest_obj)) {
        return undefined
    }

    return dest_obj
}

// updates object key values
export function getConfigObj(mod_obj: any, dest_obj: any, export_public: boolean, is_root_obj: boolean = true) {
    // deep copy object
    dest_obj = JSON.parse(JSON.stringify(dest_obj))
    mod_obj = JSON.parse(JSON.stringify(mod_obj))
    
    // clean empty objects form dest_obj
    if(export_public) dest_obj = cleanDestObject(dest_obj)

    // merge mod_obj into dest_obj
    for(const key in mod_obj){

        if( is_root_obj 
            && export_public 
            && !key.startsWith('@')
            && isObject(mod_obj[key])
            && !isEmpty(mod_obj[key])
            && !objKeysIncludes(dest_obj[key], '@') 
            && !objKeysIncludes(mod_obj[key], '@')
        ){
            delete dest_obj[key]
            continue
        }

        // remove not needed none object keys
        if( !key.startsWith('@') 
            && export_public 
            && !isObject(mod_obj[key]) 
            && !isObject(dest_obj[key]) 
            && isUndefined(dest_obj["@"+key])
        ){
            delete dest_obj[key]
            continue
        }

        // rename @key to key
        if(!key.startsWith('@') && isUndefined(dest_obj[key])) {
            dest_obj[key] = dest_obj["@"+key]
            delete dest_obj["@"+key]
        }

        let new_value = undefined
        if(isObject(mod_obj[key]) && isObject(dest_obj[key])) {
            new_value = getConfigObj(mod_obj[key], dest_obj[key], export_public, false)

            if(export_public && isEmpty(new_value)){
                delete dest_obj[key]
                continue
            }
        }else if(export_public && isObject(mod_obj[key]) && isUndefined(dest_obj[key])){
            new_value = cleanDestObject(mod_obj[key])
            if(isEmpty(new_value)) new_value = undefined
        }else{
            new_value = mod_obj[key]
        }
        
        dest_obj[key] = new_value
    }

    if(is_root_obj) dest_obj = cleanObjKeyNames(dest_obj, '@', export_public, false)

    return dest_obj;
}

export function mergeWithoutPublicRemoval(mod_obj: any, dest_obj: any) {
    if(Object.keys(mod_obj).length === 0) return dest_obj

    for(let key in mod_obj){
        if(typeof mod_obj[key] === "object") {
            if(!dest_obj[key]){
                dest_obj[key] = mod_obj[key]
            }else{
                dest_obj[key] = mergeWithoutPublicRemoval(mod_obj[key], dest_obj[key])
            }
        }else{
            dest_obj[key] = mod_obj[key]
        }
    }
    return dest_obj;
}

export function addDefaultValues(obj: any, filename: string, pack: string) {
    
    if(filename == "captcha.json") {
        if(obj?.ACTIVE){
            for(let key in obj.ACTIVE){
                obj.ACTIVE[key] = {
                    ...obj.ACTIVE[key],
                    type: key
                }
            }
        }
    }

    if(filename == "graphql.json") {
        if(obj?.ACTIVE){
            for(let key in obj.ACTIVE){
                obj.ACTIVE[key] = {
                    ...obj.ACTIVE[key],
                    serverPath: `/graphql/${pack}/${key}`
                }
            }
        }
    }

    if(filename == "access.json") {
        const set_defaults = (_config: any) => {
            // if empty object
            if(Object.keys(_config).length == 0 || !_config?.ACTIVE) return _config
    
            for(const resource_key of Object.keys(_config.ACTIVE) ) {
                const resource = _config.ACTIVE[resource_key]
                for(const action_key of Object.keys(resource) ) {
                    const action = resource[action_key]
                    _config.ACTIVE[resource_key][action_key]["pack"] = pack
                    _config.ACTIVE[resource_key][action_key]["resource"] = resource_key
                    _config.ACTIVE[resource_key][action_key]["action"] = action_key;
                    _config.ACTIVE[resource_key][action_key]["resourceAction"] = `${resource_key}_${action_key}`
                    _config.ACTIVE[resource_key][action_key] = getDefaultOpts(_config.ACTIVE[resource_key][action_key])
                }
            }
            return _config
        }

        set_defaults(obj)
    }

    return obj
}

export function emptyDir(dir: string){
    for (const file of fs.readdirSync(dir)) {
        const curPath = path.join(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
            emptyDir(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
    }
}

export function getGraphqlRouterConfigs(cwd: string): GraphqlServerConfig[] { 
    const _server: GraphqlServerConfig[] = []
    const config = require(`${cwd}/node_modules/@typestackapp/core`).config as Config
    for(const [package_key, pack] of Object.entries(config) as any) {
        const conf = pack.graphql.ACTIVE
        for(const [server_key, server] of Object.entries(conf)) {
            const srv_input: Partial<GraphqlServerConfig> = server as any            
            const srv = {
                name: server_key,
                pack: package_key as Packages,
                typeDefPath: `${cwd}/node_modules/${package_key}/codegen/${server_key}/index.ts`,
                clientPath: `${cwd}/node_modules/${package_key}/codegen/${server_key}/client/`,
                serverPath: `/graphql/${package_key}/${server_key}`,
                
                isPublic: srv_input?.isPublic || false,
                isServer: srv_input?.isServer || false,
                genClient: srv_input?.genClient || false,
                modules: srv_input?.modules || [],
                documents: srv_input?.documents || [],
            } satisfies GraphqlServerConfig

            //foreach document add path
            srv.documents.forEach((doc: any, index: any) => {
                srv.documents[index] = `${cwd}/node_modules/${doc}`
            })

            //foreach schema add path
            srv.modules.forEach((module: any, index: any) => {
                srv.modules[index] = `${cwd}/node_modules/${module}`
            })

            _server.push(srv)
        }
    }

    return _server
}

export type GetGraphqlModulesOptions = { 
    schema: boolean
    resolvers: boolean
}

// Recursively process all graphql schema files in the given directories
export async function getGraphqlModules(config: GraphqlServerConfig, options: GetGraphqlModulesOptions, directories: string[] | undefined = undefined) {
    let schema: string = ""
    let resolvers: GraphqlResovlerModule = {}
    let routers: IGraphqlRouter[] = []

    if(!directories) directories = config.modules as string[]

    for(const directory of directories) {
        // Read all files and directories from the current directory
        const files = fs.readdirSync(directory);
        for(const file of files) {
            const filePath = path.join(directory, file);
    
            // Check if it's a directory
            if (fs.statSync(filePath).isDirectory()) {
                // Recursive call to process files in nested directories
                const _module = await getGraphqlModules(config, options, [filePath])
                schema += _module.schema
                resolvers = merge(resolvers, _module.resolvers)
                routers.push(..._module.routers)
            }else {
                // use .js files only
                if(file.split(".").pop() != "js")
                    continue

                // use .js file only if .d.ts file exists
                if(!fs.existsSync(filePath.replace('.js', '.d.ts')))
                    continue

                // if options.resolvers is true
                // and file ends with .resolver.js
                if(file.endsWith("resolver.js") && options.resolvers) {
                    console.log(`Loading resolvers: ${filePath}`)
                    const graphql_module = await import(filePath).then((module) => module) as any

                    // as GraphqlRouter<any> | undefined
                    if(graphql_module && Object.keys(graphql_module).length > 0) {
                        for(const [key, graphql_router] of Object.entries<GraphqlRouter<any> | undefined | string>(graphql_module)) {
                            // if module has default export and it's an object
                            if(graphql_router && typeof graphql_router != "string" && graphql_router.resolvers) {
                                resolvers = merge(resolvers, graphql_router.getResolvers())
                                routers.push(...graphql_router.getRouters(config))
                            }
                        }
                    }
                }
                
                // if options.schema is true
                // and file ends with .schema.js
                if(file.endsWith("schema.js") && options.schema) {
                    console.log(`Loading schema: ${filePath}`)

                    const _schema_module = await import(filePath).then((module) => module)

                    if(_schema_module?.default && typeof _schema_module?.default === 'string' && _schema_module.default.startsWith("#graphql"))
                        schema += _schema_module.default

                    for(const [key, value] of Object.entries(_schema_module)) {
                        if(key === 'default') continue
                        if(value && typeof value === 'string' && value.startsWith("#graphql")) {
                            schema += value
                        }
                    }
                }
            }
        }
    }

    return {schema, resolvers, routers}
}

export function prepareEnvVars(env_path: string) {
    const env_file = fs.readFileSync(env_path)
    let env_vars: { [ key: string ]: string } = {}
    // split env file into array
    const env_array = env_file.toString().split("\n")

    // loop through array and update env variables
    for(let i = 0; i < env_array.length; i++){
        const env_var = env_array[i].split("=")
        if(!env_var[1]) continue

        // remove all starting and ending spaces from env var name
        const env_var_name = env_var[0].replace(/\t|\s/g, "").replace("#", "")

        // remove all starting and ending spaces from env var value and remove all " characters
        var env_var_value_tmp = env_var[1].replace(/^\s+|\s+$/g, "").replace(/"/g, "")
        // remove all content after # sign
        env_var_value_tmp = env_var_value_tmp.split("#")[0]
        // trim spaces from env var value
        env_var_value_tmp = env_var_value_tmp.trim()
        // trim ' and  " qoutes from env var value
        env_var_value_tmp = env_var_value_tmp.replace(/^['"]|['"]$/g, "")
        const env_var_value = env_var_value_tmp

        env_vars[env_var_name] = env_var_value
        if(!env_var_value || !env_var_name) continue
        env_vars[env_var_name] = env_var_value
        // console.log(env_var_name + "=" + env_var_value)
    }

    // foreach env var replace ${var} with value
    for(const [key, value] of Object.entries(env_vars)) {
        env_vars[key] = value.replace(/\$\{([^}]*)\}/g, function(match, name) {
            if(!env_vars[name]) {
                console.log(`Error, missing env var: ${name}`)
                return ''
            }
            return env_vars[name]
        })
    }

    return env_vars
}

export async function prepareDockerFile(global_compose_file: Buffer | string, env_vars: any, file: string, output: string, env_name: string) {
    // read compose file
    let docker_compose_file = fs.readFileSync(file).toString() 

    // add global compose file to docker_compose_file with new line
    docker_compose_file = global_compose_file + "\r" + docker_compose_file
    
    // replace file env variables
    const docker_compose_file_new = docker_compose_file.replace(/\$\{([^}]*)\}/g, function(match, name) {
        const replace_with = env_vars[name]
        if(replace_with == undefined) {
            console.warn(`Missing env: ${env_name}, var: ${name}, in: ${file.split('/').pop()}`)
            return ''
        }
        return replace_with
    })

    fs.writeFileSync(output, docker_compose_file_new)
}

export function findTSAppRootDir() {
    let dir = process.cwd()
    while (dir !== '/') {
        if (fs.existsSync(`${dir}/package.json`)) {
            const read_package = JSON.parse(fs.readFileSync(`${dir}/package.json`, 'utf8'))
            if(read_package.tsapp !== undefined) {
                return dir
            }
        }
        dir = path.resolve(dir, '..')
    }
    return undefined
}

export async function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

export function mkDirRecursive(dir: string) {
    if (!fs.existsSync(dir)) {
        const dirs = dir.split('/')
        let _dir = ''
        for(const d of dirs) {
            _dir += d + '/'
            if (!fs.existsSync(_dir)){
                fs.mkdirSync(_dir)
            }
        }
    }
}