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
exports.retry = exports.sleep = exports.appRoot = void 0;
const path_1 = __importDefault(require("path"));
exports.appRoot = path_1.default.resolve(__dirname);
const sleep = (ms) => new Promise(r => setInterval(r, ms));
exports.sleep = sleep;
const retry = (fn, count = 0, maxCount = 20, sleepInterval = 1000) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        fn();
    }
    catch (e) {
        console.debug(e);
        console.debug('Retrying...', count + 1);
        if (count < maxCount) {
            yield (0, exports.sleep)(sleepInterval);
            (0, exports.retry)(fn, count + 1, maxCount);
        }
        else {
            throw e;
        }
    }
});
exports.retry = retry;
