#!/usr/bin/env node
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
const enquirer_1 = require("enquirer");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const downloader_1 = require("./downloader");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = yield (0, enquirer_1.prompt)({
        type: 'input',
        name: 'url',
        message: 'Please enter the YouTube video URL'
    });
    const info = yield ytdl_core_1.default.getBasicInfo(url);
    const output = `${info.videoDetails.publishDate} ${info.videoDetails.title}`;
    yield (0, downloader_1.download)(url, output);
    // await new Promise(r => setTimeout(r, 1 * 1000))
    // console.info('Renaming to: ', output)
    // retry(() => {
    //   fs.renameSync(`${process.cwd()}\\output.mkv`, `${process.cwd()}\\${output}`)
    // })
}))();
