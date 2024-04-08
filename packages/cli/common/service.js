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
Object.defineProperty(exports, "__esModule", { value: true });
exports.service = void 0;
const child_process_1 = require("child_process");
const service = (options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!options.up)
        throw `Error, missing start or up option`;
    if (typeof options.env != 'string')
        throw `Error, missing env option`;
    if (!['prod', 'dev', 'stage'].includes(options.env))
        console.log(`Warning, env should be one of prod, dev, stage`);
    const module_folder = `${process.cwd()}/node_modules/@typestackapp/core`;
    const packages = (yield Promise.resolve(`${module_folder}`).then(s => __importStar(require(s)))).config;
    const env = options.env;
    // start all services for all packages
    for (const [pack_key, pack] of Object.entries(packages)) {
        if (!((_b = (_a = pack === null || pack === void 0 ? void 0 : pack.services) === null || _a === void 0 ? void 0 : _a.ACTIVE) === null || _b === void 0 ? void 0 : _b.start) || !((_d = (_c = pack === null || pack === void 0 ? void 0 : pack.services) === null || _c === void 0 ? void 0 : _c.ACTIVE) === null || _d === void 0 ? void 0 : _d.start[env]))
            continue;
        const start = pack.services.ACTIVE.start[env];
        const templates = pack.services.ACTIVE.templates;
        const services = pack.services.ACTIVE.services;
        if (!start || start.length == 0) {
            console.log(`No services to start for ${pack_key} package`);
            continue;
        }
        else {
            console.log(`Starting services for ${pack_key} package`);
        }
        for (const service of start) {
            const process_name = service.name;
            const template_name = service.template;
            const service_name = service.service;
            const run_before = service.run_before;
            const service_env_vars = service.e;
            // prepare commands
            const template = templates[template_name];
            const script = services[service_name].script;
            const service_args = services[service_name].args;
            const env_vars = Object.assign(Object.assign({}, process.env), service_env_vars);
            var command = run_before ? `${run_before} && ` : '';
            command += template
                .replaceAll('${name}', process_name)
                .replaceAll('${script}', script)
                .replaceAll('${args}', service_args);
            // console.log(`Starting ${process_name} server in ${env} enviroment`)
            // console.log(`Enviroment variables: ${JSON.stringify(env_vars)}`)
            // console.log(`Command: ${command}`)
            // start service
            yield execAsync(command, env_vars);
        }
    }
});
exports.service = service;
function execAsync(command, env_vars) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, { env: env_vars }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            resolve(stdout);
        });
    });
}
