"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = exports.zod = void 0;
const zod_1 = __importDefault(require("../lib/zod"));
exports.zod = zod_1.default;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("./util");
class ENV {
    constructor(zod, example, ...deps) {
        this._deps = deps;
        this._zod = zod;
        this._example = example;
        this._dir = this.getClassInstaceInfo(new Error()).dir;
        this._package = this.getFilePackageJson(this._dir);
    }
    get env() {
        return this.zod.parse(this.vars(process.env));
    }
    get zod() {
        return this._zod;
    }
    get deps() {
        return this._deps;
    }
    // filter env vars to only include the ones defined in the zod schema
    vars(env_vars) {
        const vars = {};
        for (const key in env_vars) {
            if (this.zod.shape[key]) {
                vars[key] = env_vars[key];
            }
        }
        return vars;
    }
    getDepsEnvVars(env_file_name) {
        let env_vars = this.vars((0, util_1.prepareEnvVars)(`${this._dir}/${env_file_name}`));
        for (const dep of this.deps) {
            env_vars = Object.assign(Object.assign({}, env_vars), dep.getDepsEnvVars(env_file_name));
        }
        return env_vars;
    }
    // generate default .env file
    getDefaultEnvFile(env_file_name) {
        let env_file = '';
        const env_vars = this.vars((0, util_1.prepareEnvVars)(`${this._dir}/${env_file_name}`));
        for (const dep of this.deps) {
            env_file += dep.getDefaultEnvFile(env_file_name) || '';
        }
        for (const key in this.zod.shape) {
            env_file += `${key}=${env_vars[key]}\n`;
        }
        return `${env_file} \n`;
    }
    // generate example .env file
    get exampleFile() {
        if (!this._example)
            return undefined;
        return this.toFile(this._example);
    }
    toFile(vars) {
        return Object.entries(vars).map(([key, value]) => `${key}=${value}`).join("\n");
    }
    getFilePackageJson(dir) {
        // get package.json file path
        const packageJsonPath = path_1.default.join(dir, "package.json");
        // check if package.json file exists
        if (fs_1.default.existsSync(packageJsonPath)) {
            // read package.json file
            const packageJson = fs_1.default.readFileSync(packageJsonPath, "utf-8");
            // parse package.json file
            return JSON.parse(packageJson);
        }
        return {};
    }
    getClassInstaceInfo(error) {
        const stack = error.stack;
        if (!stack)
            throw new Error("Stack trace is required");
        const stackLines = stack.split('\n');
        const callerLine = stackLines[2]; // The caller is usually the third line in the stack trace
        // Extract file path and line number
        const locationMatch = callerLine.match(/\((.*):(\d+):(\d+)\)/);
        if (!locationMatch)
            throw new Error("Could not parse stack trace");
        return {
            dir: path_1.default.dirname(locationMatch[1]),
            file: locationMatch[1],
            line: locationMatch[2],
            column: locationMatch[3],
        };
    }
}
exports.ENV = ENV;
