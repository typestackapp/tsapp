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
exports.server = void 0;
const child_process_1 = require("child_process");
const server = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const module_folder = `${process.cwd()}/node_modules/@typestackapp/cli/config`;
    const config = (yield Promise.resolve(`${module_folder}`).then(s => __importStar(require(s)))).config;
    const env = options.env;
    const server = options.server;
    const name = options.name;
    const tpl = options === null || options === void 0 ? void 0 : options.tpl;
    const pack = options.pack;
    const template = config["@typestackapp/core"].services.ACTIVE.enviroments[env].templates[tpl];
    // prepare commands
    const script = config["@typestackapp/core"].services.ACTIVE.services[server][env].script;
    const run_before_command = config["@typestackapp/core"].services.ACTIVE.services[server][env].before;
    const config_args = config["@typestackapp/core"].services.ACTIVE.services[server][env].args;
    // prepare enviroment variables
    const envs = (options === null || options === void 0 ? void 0 : options.e) ? options.e.reduce((acc, cur) => {
        const [key, value] = cur.split('=');
        acc[key] = value;
        return acc;
    }, {}) : {};
    const env_vars = Object.assign(Object.assign({}, process.env), envs);
    var command = run_before_command ? `${run_before_command} && ` : '';
    command += template
        .replaceAll('${name}', name)
        .replaceAll('${script}', script)
        .replaceAll('${args}', config_args);
    // console.log(`Starting ${name} server in ${env} enviroment`)
    // console.log(`Enviroment variables: ${JSON.stringify(env_vars)}`)
    // console.log(`Command: ${command}`)
    const _process = (0, child_process_1.exec)(command, { env: env_vars });
    _process.stdout.on('data', function (data) {
        console.log(data.toString());
    });
});
exports.server = server;
