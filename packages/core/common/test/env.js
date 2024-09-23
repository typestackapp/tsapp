"use strict";
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
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("@typestackapp/core");
const env_1 = require("@typestackapp/core/env");
if (env_1.tsapp.env.TSAPP_ENV_TYPE == "prod")
    throw "Can't run tests in production enviroment";
// wait for all connections to be established
module.exports = () => __awaiter(void 0, void 0, void 0, function* () { return core_1.TSA.init(); });
// remove logs at the begining of all tests, setup() runs before each test file!
if (core_1.TSA.config["@typestackapp/core"].system.DEV_CLEAN_MESSAGES_LOGS) {
    fs_extra_1.default.emptyDirSync(`${process.cwd()}/logs/email`);
    fs_extra_1.default.emptyDirSync(`/tsapp/logs/email`);
}
//# sourceMappingURL=env.js.map