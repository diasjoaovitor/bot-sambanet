import { bot } from './bot'
;(async () => {
  const interval = setInterval(
    async () => {
      await new Promise(() => {
        bot()
        clearInterval(interval)
      })
    },
    2 * 60 * 60
  )
})()
