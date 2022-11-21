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
const fs_1 = __importDefault(require("fs"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const utils_1 = require("./utils");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = yield (0, enquirer_1.prompt)({
        type: 'input',
        name: 'url',
        message: 'Please enter the YouTube video URL'
    });
    // Get video info
    const info = yield ytdl_core_1.default.getBasicInfo(url);
    const outputFileName = (0, utils_1.getOutputFileName)(info);
    // Download thumbnail and convert it to .png
    const imageOutputFileName = `${process.cwd()}/temp_thumbnail.png`;
    yield (0, utils_1.processImage)(info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url, imageOutputFileName);
    // Download video, attach thumbnail and convert it to .mp4
    yield (0, utils_1.processVideo)(url, outputFileName, imageOutputFileName);
    // Delete downloaded thumbnail image
    console.info('Cleaning up files...');
    fs_1.default.unlinkSync(imageOutputFileName);
    console.info('Cleanup successful');
}))();
