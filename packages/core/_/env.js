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
const db_1 = __importDefault(require("@typestackapp/core/common/db"));
// jest should have any global promise to execute beforeAll
db_1.default.getInstance();
global.core_tsapp_test = (global === null || global === void 0 ? void 0 : global.core_tsapp_test) || {};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.getInstance();
    const module = require("@typestackapp/core/_/setup");
    yield module.setup();
}));
//# sourceMappingURL=env.js.map