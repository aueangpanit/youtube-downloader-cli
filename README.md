# Youtube Downloader CLI

Simple and lightweight command-line program for downloading YouTube videos.

## Installation

Either through cloning with git or by using npm (the recommended way):

```
npm install -g @aueangpanit/ytd-cli
```

And ytd will be installed globally to your system path.

## Usage

Start the program by typing out ytd into your terminal:

```
ytd
```

Example output:

```
$ ytd
√ Please enter the YouTube video URL · https://www.youtube.com/watch?v=ea1k-8sQtxw
Downloading thumbnail...
Thumbnail downloaded successfully
Processing thumbnail...
Thumbnail processed successfully
Processing video...
Audio  | 100.00% processed (41.79MB of 41.79MB).
Video  | 99.86% processed (230.13MB of 230.46MB).
Merged | Processing frame 3900 (at 52.69 fps => 2.19x).
Running for: 1.27 Minutes.
Video processed successfully
Cleaning up files...
Cleanup successful
```
