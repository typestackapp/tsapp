#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./common/util");
const minimist_1 = __importDefault(require("./lib/minimist"));
const argv = (0, minimist_1.default)(process.argv.slice(2));
const action = argv['_'][0];
const cwd = (argv === null || argv === void 0 ? void 0 : argv.cwd) || (0, util_1.findTSAppRootDir)();
console.log(`cwd: ${cwd}`);
console.log(`action: ${action}`);
console.log(argv);
if (!cwd)
    console.log(`Could not find tsapp root dir`);
if (!cwd)
    process.exit(1);
const config_options = {
    cwd,
    link: (argv.link == undefined) ? true : argv.link
};
const service_options = {
    cwd,
    up: argv === null || argv === void 0 ? void 0 : argv.up,
    env: argv === null || argv === void 0 ? void 0 : argv.env
};
const graphql_options = {
    cwd
};
const update_options = {
    cwd
};
const init_options = {
    cwd,
    env: argv === null || argv === void 0 ? void 0 : argv.env
};
switch (action) {
    case 'config':
        Promise.resolve().then(() => __importStar(require("./common/config"))).then(module => module.config(config_options))
            .catch(error => console.log(error));
        break;
    case 'graphql':
        Promise.resolve().then(() => __importStar(require("./common/graphql"))).then(module => module.graphql(graphql_options))
            .catch(error => console.log(error));
        break;
    case 'update':
        Promise.resolve().then(() => __importStar(require("./common/update"))).then(module => module.update(update_options))
            .catch(error => console.log(error));
        break;
    case 'service':
        Promise.resolve().then(() => __importStar(require("./common/service"))).then(module => module.service(service_options))
            .catch(error => console.log(error));
        break;
    case 'init':
        Promise.resolve().then(() => __importStar(require("./common/init"))).then(module => module.init(init_options))
            .catch(error => console.log(error));
        break;
    default:
        console.log(`Unknown action: ${action}`);
        console.log(`Available actions: init, config, service, docker, update`);
        break;
}
