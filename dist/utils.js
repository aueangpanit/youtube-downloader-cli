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
exports.processImage = exports.processVideo = exports.getOutputFileName = void 0;
const child_process_1 = __importDefault(require("child_process"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const fs_1 = __importDefault(require("fs"));
const image_downloader_1 = __importDefault(require("image-downloader"));
const readline_1 = __importDefault(require("readline"));
const sharp_1 = __importDefault(require("sharp"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
sharp_1.default.cache({ files: 0 });
function getOutputFileName(info) {
    return `${info.videoDetails.publishDate.replace(/-/g, ' ')} ${info.videoDetails.ownerChannelName} - ${info.videoDetails.title}`
        .replace(/[/\\?%*:|"<>]/g, '')
        .replace(/\s\s+/g, ' ')
        .trim();
}
exports.getOutputFileName = getOutputFileName;
function processVideo(url, outputFileName, thumbnail_url) {
    console.info('Processing video...');
    const tracker = {
        start: Date.now(),
        audio: { downloaded: 0, total: Infinity },
        video: { downloaded: 0, total: Infinity },
        merged: { frame: 0, speed: '0x', fps: 0 }
    };
    return new Promise(resolve => {
        // Get audio and video streams
        const audio = (0, ytdl_core_1.default)(url, { quality: 'highestaudio' }).on('progress', (_, downloaded, total) => {
            tracker.audio = { downloaded, total };
        });
        const video = (0, ytdl_core_1.default)(url, { quality: 'highestvideo' }).on('progress', (_, downloaded, total) => {
            tracker.video = { downloaded, total };
        });
        // Prepare the progress bar
        let progressbarHandle = null;
        const progressbarInterval = 1000;
        const showProgress = () => {
            readline_1.default.cursorTo(process.stdout, 0);
            const toMB = (i) => (i / 1024 / 1024).toFixed(2);
            process.stdout.write(`Audio  | ${((tracker.audio.downloaded / tracker.audio.total) *
                100).toFixed(2)}% processed `);
            process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);
            process.stdout.write(`Video  | ${((tracker.video.downloaded / tracker.video.total) *
                100).toFixed(2)}% processed `);
            process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);
            process.stdout.write(`Merged | Processing frame ${tracker.merged.frame} `);
            process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);
            process.stdout.write(`Running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
            readline_1.default.moveCursor(process.stdout, 0, -3);
        };
        // Start the ffmpeg child process
        const ffmpegProcess = child_process_1.default.spawn(ffmpeg_static_1.default, [
            // Remove ffmpeg's console spamming
            '-loglevel',
            '8',
            '-hide_banner',
            // Redirect/Enable progress messages
            '-progress',
            'pipe:3',
            // Set inputs
            '-i',
            'pipe:4',
            '-i',
            'pipe:5',
            '-i',
            thumbnail_url,
            // Map audio & video from streams
            '-map',
            '0:a',
            '-map',
            '1:v',
            '-map',
            '2',
            // Keep encoding
            '-c:v',
            'copy',
            '-f',
            'mp4',
            // Thumbnail
            '-disposition:2',
            'attached_pic',
            `${process.cwd()}/${outputFileName}.mp4`
        ], {
            windowsHide: true,
            stdio: [
                /* Standard: stdin, stdout, stderr */
                'inherit',
                'inherit',
                'inherit',
                /* Custom: pipe:3, pipe:4, pipe:5 */
                'pipe',
                'pipe',
                'pipe'
            ]
        });
        // console.log(ffmpegProcess)
        ffmpegProcess.on('close', () => {
            // Cleanup
            process.stdout.write('\n\n\n\n');
            clearInterval(progressbarHandle);
            console.info('Video processed successfully');
            resolve(true);
        });
        // Link streams
        // FFmpeg creates the transformer streams and we just have to insert / read data
        ffmpegProcess.stdio[3].on('data', (chunk) => {
            // Start the progress bar
            if (!progressbarHandle)
                progressbarHandle = setInterval(showProgress, progressbarInterval);
            // Parse the param=value list returned by ffmpeg
            const lines = chunk.toString().trim().split('\n');
            const args = {};
            for (const l of lines) {
                const [key, value] = l.split('=');
                args[key.trim()] = value.trim();
            }
            tracker.merged = args;
        });
        audio.pipe(ffmpegProcess.stdio[4]);
        video.pipe(ffmpegProcess.stdio[5]);
    });
}
exports.processVideo = processVideo;
function processImage(url, outputFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            url,
            dest: process.cwd()
        };
        console.info('Downloading thumbnail...');
        const imgDownloadRes = yield image_downloader_1.default.image(options);
        console.info('Thumbnail downloaded successfully');
        console.info('Processing thumbnail...');
        yield (0, sharp_1.default)(imgDownloadRes.filename).toFile(outputFileName);
        console.info('Thumbnail processed successfully');
        fs_1.default.unlinkSync(imgDownloadRes.filename);
    });
}
exports.processImage = processImage;
