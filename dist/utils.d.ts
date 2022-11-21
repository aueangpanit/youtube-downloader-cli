import ytdl from 'ytdl-core';
export declare function getOutputFileName(info: ytdl.videoInfo): string;
export declare function processVideo(url: string, outputFileName: string, thumbnail_url: string): Promise<unknown>;
export declare function processImage(url: string, outputFileName: string): Promise<void>;
