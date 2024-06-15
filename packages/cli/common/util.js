"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.findTSAppRootDir = exports.prepareDockerFile = exports.prepareEnvVars = exports.getGraphqlModules = exports.getGraphqlRouterConfigs = exports.emptyDir = exports.addDefaultValues = exports.mergeWithoutPublicRemoval = exports.getConfigObj = exports.cleanDestObject = exports.cleanObjKeyNames = exports.objKeysIncludes = exports.isUndefined = exports.isEmpty = exports.isObject = exports.isArray = exports.getConfigFile = exports.writeJsonTypeFile = exports.writePublicFile = exports.copyConfigs = exports.buidCountryConfig = exports.getDefaultOpts = exports.extractArg = exports.getPackageVersion = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
function getPackageVersion(pack) {
    const _pack = fs_1.default.readFileSync(`${process.cwd()}/node_modules/${pack}/package.json`, 'utf8');
    return JSON.parse(_pack).version;
}
exports.getPackageVersion = getPackageVersion;
function extractArg(args, arg_name, required) {
    const arg_value = args[arg_name];
    if (!arg_value && required) {
        throw new Error(`Start server argument ${arg_name} is required`);
    }
    return arg_value;
}
exports.extractArg = extractArg;
function getDefaultOpts(options) {
    var _a, _b, _c, _d;
    function isEnabled(input, overwrite) {
        if (typeof overwrite == 'boolean')
            return overwrite;
        if (input == undefined)
            return undefined;
        if (Array.isArray(input))
            return undefined;
        if (Object.keys(input).length == 0)
            return undefined;
        return true;
    }
    function getDefault(input, defaults) {
        if (input == undefined)
            return undefined;
        const enabled = isEnabled(input, input === null || input === void 0 ? void 0 : input.enabled);
        if (enabled == undefined)
            return undefined;
        return Object.assign(Object.assign(Object.assign({}, input), defaults), { enabled });
    }
    return Object.assign(Object.assign({}, options), { enabled: isEnabled(options, (options === null || options === void 0 ? void 0 : options.enabled) || true), resource: options.resource, action: options.action, resourceAction: options.resourceAction, auth: getDefault(options.auth, {}), limit: getDefault(options.limit, {
            limitInterval: ((_a = options.limit) === null || _a === void 0 ? void 0 : _a.limitInterval) || '1m',
            limitTreshold: ((_b = options.limit) === null || _b === void 0 ? void 0 : _b.limitTreshold) || 500,
        }), log: getDefault(Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.log), { enabled: ((_c = options === null || options === void 0 ? void 0 : options.log) === null || _c === void 0 ? void 0 : _c.enabled) != undefined ? (_d = options === null || options === void 0 ? void 0 : options.log) === null || _d === void 0 ? void 0 : _d.enabled : true }), {}), type: getDefault(options.type, {}) });
}
exports.getDefaultOpts = getDefaultOpts;
function buidCountryConfig(tsapp_src, output_folder) {
    const source_file = `${tsapp_src}/countrys.json`;
    const dest_file = `${output_folder}/countrys.json`;
    // copy source file to dest file
    fs_1.default.copyFileSync(source_file, dest_file);
    function cleanCountryList(list) {
        const new_list = [];
        for (let country of list) {
            // convert form stirng to int
            if (country.population)
                country.population = parseInt(country.population);
            if (country.area)
                country.area = parseInt(country.area);
            new_list.push(country);
        }
        return new_list;
    }
    const countrys = JSON.parse(fs_1.default.readFileSync(dest_file, 'utf8'));
    const country_lists = countrys.LISTS;
    const list = cleanCountryList(countrys.DATA.list);
    const tz = countrys.DATA.tz;
    function generateCountryList(list, tz_list) {
        function resolveTimeZones(alpha2, tz_list) {
            const tz_list_arr = [];
            for (let i = 0; i < tz_list.length; i++) {
                const tz = tz_list[i];
                if (!tz.alpha2)
                    continue;
                const alpha2_list = tz.alpha2.split(',');
                if (alpha2_list.includes(alpha2)) {
                    tz_list_arr.push(tz);
                }
            }
            return tz_list_arr;
        }
        var country_list = {};
        for (let i = 0; i < list.length; i++) {
            const country = list[i];
            const country_obj = Object.assign(Object.assign({}, country), { timezones: resolveTimeZones(country.alpha2, tz_list) });
            country_list[country.alpha2] = country_obj;
        }
        return country_list;
    }
    function resolveCountry(alpha2, country_list) {
        return country_list[alpha2];
    }
    const country_list = generateCountryList(list, tz);
    var countrys_json = {};
    // build defined country lists from object or array
    for (const [list_key, list_value] of Object.entries(country_lists)) {
        countrys_json[list_key] = {};
        // if list value is object 
        if (typeof list_value === "object" && !Array.isArray(list_value)) {
            let _list_value = list_value;
            for (let [country_key, country_value] of Object.entries(_list_value)) {
                let _country_value = (isObject(country_value)) ? country_value : {};
                countrys_json[list_key][country_key] = Object.assign(Object.assign({}, resolveCountry(country_key, country_list)), _country_value);
                // console.log(countrys_json[list_key][country_key])
            }
            continue;
        }
        // if list value is array
        if (Array.isArray(list_value)) {
            // foreach array item
            for (let country_key of list_value) {
                countrys_json[list_key][country_key] = resolveCountry(country_key, country_list);
            }
            continue;
        }
    }
    const country_output = Object.assign(Object.assign({}, countrys_json), { ALL: Object.assign(Object.assign({}, country_list), countrys_json.ALL), DATA: countrys.DATA });
    // rewrite country file
    fs_1.default.writeFileSync(dest_file, JSON.stringify(country_output, null, 4));
}
exports.buidCountryConfig = buidCountryConfig;
function copyConfigs(src_folder, dest_folder) {
    const files = fs_1.default.readdirSync(src_folder);
    // create destination folder if not exist
    !fs_1.default.existsSync(dest_folder) && fs_1.default.mkdirSync(dest_folder, { recursive: true });
    for (const file_name of files) {
        const src_file = src_folder + file_name;
        const dst_file = dest_folder + file_name;
        // remove file if exists
        fs_1.default.existsSync(dst_file) && fs_1.default.unlinkSync(dst_file);
        // copy file
        fs_1.default.copyFileSync(src_file, dst_file);
    }
}
exports.copyConfigs = copyConfigs;
function writePublicFile(dest_file, content) {
    const file_content = JSON.stringify(content, null, 4);
    const file_path = dest_file.replace('.json', '.public.json');
    fs_1.default.writeFileSync(file_path, file_content);
    writeJsonTypeFile(file_path);
}
exports.writePublicFile = writePublicFile;
function writeJsonTypeFile(dest_file) {
    const file_content = `export type T = ${fs_1.default.readFileSync(dest_file, 'utf8')}`;
    const file_path = dest_file.replace('.json', '.ts');
    fs_1.default.writeFileSync(file_path, file_content);
}
exports.writeJsonTypeFile = writeJsonTypeFile;
// updates single configuration file
function getConfigFile(dest_file, mod_file = undefined) {
    // if dest file not exist, copy source file
    let mod_config = {};
    if (mod_file && fs_1.default.existsSync(mod_file)) {
        mod_config = JSON.parse(fs_1.default.readFileSync(mod_file, 'utf8'));
    }
    const dest_config = JSON.parse(fs_1.default.readFileSync(dest_file, 'utf8'));
    const obj = getConfigObj(mod_config, dest_config, false);
    const obj_public = getConfigObj(mod_config, dest_config, true);
    return {
        name: dest_file.replace(/^.*[\\\/]/, '').split('.')[0],
        ext: dest_file.replace(/^.*[\\\/]/, '').split('.')[1],
        path: dest_file,
        content: obj,
        content_public: obj_public
    };
}
exports.getConfigFile = getConfigFile;
function isArray(value) {
    return Array.isArray(value);
}
exports.isArray = isArray;
function isObject(obj) {
    return typeof obj === "object" && !isArray(obj) && obj !== null && !isUndefined(obj);
}
exports.isObject = isObject;
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
exports.isEmpty = isEmpty;
function isUndefined(value) {
    return typeof value === "undefined";
}
exports.isUndefined = isUndefined;
function objKeysIncludes(obj, prefix) {
    for (const k in obj) {
        if (isObject(obj[k]) && objKeysIncludes(obj[k], prefix)) {
            return true;
        }
        if (k.includes(prefix)) {
            return true;
        }
    }
    return false;
}
exports.objKeysIncludes = objKeysIncludes;
function cleanObjKeyNames(obj, prefix, export_public, is_public_obj) {
    // deep copy object
    obj = JSON.parse(JSON.stringify(obj));
    for (const key in obj) {
        let is_public_obj_tmp = is_public_obj ? true : key.startsWith('@');
        const new_key = key.replace(prefix, '');
        // removes prefix from key names
        if (key.startsWith(prefix)) {
            obj[new_key] = obj[key];
            delete obj[key];
        }
        // removes keys that do not start with prefix
        if (!isObject(obj[new_key]) && export_public && !key.startsWith(prefix) && !is_public_obj_tmp) {
            delete obj[new_key];
        }
        if (isObject(obj[new_key]) && obj[new_key] !== null && obj[new_key] !== undefined) {
            obj[new_key] = cleanObjKeyNames(obj[new_key], prefix, export_public, is_public_obj_tmp);
        }
    }
    return obj;
}
exports.cleanObjKeyNames = cleanObjKeyNames;
function cleanDestObject(dest_obj, is_public_obj = false, is_root_obj = true) {
    dest_obj = JSON.parse(JSON.stringify(dest_obj));
    if (dest_obj === undefined)
        return {};
    const is_empty = isEmpty(dest_obj);
    for (const key in dest_obj) {
        const is_public_obj_tmp = is_public_obj ? true : key.startsWith('@');
        if (isObject(dest_obj[key])) {
            const new_val = cleanDestObject(dest_obj[key], is_public_obj_tmp, false);
            if (!is_public_obj_tmp && (isUndefined(new_val) || isEmpty(new_val))) {
                delete dest_obj[key];
            }
            else {
                dest_obj[key] = new_val;
            }
        }
        else {
            if (!is_public_obj_tmp) {
                delete dest_obj[key];
            }
        }
    }
    if (!is_root_obj && !is_empty && isEmpty(dest_obj)) {
        return undefined;
    }
    return dest_obj;
}
exports.cleanDestObject = cleanDestObject;
// updates object key values
function getConfigObj(mod_obj, dest_obj, export_public, is_root_obj = true) {
    // deep copy object
    dest_obj = JSON.parse(JSON.stringify(dest_obj));
    mod_obj = JSON.parse(JSON.stringify(mod_obj));
    // clean empty objects form dest_obj
    if (export_public)
        dest_obj = cleanDestObject(dest_obj);
    // merge mod_obj into dest_obj
    for (const key in mod_obj) {
        if (is_root_obj
            && export_public
            && !key.startsWith('@')
            && isObject(mod_obj[key])
            && !isEmpty(mod_obj[key])
            && !objKeysIncludes(dest_obj[key], '@')
            && !objKeysIncludes(mod_obj[key], '@')) {
            delete dest_obj[key];
            continue;
        }
        // remove not needed none object keys
        if (!key.startsWith('@')
            && export_public
            && !isObject(mod_obj[key])
            && !isObject(dest_obj[key])
            && isUndefined(dest_obj["@" + key])) {
            delete dest_obj[key];
            continue;
        }
        // rename @key to key
        if (!key.startsWith('@') && isUndefined(dest_obj[key])) {
            dest_obj[key] = dest_obj["@" + key];
            delete dest_obj["@" + key];
        }
        let new_value = undefined;
        if (isObject(mod_obj[key]) && isObject(dest_obj[key])) {
            new_value = getConfigObj(mod_obj[key], dest_obj[key], export_public, false);
            if (export_public && isEmpty(new_value)) {
                delete dest_obj[key];
                continue;
            }
        }
        else if (export_public && isObject(mod_obj[key]) && isUndefined(dest_obj[key])) {
            new_value = cleanDestObject(mod_obj[key]);
            if (isEmpty(new_value))
                new_value = undefined;
        }
        else {
            new_value = mod_obj[key];
        }
        dest_obj[key] = new_value;
    }
    if (is_root_obj)
        dest_obj = cleanObjKeyNames(dest_obj, '@', export_public, false);
    return dest_obj;
}
exports.getConfigObj = getConfigObj;
function mergeWithoutPublicRemoval(mod_obj, dest_obj) {
    if (Object.keys(mod_obj).length === 0)
        return dest_obj;
    for (let key in mod_obj) {
        if (typeof mod_obj[key] === "object") {
            if (!dest_obj[key]) {
                dest_obj[key] = mod_obj[key];
            }
            else {
                dest_obj[key] = mergeWithoutPublicRemoval(mod_obj[key], dest_obj[key]);
            }
        }
        else {
            dest_obj[key] = mod_obj[key];
        }
    }
    return dest_obj;
}
exports.mergeWithoutPublicRemoval = mergeWithoutPublicRemoval;
function addDefaultValues(obj, filename, pack) {
    if (filename == "captcha.json") {
        if (obj === null || obj === void 0 ? void 0 : obj.ACTIVE) {
            for (let key in obj.ACTIVE) {
                obj.ACTIVE[key] = Object.assign(Object.assign({}, obj.ACTIVE[key]), { type: key });
            }
        }
    }
    if (filename == "graphql.json") {
        if (obj === null || obj === void 0 ? void 0 : obj.ACTIVE) {
            for (let key in obj.ACTIVE) {
                obj.ACTIVE[key] = Object.assign(Object.assign({}, obj.ACTIVE[key]), { serverPath: `/graphql/${pack}/${key}` });
            }
        }
    }
    if (filename == "access.json") {
        const set_defaults = (_config) => {
            // if empty object
            if (Object.keys(_config).length == 0 || !(_config === null || _config === void 0 ? void 0 : _config.ACTIVE))
                return _config;
            for (const resource_key of Object.keys(_config.ACTIVE)) {
                const resource = _config.ACTIVE[resource_key];
                for (const action_key of Object.keys(resource)) {
                    const action = resource[action_key];
                    _config.ACTIVE[resource_key][action_key]["pack"] = pack;
                    _config.ACTIVE[resource_key][action_key]["resource"] = resource_key;
                    _config.ACTIVE[resource_key][action_key]["action"] = action_key;
                    _config.ACTIVE[resource_key][action_key]["resourceAction"] = `${resource_key}_${action_key}`;
                    _config.ACTIVE[resource_key][action_key] = getDefaultOpts(_config.ACTIVE[resource_key][action_key]);
                }
            }
            return _config;
        };
        set_defaults(obj);
    }
    return obj;
}
exports.addDefaultValues = addDefaultValues;
function emptyDir(dir) {
    for (const file of fs_1.default.readdirSync(dir)) {
        const curPath = path_1.default.join(dir, file);
        if (fs_1.default.lstatSync(curPath).isDirectory()) { // recurse
            emptyDir(curPath);
        }
        else { // delete file
            fs_1.default.unlinkSync(curPath);
        }
    }
}
exports.emptyDir = emptyDir;
function getGraphqlRouterConfigs() {
    const _server = [];
    const config = require(`${process.cwd()}/node_modules/@typestackapp/core`).config;
    for (const [package_key, pack] of Object.entries(config)) {
        const conf = pack.graphql.ACTIVE;
        for (const [server_key, server] of Object.entries(conf)) {
            const srv_input = server;
            const srv = {
                name: server_key,
                pack: package_key,
                typeDefPath: `${process.cwd()}/node_modules/${package_key}/codegen/${server_key}/index.ts`,
                clientPath: `${process.cwd()}/node_modules/${package_key}/codegen/${server_key}/client/`,
                serverPath: `/graphql/${package_key}/${server_key}`,
                isPublic: (srv_input === null || srv_input === void 0 ? void 0 : srv_input.isPublic) || false,
                isServer: (srv_input === null || srv_input === void 0 ? void 0 : srv_input.isServer) || false,
                modules: (srv_input === null || srv_input === void 0 ? void 0 : srv_input.modules) || [],
                documents: (srv_input === null || srv_input === void 0 ? void 0 : srv_input.documents) || [],
            };
            //foreach document add path
            srv.documents.forEach((doc, index) => {
                srv.documents[index] = `${process.cwd()}/node_modules/${doc}`;
            });
            //foreach schema add path
            srv.modules.forEach((module, index) => {
                srv.modules[index] = `${process.cwd()}/node_modules/${module}`;
            });
            _server.push(srv);
        }
    }
    return _server;
}
exports.getGraphqlRouterConfigs = getGraphqlRouterConfigs;
// Recursively process all graphql schema files in the given directories
function getGraphqlModules(config_1, options_1) {
    return __awaiter(this, arguments, void 0, function* (config, options, directories = []) {
        let schema = "";
        let resolvers = {};
        let routers = [];
        if (!directories)
            directories = config.modules;
        for (const directory of directories) {
            // Read all files and directories from the current directory
            const files = fs_1.default.readdirSync(directory);
            for (const file of files) {
                const filePath = path_1.default.join(directory, file);
                // Check if it's a directory
                if (fs_1.default.statSync(filePath).isDirectory()) {
                    // Recursive call to process files in nested directories
                    const _module = yield getGraphqlModules(config, options, [filePath]);
                    schema += _module.schema;
                    resolvers = (0, lodash_1.merge)(resolvers, _module.resolvers);
                    routers.push(..._module.routers);
                }
                else {
                    // use .js files only
                    if (file.split(".").pop() != "js")
                        continue;
                    // use .js file only if .ts file exists
                    if (!fs_1.default.existsSync(filePath.replace('.js', '.ts')))
                        continue;
                    // if options.resolvers is true
                    // and file ends with .resolver.js
                    if (file.endsWith("resolver.js") && options.resolvers) {
                        console.log(`Loading resolvers: ${filePath}`);
                        const graphql_module = yield Promise.resolve(`${filePath}`).then(s => __importStar(require(s))).then((module) => module);
                        // as GraphqlRouter<any> | undefined
                        if (graphql_module && Object.keys(graphql_module).length > 0) {
                            for (const [key, graphql_router] of Object.entries(graphql_module)) {
                                // if module has default export and it's an object
                                if (graphql_router && typeof graphql_router != "string" && graphql_router.resolvers) {
                                    resolvers = (0, lodash_1.merge)(resolvers, graphql_router.getResolvers());
                                    routers.push(...graphql_router.getRouters(config));
                                }
                            }
                        }
                    }
                    // if options.schema is true
                    // and file ends with .schema.js
                    if (file.endsWith("schema.js") && options.schema) {
                        console.log(`Loading schema: ${filePath}`);
                        const _schema_module = yield Promise.resolve(`${filePath}`).then(s => __importStar(require(s))).then((module) => module);
                        if ((_schema_module === null || _schema_module === void 0 ? void 0 : _schema_module.default) && typeof (_schema_module === null || _schema_module === void 0 ? void 0 : _schema_module.default) === 'string' && _schema_module.default.startsWith("#graphql"))
                            schema += _schema_module.default;
                        for (const [key, value] of Object.entries(_schema_module)) {
                            if (key === 'default')
                                continue;
                            if (value && typeof value === 'string' && value.startsWith("#graphql")) {
                                schema += value;
                            }
                        }
                    }
                }
            }
        }
        return { schema, resolvers, routers };
    });
}
exports.getGraphqlModules = getGraphqlModules;
function prepareEnvVars(env_path) {
    return __awaiter(this, void 0, void 0, function* () {
        const env_file = fs_1.default.readFileSync(env_path);
        let env_vars = {};
        // split env file into array
        const env_array = env_file.toString().split("\n");
        // loop through array and update env variables
        for (let i = 0; i < env_array.length; i++) {
            const env_var = env_array[i].split("=");
            if (!env_var[1])
                continue;
            // remove all starting and ending spaces from env var name
            const env_var_name = env_var[0].replace(/\t|\s/g, "").replace("#", "");
            // remove all starting and ending spaces from env var value and remove all " characters
            var env_var_value_tmp = env_var[1].replace(/^\s+|\s+$/g, "").replace(/"/g, "");
            // remove all content after # sign
            env_var_value_tmp = env_var_value_tmp.split("#")[0];
            // trim spaces from env var value
            env_var_value_tmp = env_var_value_tmp.trim();
            // trim ' and  " qoutes from env var value
            env_var_value_tmp = env_var_value_tmp.replace(/^['"]|['"]$/g, "");
            const env_var_value = env_var_value_tmp;
            env_vars[env_var_name] = env_var_value;
            if (!env_var_value || !env_var_name)
                continue;
            env_vars[env_var_name] = env_var_value;
            // console.log(env_var_name + "=" + env_var_value)
        }
        // foreach env var replace ${var} with value
        for (const [key, value] of Object.entries(env_vars)) {
            env_vars[key] = value.replace(/\$\{([^}]*)\}/g, function (match, name) {
                if (!env_vars[name]) {
                    console.log(`Error, missing env var: ${name}`);
                    return '';
                }
                return env_vars[name];
            });
        }
        return env_vars;
    });
}
exports.prepareEnvVars = prepareEnvVars;
function prepareDockerFile(global_compose_file, env_vars, file, output, env_name) {
    return __awaiter(this, void 0, void 0, function* () {
        // read compose file
        let docker_compose_file = fs_1.default.readFileSync(file).toString();
        // add global compose file to docker_compose_file with new line
        docker_compose_file = global_compose_file + "\r" + docker_compose_file;
        // replace file env variables
        const docker_compose_file_new = docker_compose_file.replace(/\$\{([^}]*)\}/g, function (match, name) {
            const replace_with = env_vars[name];
            if (replace_with == undefined) {
                console.log(`Docker: from: ${env_name}, missing: ${name}, used: ${file.split('/').pop()}`);
                return '';
            }
            return replace_with;
        });
        fs_1.default.writeFileSync(output, docker_compose_file_new);
    });
}
exports.prepareDockerFile = prepareDockerFile;
function findTSAppRootDir() {
    let dir = process.cwd();
    while (dir !== '/') {
        if (fs_1.default.existsSync(`${dir}/package.json`)) {
            const read_package = JSON.parse(fs_1.default.readFileSync(`${dir}/package.json`, 'utf8'));
            if (read_package.tsapp !== undefined) {
                return dir;
            }
        }
        dir = path_1.default.resolve(dir, '..');
    }
    return undefined;
}
exports.findTSAppRootDir = findTSAppRootDir;
function sleep(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    });
}
exports.sleep = sleep;
