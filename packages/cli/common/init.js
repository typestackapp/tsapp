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
exports.init = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = require("./util");
const init = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const env_name = options.env || 'dev';
    const packages = (0, util_1.getPackageConfigs)();
    // copy package/example.env to package/${options.env}.env
    for (const [pack_key, _config] of Object.entries(packages)) {
        const src = `${options.cwd}/packages/${_config.alias}/example.env`;
        const dest = `${options.cwd}/packages/${_config.alias}/${env_name}.env`;
        if (fs_1.default.existsSync(src) && !fs_1.default.existsSync(dest)) {
            fs_1.default.copyFileSync(src, dest);
            console.log(`Copied ${src} to ${dest}`);
        }
        else if (fs_1.default.existsSync(dest)) {
            console.log(`File ${dest} already exists`);
        }
        else if (!fs_1.default.existsSync(src)) {
            console.log(`File ${src} does not exist`);
        }
    }
});
exports.init = init;
