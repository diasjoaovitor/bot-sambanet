import { bot } from './bot'

;(async () => {
  await new Promise(() => {
    const interval = setInterval(
      () => {
        bot()
        clearInterval(interval)
      },
      2 * 60 * 60
    )
  })
})()
