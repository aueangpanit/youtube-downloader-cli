#!/usr/bin/env node

import { prompt } from 'enquirer'
import fs from 'fs'
import ytdl from 'ytdl-core'
import { getOutputFileName, processImage, processVideo } from './utils'
;(async () => {
  const { url } = await prompt<{ url: string }>({
    type: 'input',
    name: 'url',
    message: 'Please enter the YouTube video URL'
  })

  // Get video info
  const info = await ytdl.getBasicInfo(url)
  const outputFileName = getOutputFileName(info)

  // Download thumbnail and convert it to .png
  const imageOutputFileName = `${process.cwd()}/temp_thumbnail.png`
  await processImage(
    info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
    imageOutputFileName
  )

  // Download video, attach thumbnail and convert it to .mp4
  await processVideo(url, outputFileName, imageOutputFileName)

  // Delete downloaded thumbnail image
  console.info('Cleaning up files...')
  fs.unlinkSync(imageOutputFileName)
  console.info('Cleanup successful')
})()
