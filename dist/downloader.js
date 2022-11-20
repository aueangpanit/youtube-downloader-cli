"use strict";
/**
 * Reencode audio & video without creating files first
 *
 * Requirements: ffmpeg, ether via a manual installation or via ffmpeg-static
 *
 * If you need more complex features like an output-stream you can check the older, more complex example:
 * https://github.com/fent/node-ytdl-core/blob/cc6720f9387088d6253acc71c8a49000544d4d2a/example/ffmpeg.js
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = void 0;
// Buildin with nodejs
const child_process_1 = __importDefault(require("child_process"));
const readline_1 = __importDefault(require("readline"));
// External modules
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const fs_1 = __importDefault(require("fs"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
// Global constants
// const ref = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'
// const ref = 'https://www.youtube.com/watch?v=BT9ABOe-7S0'
const tracker = {
    start: Date.now(),
    audio: { downloaded: 0, total: Infinity },
    video: { downloaded: 0, total: Infinity },
    merged: { frame: 0, speed: '0x', fps: 0 }
};
function download(ref, outputFileName) {
    return new Promise(resolve => {
        // Get audio and video streams
        const audio = (0, ytdl_core_1.default)(ref, { quality: 'highestaudio' }).on('progress', (_, downloaded, total) => {
            tracker.audio = { downloaded, total };
        });
        const video = (0, ytdl_core_1.default)(ref, { quality: 'highestvideo' }).on('progress', (_, downloaded, total) => {
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
            process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
            process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);
            process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
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
            // Map audio & video from streams
            '-map',
            '0:a',
            '-map',
            '1:v',
            // Keep encoding
            '-c:v',
            'copy',
            // Define output file
            '-f',
            'matroska',
            'pipe:6'
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
                'pipe',
                'pipe'
            ]
        });
        console.log(ffmpegProcess);
        // console.log(ffmpegProcess)
        ffmpegProcess.on('close', () => {
            console.log('done');
            // Cleanup
            process.stdout.write('\n\n\n\n');
            clearInterval(progressbarHandle);
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
        ffmpegProcess.stdio[6].pipe(fs_1.default.createWriteStream(`${process.cwd()}/${outputFileName}.mkv`));
    });
}
exports.download = download;
