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
exports.update = void 0;
const fs_1 = __importDefault(require("fs"));
function update(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const core = yield Promise.resolve().then(() => __importStar(require("@typestackapp/core")));
        console.log(`Info, connecting to databases`);
        const db = yield Promise.resolve().then(() => __importStar(require("@typestackapp/core/common/db")));
        yield db.default.getInstance();
        console.log(`Info, loading all models`);
        const model_loader = yield Promise.resolve().then(() => __importStar(require("@typestackapp/core/common/model")));
        yield model_loader.ModelLoader.loadAllModels();
        console.log(`Info, connecting to rabbitmq`);
        const rabbitmq = yield Promise.resolve().then(() => __importStar(require("@typestackapp/core/common/rabbitmq/connection")));
        yield rabbitmq.ConnectionList.initilize();
        for (const [pack_key, pack] of Object.entries(core.packages)) {
            const update_path = `${options.cwd}/node_modules/${pack_key}/models/update`;
            console.log(`Info, updating package: ${pack_key}`);
            if (!fs_1.default.existsSync(update_path)) {
                console.log(`Warning, no update scripts found for package: ${pack_key}`);
                continue;
            }
            // read each file in the update folder
            const files = yield fs_1.default.promises.readdir(update_path);
            for (const file of files) {
                const filePath = `${update_path}/${file}`;
                // use .js files only
                if (file.split(".").pop() != "js")
                    continue;
                // use .js file only if .ts file exists
                if (!fs_1.default.existsSync(`${update_path}/${file.replace('.js', '.ts')}`))
                    continue;
                const module = yield Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
                if (module.update) {
                    const logFilePath = filePath.replace('.js', '.ts').split('/').slice(-2).join('/');
                    console.log(`Info, running script: ${logFilePath}`);
                    yield module.update();
                }
            }
        }
        console.log(`Info, update completed`);
        process.exit(0);
    });
}
exports.update = update;
