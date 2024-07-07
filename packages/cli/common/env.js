"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = exports.zod = void 0;
const zod_1 = __importDefault(require("../lib/zod"));
exports.zod = zod_1.default;
class ENV {
    constructor(zod, example) {
        this._zod = zod;
        this._example = example;
    }
    get env() {
        return this.zod.parse(process.env);
    }
    get zod() {
        return this._zod;
    }
    // public get types(): zod.ZodSchema<T> {
    //     return this.zod._def.shape();
    // }
    // public get envKeys(): string[] {
    //     return Object.keys(this.env);
    // }
    // generate example .env file
    get exampleFile() {
        if (!this._example)
            return undefined;
        return Object.entries(this._example).map(([key, value]) => `${key}=${value}`).join("\n");
    }
}
exports.ENV = ENV;
