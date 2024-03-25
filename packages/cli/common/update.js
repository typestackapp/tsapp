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
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
function update() {
    return __awaiter(this, void 0, void 0, function* () {
        // await import("@typestackapp/core/codegen/config")
        // const DB = await (await import("@typestackapp/core/common/db")).default.getInstance()
        // const update_model = await import("@typestackapp/core/models/update")
        // TODO gep packages
        // run each package update
    });
}
exports.update = update;
