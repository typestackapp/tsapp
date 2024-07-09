import zod from "../lib/zod"
import path from "path"
import fs from "fs"
import { prepareEnvVars } from "./util"

export { zod }

export type Module = {
    [key: string]: ENV<ZodEnvObject>;
}

export type EnvObject = {
    [key: string]: string | number | boolean | undefined;
}

export type EnvOptions = {
    example: boolean // @default true // adds example values to /packages/${pack}/example.env file
    service: boolean // @default false // creates service.env file in docker-... that can be used to import env vars to other containers
    default: boolean // @default false // creates default.env file in docker-..., automaticly improts it to tsapp node.js container
}

// only allow object where values can be string number or boolean
export type ZodEnvObject = {
    [key: string]: zod.ZodType<string | undefined> | zod.ZodType<number | undefined> | zod.ZodType<boolean | undefined>
}

export class ENV<T extends ZodEnvObject> {
    private _zod: zod.ZodObject<T>;
    private _example?: zod.infer<zod.ZodObject<T>>;
    private _dir: string;
    private _options: EnvOptions;
    private _package: {
        name?: string;
        version?: string;
        description?: string;
    };

    constructor(shape: T, example?: zod.infer<zod.ZodObject<T>>, options?: Partial<EnvOptions>) {
        this._zod = zod.object(shape);
        this._example = example;
        this._options =  this.getDefaultOptions(options);

        this._dir = this.getClassInstaceInfo(new Error()).dir;
        this._package = this.getFilePackageJson(this._dir);
    }

    public get example() {
        return this._example;
    }

    public get options() {
        return this._options;
    }

    public get env(): zod.infer<zod.ZodObject<T>> {
        return this.zod.parse(this.filter(process.env));
    }

    private get zod(): zod.ZodObject<T> {
        return zod.object(this._zod.shape);
    }

    public validate(env: zod.infer<zod.ZodObject<T>>) {
        return this.zod.safeParse(env);
    }

    public export<N extends ZodEnvObject>(shape?: N, example?: Partial<zod.infer<zod.ZodObject<T>>> & zod.infer<zod.ZodObject<N>>, options?: Partial<EnvOptions>) {
        const _example = { ...this._example, ...example } as zod.infer<zod.ZodObject<T & N>>
        const env = new ENV({ ...this._zod.shape, ...shape }, _example, { ...this._options, ...options });
        env._dir = this._dir;
        env._package = this._package;
        return env
    }

    // generate example .env file
    public exampleFile(): string | undefined {
        if (!this._example) return undefined;
        return this.toFile(this._example);
    }

    public toFile(vars: zod.infer<zod.ZodObject<ZodEnvObject>>) {
        return Object.entries(vars).map(([key, value]) => `${key}=${value}`).join("\n");
    }
    
    // finds .env file in package directory and returns parsed env vars
    public getEnvVars(env_file_name: string): zod.infer<zod.ZodObject<ZodEnvObject>> {
        return this.filter(prepareEnvVars(`${this._dir}/${env_file_name}`));
    }

    // filter env vars to only include the ones defined in the zod schema
    public filter(env_vars: zod.infer<zod.ZodObject<ZodEnvObject>>) {
        const vars: zod.infer<zod.ZodObject<ZodEnvObject>> = {}
        for (const key in env_vars) {
            if (this.zod.shape[key]) {
                vars[key] = env_vars[key];
            }
        }
        return vars;
    }

    private getDefaultOptions(options?: Partial<EnvOptions>): EnvOptions {
        return {
            service: false,
            example: true,
            default: false,
            ...options
        }
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
        if (!locationMatch) throw new Error("Could not parse stack trace");

        return {
            dir: path.dirname(locationMatch[1]),
            file: locationMatch[1],
            line: locationMatch[2],
            column: locationMatch[3],
        };
    }
}