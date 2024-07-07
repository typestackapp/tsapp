import zod from "../lib/zod"

export { zod }

export class ENV<T extends {}> {
    private _zod: zod.ZodObject<T>;
    private _example?: zod.infer<zod.ZodObject<T>>;

    constructor(zod: zod.ZodObject<T>, example?: zod.infer<zod.ZodObject<T>>) {
        this._zod = zod;
        this._example = example;
    }

    public get env(): zod.infer<zod.ZodObject<T>> {
        return this.zod.parse(process.env);
    }

    public get zod(): zod.ZodObject<T> {
        return this._zod;
    }

    // public get types(): zod.ZodSchema<T> {
    //     return this.zod._def.shape();
    // }

    // public get envKeys(): string[] {
    //     return Object.keys(this.env);
    // }

    // generate example .env file
    public get exampleFile(): string | undefined {
        if (!this._example) return undefined;
        return Object.entries(this._example).map(([key, value]) => `${key}=${value}`).join("\n");
    }
}