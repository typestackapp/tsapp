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
    constructor(shape, example, options) {
        this._root = true;
        this._extended = false;
        this._zod = zod_1.default.object(shape);
        this._example = example;
        this._options = this.getDefaultOptions(options);
        this._error = new Error();
    }
    get parent() {
        return this._parent;
    }
    get root() {
        return this._root;
    }
    get extended() {
        return this._extended;
    }
    get example() {
        return this._example;
    }
    get options() {
        return this._options;
    }
    get env() {
        return this.zod.parse(this.filter(process.env));
    }
    get zod() {
        return zod_1.default.object(this._zod.shape);
    }
    validate(env) {
        return this.zod.safeParse(env);
    }
    export(shape, example, options) {
        const _example = Object.assign(Object.assign({}, this._example), example);
        const env = new ENV(Object.assign(Object.assign({}, this._zod.shape), shape), _example, Object.assign(Object.assign({}, this._options), options));
        env._error = this._error;
        env._root = false;
        env._extended = true;
        // if shape is empty or undefined extended is false
        if (Object.keys(shape || {}).length === 0) {
            env._extended = false;
        }
        env._parent = this;
        return env;
    }
    // generate example .env file
    exampleFile() {
        if (!this._example)
            return undefined;
        return this.toFile(this._example);
    }
    toFile(vars) {
        return Object.entries(vars).map(([key, value]) => `${key}=${value}`).join("\n");
    }
    // finds .env file in package directory and returns parsed env vars
    // do not use in next.js enviroment
    getEnvVars(env_file_name) {
        const dir = this.getClassInstaceInfo(this._error).dir;
        return this.filter((0, util_1.prepareEnvVars)(`${dir}/${env_file_name}`));
    }
    // filter env vars to only include the ones defined in the zod schema
    filter(env_vars) {
        const vars = {};
        for (const key in env_vars) {
            if (this.zod.shape[key]) {
                vars[key] = env_vars[key];
            }
        }
        return vars;
    }
    getPackage() {
        return this.getFilePackageJson(this.getClassInstaceInfo(this._error).dir);
    }
    getDefaultOptions(options) {
        return Object.assign({ service: false, example: true, default: false }, options);
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
        // find line that contains 
        // linux: "packages/cli/common/env.js"
        // windows: "packages\\cli\\common\\env.js"
        // chose next line
        const linuxLineNum = stackLines.findIndex((line) => line.includes("packages/cli/common/env.js")) + 1;
        const windowsLineNum = stackLines.findIndex((line) => line.includes("packages\\cli\\common\\env.js")) + 1;
        // find line number of the caller
        const clineNum = linuxLineNum || windowsLineNum;
        const callerLine = stackLines[clineNum]; // The caller is usually the third line in the stack trace
        // Extract file path and line number
        const locationMatch = callerLine.match(/\((.*):(\d+):(\d+)\)/);
        if (!locationMatch)
            throw new Error("Could not parse stack trace");
        const dir = path_1.default.dirname(locationMatch[1]);
        return {
            dir: path_1.default.dirname(locationMatch[1]),
            file: locationMatch[1],
            line: locationMatch[2],
            column: locationMatch[3],
            package: this.getFilePackageJson(dir)
        };
    }
}
exports.ENV = ENV;
