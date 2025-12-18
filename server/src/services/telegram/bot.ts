import { Telegraf, Context } from 'telegraf'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN must be provided!')
}

export const bot = new Telegraf(BOT_TOKEN)

// Middleware for logging
bot.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`[Telegram Bot] ${ctx.updateType} processed in ${ms}ms`)
})

// Export for use in other modules
export default bot
