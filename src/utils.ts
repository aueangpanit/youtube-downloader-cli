import path from 'path'

export const appRoot = path.resolve(__dirname)

export const sleep = (ms: number) => new Promise(r => setInterval(r, ms))

export const retry = async (
  fn: () => void,
  count = 0,
  maxCount = 20,
  sleepInterval = 1000
) => {
  try {
    fn()
  } catch (e) {
    console.debug(e)
    console.debug('Retrying...', count + 1)
    if (count < maxCount) {
      await sleep(sleepInterval)
      retry(fn, count + 1, maxCount)
    } else {
      throw e
    }
  }
}
