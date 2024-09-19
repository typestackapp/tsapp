"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("@typestackapp/core");
const env_1 = require("@typestackapp/core/env");
if (env_1.tsapp.env.TSAPP_ENV_TYPE == "prod")
    throw "Can't run tests in production enviroment";
// remove logs at the begining of all tests, setup() runs before each test file!
if (core_1.TSA.config["@typestackapp/core"].system.DEV_CLEAN_MESSAGES_LOGS) {
    fs_extra_1.default.emptyDirSync(`${process.cwd()}/logs/email`);
    fs_extra_1.default.emptyDirSync(`/tsapp/logs/email`);
}
core_1.TSA.init();
//# sourceMappingURL=env.js.map