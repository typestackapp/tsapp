import zod from "../lib/zod"
import path from "path"
import fs from "fs"
import { prepareEnvVars } from "./util"

export { zod }

export type Default = ENV<ZodEnvObject>[]

export type Module = {
    [key: string]: ENV<ZodEnvObject>;
} & {
    default?: ENV<ZodEnvObject>[];
}

export type EnvObject = {
    [key: string]: string | number | boolean | undefined;
}

// only allow object where values can be string number or boolean
export type ZodEnvObject = zod.ZodObject<{
    [key: string]: zod.ZodType<string | undefined> | zod.ZodType<number | undefined> | zod.ZodType<boolean | undefined>
}>

export class ENV<T extends ZodEnvObject> {
    private _deps: ENV<ZodEnvObject>[];
    private _zod: T;
    private _example?: zod.infer<T>;
    private _dir: string;
    private _package: {
        name?: string;
        version?: string;
        description?: string;
    };

    constructor(zod: T, example: zod.infer<T>, ...deps: ENV<ZodEnvObject>[]) {
        this._deps = deps;
        this._zod = zod;
        this._example = example;
        this._dir = this.getClassInstaceInfo(new Error()).dir;
        this._package = this.getFilePackageJson(this._dir);
    }

    public get env(): zod.infer<T> {
        return this.zod.parse(this.vars(process.env));
    }

    public get zod(): T {
        return this._zod;
    }

    public get deps(): ENV<ZodEnvObject>[] {
        return this._deps;
    }
    
    // filter env vars to only include the ones defined in the zod schema
    private vars(env_vars: zod.infer<ZodEnvObject>) {
        const vars: zod.infer<ZodEnvObject> = {}
        for (const key in env_vars) {
            if (this.zod.shape[key]) {
                vars[key] = env_vars[key];
            }
        }
        return vars;
    }

    public getDepsEnvVars(env_file_name: string): zod.infer<ZodEnvObject> {
        let env_vars = this.vars(prepareEnvVars(`${this._dir}/${env_file_name}`));
        for (const dep of this.deps) {
            env_vars = { ...env_vars, ...dep.getDepsEnvVars(env_file_name) };
        }
        return env_vars;
    }

    // generate default .env file
    public getDefaultEnvFile(env_file_name: string): string | undefined {
        let env_file = ''
        const env_vars = this.vars(prepareEnvVars(`${this._dir}/${env_file_name}`));
        for (const dep of this.deps) {
            env_file += dep.getDefaultEnvFile(env_file_name) || '';
        }
        for (const key in this.zod.shape) {
            env_file += `${key}=${env_vars[key]}\n`
        }
        return `${env_file} \n`
    }

    // generate example .env file
    public get exampleFile(): string | undefined {
        if (!this._example) return undefined;
        return this.toFile(this._example);
    }

    private toFile(vars: zod.infer<ZodEnvObject>) {
        return Object.entries(vars).map(([key, value]) => `${key}=${value}`).join("\n");
    }

    private getFilePackageJson(dir: string) {
        // get package.json file path
        const packageJsonPath = path.join(dir, "package.json");
        // check if package.json file exists
        if (fs.existsSync(packageJsonPath)) {
            // read package.json file
            const packageJson = fs.readFileSync(packageJsonPath, "utf-8");
            // parse package.json file
            return JSON.parse(packageJson);
        }

        return {};
    }

    private getClassInstaceInfo(error: Error) {
        const stack = error.stack;
        if (!stack) throw new Error("Stack trace is required");
        const stackLines = stack.split('\n');
        const callerLine = stackLines[2]; // The caller is usually the third line in the stack trace
    
        // Extract file path and line number
        const locationMatch = callerLine.match(/\((.*):(\d+):(\d+)\)/);
        if (!locationMatch) throw new Error("Could not parse stack trace");

        return {
            dir: path.dirname(locationMatch[1]),
            file: locationMatch[1],
            line: locationMatch[2],
            column: locationMatch[3],
        };
    }
}