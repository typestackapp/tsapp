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
exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = require("./util");
const child_process_1 = __importDefault(require("child_process"));
const crypto = __importStar(require("crypto"));
const exec = child_process_1.default.execSync;
const config = (options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const CWD = options.cwd;
    const LINK = options.link;
    const core_dir = `${CWD}/packages/core`;
    const module_folder = `${core_dir}/codegen/config`;
    const pack_config_output = `${module_folder}/output.json`;
    const pack_config_ts_output = `${module_folder}/output.ts`;
    const tsapp = (yield Promise.resolve(`${`${CWD}/package.json`}`).then(s => __importStar(require(s)))).tsapp;
    const packages = (0, util_1.getPackageConfigs)();
    //write json to core/codegen/tsapp.json
    fs_1.default.writeFileSync(`${core_dir}/codegen/tsapp.json`, JSON.stringify(Object.assign(Object.assign({}, tsapp), { packages }), null, 4));
    // create module_folder if it dosent exist
    if (!fs_1.default.existsSync(`${module_folder}/source`))
        (0, util_1.mkDirRecursive)(`${module_folder}/source`);
    // create empty config file before building
    if (!fs_1.default.existsSync(pack_config_output))
        fs_1.default.writeFileSync(pack_config_output, JSON.stringify({}, null, 4));
    if (!fs_1.default.existsSync(pack_config_ts_output))
        fs_1.default.writeFileSync(pack_config_ts_output, `export type T = {}`);
    // clean contents of source folder
    fs_1.default.existsSync(`${module_folder}/source`) && (0, util_1.emptyDir)(`${module_folder}/source`);
    // -------------------- PACKAGES --------------------
    // check if packages are installed
    var package_errors = false;
    for (const [pack_key, _config] of Object.entries(packages)) {
        const package_reachable = fs_1.default.existsSync(`${CWD}/packages/${_config.alias}`);
        if (!package_reachable) {
            console.error(`Error:\t Package ${pack_key} is not accessiable via alias ${_config.alias}`);
            package_errors = true;
        }
    }
    if (package_errors) {
        console.error(`Error:\t Fix package errors before continuing`);
        return;
    }
    // -------------------- HAPROXY --------------------
    // create haproxy
    let haproxy_output_file_content = {};
    // foreach package
    for (const [pack_key, _config] of Object.entries(packages)) {
        // skip if _config.haproxy.rewrite is false
        if (((_a = _config.haproxy) === null || _a === void 0 ? void 0 : _a.rewrite) !== true)
            continue;
        const haproxy_input_folder = `${CWD}/packages/${_config.alias}/haproxy/`;
        // check if directory is empty and exists
        if (!fs_1.default.existsSync(haproxy_input_folder) || fs_1.default.readdirSync(haproxy_input_folder).length === 0)
            continue;
        const haproxy_input_files = fs_1.default.readdirSync(haproxy_input_folder);
        for (const haproxy_input_file of haproxy_input_files) {
            const file_name = haproxy_input_file.split('.').slice(0, -1).join(' ');
            const haproxy_input_file_path = `${haproxy_input_folder}/${haproxy_input_file}`;
            if (!fs_1.default.existsSync(haproxy_input_file_path)) {
                console.error(`Error:\t File ${haproxy_input_file_path} does not exist`);
                continue;
            }
            const file_content = fs_1.default.readFileSync(haproxy_input_file_path, 'utf8');
            haproxy_output_file_content[file_name] = "# " + pack_key + ", " + file_name + "\n" + file_content + "\n";
        }
    }
    // write haproxy file
    let haproxy_output_content = "";
    const haproxy_output_folder = `${CWD}/packages/core/codegen/haproxy`;
    const haproxy_output_file = `${haproxy_output_folder}/proxy.cfg`;
    const haproxy_order = ["resolvers", "global", "defaults", "frontend", "backend"];
    const haproxy_output_content_order = [];
    for (const file_name of haproxy_order) {
        for (const [key, content] of Object.entries(haproxy_output_file_content)) {
            if (key.includes(file_name)) {
                haproxy_output_content_order.push({
                    file_name: key,
                    content: content.split("\n").map(line => "\t" + line).join("\n")
                });
            }
        }
    }
    for (const content of haproxy_output_content_order) {
        haproxy_output_content += content.file_name + "\n" + content.content + "\n";
    }
    // create output folder if not exists
    fs_1.default.existsSync(haproxy_output_folder) || fs_1.default.mkdirSync(haproxy_output_folder);
    fs_1.default.writeFileSync(haproxy_output_file, haproxy_output_content);
    // ---------------- DOCKER / ENV --------------------
    const empty_docker_dirs = [];
    const default_files = [];
    // get all default file paths
    for (const [pack_key, _config] of Object.entries(packages)) {
        const pack_folder = `${CWD}/packages/${_config.alias}`;
        const docker_folder = `${pack_folder}/docker/`;
        const env_files = fs_1.default.readdirSync(pack_folder).filter(file => file.includes('.env') && !file.includes('example.'));
        const env_ts_file = `${pack_folder}/env.ts`;
        const env_js_file = `${pack_folder}/env.js`;
        let skip_validation = false;
        if (!fs_1.default.existsSync(env_ts_file) && !fs_1.default.existsSync(env_js_file) && env_files.length > 0) {
            skip_validation = true;
        }
        for (const env_file of env_files) {
            const env_file_name = env_file.split('.')[0];
            const env_file_tags = env_file.split('.').slice(1).slice(0, -1);
            const env_file_tag = env_file_tags.length > 0 ? `.${env_file_tags.join('.')}` : '';
            // check if directory is empty and exists
            if (!fs_1.default.existsSync(docker_folder) || fs_1.default.readdirSync(docker_folder).length === 0)
                continue;
            if (!skip_validation) {
                const default_env_file_name = `.default.${_config.alias}.${env_file}`;
                default_files.push(`"./${default_env_file_name}"`);
            }
        }
    }
    for (const [pack_key, _config] of Object.entries(packages)) {
        const pack_folder = `${CWD}/packages/${_config.alias}`;
        const docker_folder = `${pack_folder}/docker/`;
        const env_files = fs_1.default.readdirSync(pack_folder).filter(file => file.includes('.env') && !file.includes('example.'));
        const env_ts_file = `${pack_folder}/env.ts`;
        const env_js_file = `${pack_folder}/env.js`;
        let skip_validation = false;
        if (!fs_1.default.existsSync(env_ts_file) && !fs_1.default.existsSync(env_js_file) && env_files.length > 0) {
            console.warn(`Missing env.js, will use .env ${env_files.join(', ')} files as is`);
            skip_validation = true;
        }
        if (!skip_validation && fs_1.default.existsSync(env_js_file)) {
            try { // create exmaple file
                const env_js = (yield Promise.resolve(`${`${pack_folder}/env.js`}`).then(s => __importStar(require(s))));
                // filter out default
                let example_file = '';
                for (const [env_key, env] of Object.entries(env_js)) {
                    if (Array.isArray(env))
                        continue;
                    if (!env.exampleFile)
                        continue;
                    if (!env.options.example)
                        continue;
                    example_file += `# ${env_key}\n${env.exampleFile()}\n\n`;
                }
                if (example_file !== '')
                    fs_1.default.writeFileSync(`${pack_folder}/example.env`, example_file);
            }
            catch (error) {
                console.error(`Error while creating example.env in packages/${_config.alias} error: ${error}`);
            }
        }
        for (const env_file of env_files) {
            const env_file_name = env_file.split('.')[0];
            const env_file_tags = env_file.split('.').slice(1).slice(0, -1);
            const env_file_tag = env_file_tags.length > 0 ? `.${env_file_tags.join('.')}` : '';
            const env_file_path = `${pack_folder}/${env_file}`;
            const output_folder = `${CWD}/docker-${env_file_name}/`;
            let env_vars = (0, util_1.prepareEnvVars)(env_file_path);
            // create project folder if not exists
            fs_1.default.existsSync(`${output_folder}`) || fs_1.default.mkdirSync(`${output_folder}`);
            // remove once all files in output_folder
            if (!empty_docker_dirs.includes(output_folder)) {
                (0, util_1.emptyDir)(output_folder);
                empty_docker_dirs.push(output_folder);
            }
            const docker_global_file_path = `${docker_folder}/compose.global.yml`;
            const docker_global_file = fs_1.default.existsSync(docker_global_file_path) ? fs_1.default.readFileSync(docker_global_file_path) : "";
            // check if directory is empty and exists
            if (!fs_1.default.existsSync(docker_folder) || fs_1.default.readdirSync(docker_folder).length === 0)
                continue;
            if (!skip_validation) {
                try { // import env vars from env.js and depenedencies
                    const env_js = (yield Promise.resolve(`${`${pack_folder}/env.js`}`).then(s => __importStar(require(s))));
                    for (const [env_key, env] of Object.entries(env_js)) {
                        if (env_key == "default")
                            continue;
                        env_vars = Object.assign(Object.assign({}, env.getEnvVars(env_file)), env_vars);
                    }
                }
                catch (error) {
                    console.error(`Error while loading env vars in packages/${_config.alias} error: ${error}`);
                }
                try { // create default.env file
                    const env_js = (yield Promise.resolve(`${`${pack_folder}/env.js`}`).then(s => __importStar(require(s))));
                    let default_file = '';
                    for (const [env_key, env] of Object.entries(env_js)) {
                        if (env_key == "default")
                            continue;
                        if (!env.options.default)
                            continue;
                        default_file += `# ${env_key}\n${env.toFile(env.filter(env_vars))}\n\n`;
                    }
                    const default_env_file_name = `.default.${_config.alias}.${env_file_name}${env_file_tag}.env`;
                    if (default_file !== '')
                        fs_1.default.writeFileSync(`${output_folder}/${default_env_file_name}`, default_file);
                }
                catch (error) {
                    console.error(`Error while creating default.env file in packages/${_config.alias} error: ${error}`);
                }
                try { // create service.env file
                    const env_js = (yield Promise.resolve(`${`${pack_folder}/env.js`}`).then(s => __importStar(require(s))));
                    for (const [env_key, env] of Object.entries(env_js)) {
                        if (env_key == "default")
                            continue;
                        if (!env.options.service)
                            continue;
                        const default_env_file_name = `.service.${_config.alias}.${env_key}.${env_file_name}${env_file_tag}.env`;
                        const service_file = `# ${env_key}\n${env.toFile(env.filter(env_vars))}\n\n`;
                        fs_1.default.writeFileSync(`${output_folder}/${default_env_file_name}`, service_file);
                    }
                }
                catch (error) {
                    console.error(`Error while creating default.env file in packages/${_config.alias} error: ${error}`);
                }
                try { // validate env vars
                    const env_js = (yield Promise.resolve(`${`${pack_folder}/env.js`}`).then(s => __importStar(require(s))));
                    for (const [env_key, env] of Object.entries(env_js)) {
                        if (env_key == "default")
                            continue;
                        const result = env.validate(env.filter(env_vars));
                        if (result.success === false) {
                            console.error(`Validating ${_config.alias}/${env_file} with: ${_config.alias}/env.ts:${env_key}:`);
                            let errors = result.error.errors.map((error) => `    ${error.path.join('.')}: ${error.message}`);
                            console.error(errors.join('\n'));
                        }
                    }
                }
                catch (error) {
                    console.error(`Error while validating env vars in packages/${_config.alias} error: ${error}`);
                }
            }
            env_vars["@ALIAS"] = _config.alias;
            env_vars["@DEFAULT_FILES"] = `[${default_files.join(', ')}]`;
            env_vars["@ENV_FILE"] = env_file;
            // foreach docker-compose file in package
            const compose_files = (_b = fs_1.default.readdirSync(docker_folder)) === null || _b === void 0 ? void 0 : _b.filter(file => file.includes('.yml') && !file.includes('global.yml'));
            for (const cfile of compose_files) {
                const input_file_path = `${docker_folder}/${cfile}`;
                const docker_file_name = cfile.replace('.yml', '').replace('compose.', '');
                const output_file_path = `${output_folder}/compose.${_config.alias}.${docker_file_name}${env_file_tag}.yml`;
                // console.log(`Creating ${output_file_path}`)
                // console.log(`Using ${input_file_path}`)
                (0, util_1.prepareDockerFile)(docker_global_file, env_vars, input_file_path, output_file_path, `${_config.alias}/${env_file}`);
            }
            // foreach docker file in package
            const docker_files = (_c = fs_1.default.readdirSync(docker_folder)) === null || _c === void 0 ? void 0 : _c.filter(file => !file.includes('.yml') && file.startsWith('Dockerfile'));
            for (const dfile of docker_files) {
                const input_file_path = `${docker_folder}/${dfile}`;
                const compose_file_name = dfile.replace('Dockerfile.', '');
                const output_file_path = `${output_folder}/Dockerfile.${_config.alias}.${compose_file_name}${env_file_tag}`;
                // console.log(`Creating ${output_file_path}`)
                // console.log(`Using ${input_file_path}`)
                (0, util_1.prepareDockerFile)("", env_vars, input_file_path, output_file_path, `${_config.alias}/${env_file}`);
            }
        }
    }
    // -------------------- CONFIG --------------------
    // for each tsapp module in package.json create output config
    for (const [_package, _config] of Object.entries(packages)) {
        const module_output = `${module_folder}/source/${_package}`;
        const source_folder = `${CWD}/packages/${_config.alias}/configs/source/`;
        const mod_folder = `${CWD}/packages/${_config.alias}/configs/mod/`;
        const output_folder = `${CWD}/packages/${_config.alias}/configs/output/`;
        // if module_output dosent exist create it
        !fs_1.default.existsSync(module_output) && (0, util_1.mkDirRecursive)(module_output);
        // if mod_folder dosent exist create it
        !fs_1.default.existsSync(mod_folder) && (0, util_1.mkDirRecursive)(mod_folder);
        // if output_folder dosent exist create it
        !fs_1.default.existsSync(output_folder) && (0, util_1.mkDirRecursive)(output_folder);
        // if source_folder dosent exist skip
        if (!fs_1.default.existsSync(source_folder))
            continue;
        // build configs
        (0, util_1.copyConfigs)(source_folder, output_folder);
        for (const config_file_name of fs_1.default.readdirSync(output_folder)) {
            const output_file = `${output_folder}/${config_file_name}`;
            const mod_file = `${mod_folder}/${config_file_name}`;
            try {
                const output_file_content = JSON.parse(fs_1.default.readFileSync(output_file, 'utf8'));
                const mod_file_content = fs_1.default.existsSync(mod_file) ? JSON.parse(fs_1.default.readFileSync(mod_file, 'utf8')) : {};
                // merge mod file into output file
                const merged_file = (0, util_1.mergeWithoutPublicRemoval)(mod_file_content, output_file_content);
                // create prefixes
                // const prefixed_merged_file = addNamespaces(merged_file, config_file_name, _config.namespace)
                fs_1.default.writeFileSync(output_file, JSON.stringify(merged_file, null, 4));
            }
            catch (error) {
                console.error(`Error while merging ${output_file} and ${mod_file}`);
                console.error(error);
            }
        }
    }
    const configs = {};
    // merge each module config into one
    for (const [_package, _config] of Object.entries(packages)) {
        const output_folder = `${module_folder}/source/${_package}/`;
        const input_folder = `${CWD}/packages/${_config.alias}/configs/output/`;
        // create package config
        !configs[_package] && (configs[_package] = {});
        configs[_package].alias = _config.alias;
        // foreach folder config file
        for (const _input_file of fs_1.default.readdirSync(input_folder)) {
            const input_file = `${input_folder}/${_input_file}`;
            const output_file = `${output_folder}/${_input_file}`;
            const file_name = _input_file.split('.')[0];
            const merged_file = (0, util_1.getConfigFile)(input_file);
            const content_server = (0, util_1.addDefaultValues)(merged_file.content, _input_file, _package);
            const content_public = (0, util_1.addDefaultValues)(merged_file.content_public, _input_file, _package);
            fs_1.default.writeFileSync(output_file, JSON.stringify(content_server, null, 4));
            (0, util_1.writeJsonTypeFile)(output_file);
            (0, util_1.writePublicFile)(output_file, content_public);
            configs[_package][file_name] = content_server;
        }
        // fill empty configs
        const empty_configs = ['rabbitmq', 'db', 'consumers', "captcha", "graphql", "access"];
        for (const empty_config of empty_configs) {
            if (!configs[_package])
                configs[_package] = {};
            if (!configs[_package][empty_config])
                configs[_package][empty_config] = { ACTIVE: {} };
        }
    }
    // write config file
    fs_1.default.writeFileSync(pack_config_output, JSON.stringify(configs, null, 4));
    (0, util_1.writeJsonTypeFile)(pack_config_output);
    const output_dir = `${core_dir}/codegen/next`;
    // delete `${output_dir}/app` and `${output_dir}/public`
    if (fs_1.default.existsSync(`${output_dir}/app`) && LINK)
        fs_1.default.rmSync(`${output_dir}/app`, { recursive: true });
    if (fs_1.default.existsSync(`${output_dir}/public`) && LINK)
        fs_1.default.rmSync(`${output_dir}/public`, { recursive: true });
    // create output_dir/app
    if (!fs_1.default.existsSync(`${output_dir}/app`) && LINK)
        fs_1.default.mkdirSync(`${output_dir}/app`, { recursive: true });
    // create output_dir/public
    if (!fs_1.default.existsSync(`${output_dir}/public`) && LINK)
        fs_1.default.mkdirSync(`${output_dir}/public`, { recursive: true });
    const linkFolder = (source, target) => {
        // use fs.linkSync to lin each file in source to target
        // if target dosent exist create it
        if (!fs_1.default.existsSync(target))
            (0, util_1.mkDirRecursive)(target);
        // foreach file in source
        for (const file_name of fs_1.default.readdirSync(source)) {
            const source_file = `${source}/${file_name}`;
            const target_file = `${target}/${file_name}`;
            // if file is a folder
            if (fs_1.default.lstatSync(source_file).isDirectory()) {
                // if target folder dosent exist create it
                if (!fs_1.default.existsSync(target_file))
                    (0, util_1.mkDirRecursive)(target_file);
                // link folder
                linkFolder(source_file, target_file);
            }
            else {
                // if target file dosent exist create it
                if (!fs_1.default.existsSync(target_file)) {
                    fs_1.default.linkSync(source_file, target_file);
                }
                else {
                    console.warn(`File ${target_file} already exists`);
                }
            }
        }
    };
    // ------------------- NEXT -------------------
    const unlinkFolder = (target) => {
        // unlink all files in target
        // foreach file in target
        for (const file_name of fs_1.default.readdirSync(target)) {
            if (fs_1.default.lstatSync(`${target}/${file_name}`).isDirectory()) {
                // unlink folder
                unlinkFolder(`${target}/${file_name}`);
            }
            else {
                // unlink file
                if (LINK)
                    fs_1.default.unlinkSync(`${target}/${file_name}`);
            }
        }
    };
    const getSymLink = (path) => {
        // path all upto last /
        let path_to_create = path.split('/').slice(0, -1).join('/');
        // remove last /
        let symlink_path = path.replace(/\/$/, '/');
        return {
            path_to_create,
            symlink_path
        };
    };
    if (LINK && fs_1.default.existsSync(`${output_dir}/app`))
        unlinkFolder(`${output_dir}/app`);
    for (const [pack_key, _config] of Object.entries(packages)) {
        const output_app_dir = getSymLink(`${output_dir}/app/${_config.alias}`);
        const output_public_dir = getSymLink(`${output_dir}/public/${pack_key}`);
        const app_dir = `${CWD}/packages/${_config.alias}/next/app/`;
        const public_dir = `${CWD}/packages/${_config.alias}/next/public/`;
        // skip if next_dir does not exist
        if (!fs_1.default.existsSync(app_dir))
            continue;
        if (_config.disable_next_alias == true) {
            if (LINK)
                linkFolder(app_dir, `${output_dir}/app/`);
        }
        else {
            if (LINK)
                linkFolder(app_dir, output_app_dir.symlink_path);
        }
        // skip if public_dir does not exist
        if (!fs_1.default.existsSync(public_dir))
            continue;
        // create public symlink
        if (LINK && !fs_1.default.existsSync(output_public_dir.path_to_create))
            (0, util_1.mkDirRecursive)(output_public_dir.path_to_create);
        if (LINK && fs_1.default.existsSync(output_public_dir.symlink_path))
            fs_1.default.unlinkSync(output_public_dir.symlink_path);
        if (LINK)
            fs_1.default.symlinkSync(public_dir, output_public_dir.symlink_path, 'dir');
    }
    // if layout.tsx does not exist create it
    if (fs_1.default.existsSync(`${output_dir}/app/`) && !fs_1.default.existsSync(`${output_dir}/app/layout.tsx`)) {
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
        `;
        fs_1.default.writeFileSync(`${output_dir}/app/layout.tsx`, layout);
    }
    // ------------------- NEXT APPS -------------------
    // create file
    const apps_config = [];
    const generateHash = function (str) {
        const hash = crypto.createHash('sha256');
        hash.update(str);
        return hash.digest('hex');
    };
    const pack_config = JSON.parse(fs_1.default.readFileSync(pack_config_output, 'utf8'));
    for (const [pack_key, _config] of Object.entries(pack_config)) {
        if (!((_d = _config.access) === null || _d === void 0 ? void 0 : _d.ACTIVE))
            continue;
        // loop trough each resource
        for (const [resource_key, _resource] of Object.entries(_config.access.ACTIVE)) {
            // loop trough each action
            for (const [action_key, _action] of Object.entries(_resource)) {
                if (_action.next)
                    apps_config.push({
                        alias: _config.alias,
                        pack: pack_key,
                        resource: resource_key,
                        action: action_key,
                        next: {
                            hash: generateHash(pack_key + "_" + resource_key + "_" + action_key),
                            import: _action.next.import,
                            title: _action.next.title || action_key,
                            group: _action.next.group || _config.alias || pack_key,
                            list: _action.next.list || "default"
                        }
                    });
            }
        }
    }
    //WRITE core/codegen/next/apps.tsx
    const apps_output_file = core_dir + "/codegen/next/apps.tsx";
    // if file exists remove it
    if (fs_1.default.existsSync(apps_output_file))
        fs_1.default.unlinkSync(apps_output_file);
    const getAppsConfig = function (app) {
        let alias = app.alias;
        if (typeof app.alias === "string") {
            alias = `"${app.alias}"`;
        }
        if (app.alias === undefined) {
            alias = "undefined";
        }
        if (app.alias === null) {
            alias = "null";
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
        `;
    };
    // create file
    const apps_file = `
        import React from 'react'
        import dynamic from 'next/dynamic'
        // get permisions and filter apps by hash
        export const apps = [
            ${apps_config.map(getAppsConfig).join(',')}
        ]
    `;
    fs_1.default.writeFileSync(apps_output_file, apps_file);
    // ------------------- GRAPHQL -------------------
    //WRITE core/codegen/next/graphql.tsx
    const getGraphqlConfig = function (uri, isPublic) {
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
        `;
    };
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
    `;
    let graphql_services = "";
    for (const [pack_key, _config] of Object.entries(pack_config)) {
        if (!((_e = _config === null || _config === void 0 ? void 0 : _config.graphql) === null || _e === void 0 ? void 0 : _e.ACTIVE)
            || Object.keys(_config.graphql.ACTIVE).length === 0)
            continue;
        graphql_services = `${graphql_services}
            "${pack_key}": {
        `;
        for (const [service_key, service] of Object.entries(_config.graphql.ACTIVE)) {
            if (!service.isServer)
                continue;
            graphql_services = `${graphql_services}
                "${service_key}": ${getGraphqlConfig(`/graphql/${pack_key}/${service_key}/`, service.isPublic)},
            `;
        }
        graphql_services = `${graphql_services}
            },
        `;
    }
    fs_1.default.writeFileSync(`${core_dir}/codegen/next/graphql.ts`, graphql_file.replace('{services}', graphql_services));
});
exports.config = config;
