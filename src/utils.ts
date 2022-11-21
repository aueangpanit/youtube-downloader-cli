import cp from 'child_process'
import ffmpeg from 'ffmpeg-static'
import fs from 'fs'
import imageDownloader from 'image-downloader'
import readline from 'readline'
import sharp from 'sharp'
import ytdl from 'ytdl-core'

sharp.cache({ files: 0 })

export function getOutputFileName(info: ytdl.videoInfo) {
  return `${info.videoDetails.publishDate.replace(/-/g, ' ')} ${
    info.videoDetails.ownerChannelName
  } - ${info.videoDetails.title}`
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s\s+/g, ' ')
    .trim()
}

export function processVideo(
  url: string,
  outputFileName: string,
  thumbnail_url: string
) {
  console.info('Processing video...')

  const tracker = {
    start: Date.now(),
    audio: { downloaded: 0, total: Infinity },
    video: { downloaded: 0, total: Infinity },
    merged: { frame: 0, speed: '0x', fps: 0 }
  }

  return new Promise(resolve => {
    // Get audio and video streams
    const audio = ytdl(url, { quality: 'highestaudio' }).on(
      'progress',
      (_, downloaded, total) => {
        tracker.audio = { downloaded, total }
      }
    )
    const video = ytdl(url, { quality: 'highestvideo' }).on(
      'progress',
      (_, downloaded, total) => {
        tracker.video = { downloaded, total }
      }
    )

    // Prepare the progress bar
    let progressbarHandle: any = null
    const progressbarInterval = 1000
    const showProgress = () => {
      readline.cursorTo(process.stdout, 0)
      const toMB = (i: any) => (i / 1024 / 1024).toFixed(2)

      process.stdout.write(
        `Audio  | ${(
          (tracker.audio.downloaded / tracker.audio.total) *
          100
        ).toFixed(2)}% processed `
      )
      process.stdout.write(
        `(${toMB(tracker.audio.downloaded)}MB of ${toMB(
          tracker.audio.total
        )}MB).${' '.repeat(10)}\n`
      )

      process.stdout.write(
        `Video  | ${(
          (tracker.video.downloaded / tracker.video.total) *
          100
        ).toFixed(2)}% processed `
      )
      process.stdout.write(
        `(${toMB(tracker.video.downloaded)}MB of ${toMB(
          tracker.video.total
        )}MB).${' '.repeat(10)}\n`
      )

      process.stdout.write(`Merged | Processing frame ${tracker.merged.frame} `)
      process.stdout.write(
        `(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(
          10
        )}\n`
      )

      process.stdout.write(
        `Running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(
          2
        )} Minutes.`
      )
      readline.moveCursor(process.stdout, 0, -3)
    }

    // Start the ffmpeg child process
    const ffmpegProcess: any = cp.spawn(
      ffmpeg as any,
      [
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
      ],
      {
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
      }
    )
    // console.log(ffmpegProcess)
    ffmpegProcess.on('close', () => {
      // Cleanup
      process.stdout.write('\n\n\n\n')
      clearInterval(progressbarHandle)

      console.info('Video processed successfully')
      resolve(true)
    })

    // Link streams
    // FFmpeg creates the transformer streams and we just have to insert / read data
    ffmpegProcess.stdio[3].on('data', (chunk: any) => {
      // Start the progress bar
      if (!progressbarHandle)
        progressbarHandle = setInterval(showProgress, progressbarInterval)
      // Parse the param=value list returned by ffmpeg
      const lines = chunk.toString().trim().split('\n')
      const args: any = {}
      for (const l of lines) {
        const [key, value] = l.split('=')
        args[key.trim()] = value.trim()
      }
      tracker.merged = args
    })
    audio.pipe(ffmpegProcess.stdio[4])
    video.pipe(ffmpegProcess.stdio[5])
  })
}

export async function processImage(url: string, outputFileName: string) {
  const options = {
    url,
    dest: process.cwd()
  }

  console.info('Downloading thumbnail...')
  const imgDownloadRes = await imageDownloader.image(options)
  console.info('Thumbnail downloaded successfully')

  console.info('Processing thumbnail...')
  await sharp(imgDownloadRes.filename).toFile(outputFileName)
  console.info('Thumbnail processed successfully')

  fs.unlinkSync(imgDownloadRes.filename)
}
