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
const util_1 = require("./util");
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
        const { UpdateModel } = yield Promise.resolve().then(() => __importStar(require("@typestackapp/core/models/update")));
        const session = yield global.tsapp["@typestackapp/core"].db.mongoose.core.startSession();
        session.startTransaction();
        // sleep for 2 second, fixes Update error: MongoServerError: Unable to acquire IX lock on
        yield (0, util_1.sleep)(2);
        const pack_updates = [];
        const pack_errors = [];
        console.log(`Info, updating packages:`);
        for (const [pack_key, pack] of Object.entries(core.packages)) {
            const update_path = `${options.cwd}/node_modules/${pack_key}/models/update`;
            const pack_version = (0, util_1.getPackageVersion)(pack_key);
            console.log(`Info, ${pack_key}:${pack_version}`);
            if (!fs_1.default.existsSync(update_path))
                continue;
            // read each file in the update folder
            const files = yield fs_1.default.promises.readdir(update_path);
            for (const file of files) {
                const filePath = `${update_path}/${file}`;
                // use .js files only
                if (file.split(".").pop() != "js")
                    continue;
                // use .js file only if .d.ts file exists
                if (!fs_1.default.existsSync(`${update_path}/${file.replace('.js', '.ts')}`))
                    continue;
                const module = yield Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
                if (!module.transaction)
                    continue;
                const transaction = module.transaction;
                const update_input = {
                    pack: pack_key,
                    version: pack_version,
                    log: []
                };
                const update = yield UpdateModel.findOneAndUpdate({ version: update_input.version }, update_input, { upsert: true, new: true });
                update.log.push({ type: "update", msg: "started" });
                const logFilePath = filePath.replace('.js', '.ts').split('/').slice(-2).join('/');
                console.log(`Info,  ${logFilePath}`);
                yield transaction(session, update)
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    update.log.push({ type: "update", msg: "completed" });
                    pack_updates.push(update);
                }))
                    .catch((err) => __awaiter(this, void 0, void 0, function* () {
                    console.log("Update error in package: ", pack_key);
                    console.log("Update error:", err);
                    update.log.push({ type: "error", msg: `${err}` });
                    pack_errors.push(update);
                }));
            }
        }
        if (pack_errors.length > 0) {
            console.log(`Error, update failed`);
            yield session.abortTransaction();
            session.endSession();
        }
        else {
            console.log(`Info, update completed`);
            yield session.commitTransaction();
            session.endSession();
        }
        // save each update
        for (const update of pack_updates) {
            yield update.save();
        }
        // save each error
        for (const update of pack_errors) {
            yield update.save();
        }
        console.log(`Info, update log saved`);
        process.exit(0);
    });
}
exports.update = update;
