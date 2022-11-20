import { prompt } from 'enquirer'
import ytdl from 'ytdl-core'
import { download } from './downloader'
;(async () => {
  const { url } = await prompt<{ url: string }>({
    type: 'input',
    name: 'url',
    message: 'Please enter the YouTube video URL'
  })

  const info = await ytdl.getBasicInfo(url)
  const output = `${info.videoDetails.publishDate} ${info.videoDetails.title}`

  await download(url, output)

  // await new Promise(r => setTimeout(r, 1 * 1000))
  // console.info('Renaming to: ', output)
  // retry(() => {
  //   fs.renameSync(`${process.cwd()}\\output.mkv`, `${process.cwd()}\\${output}`)
  // })
})()
