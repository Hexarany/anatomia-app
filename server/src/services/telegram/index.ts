import bot from './bot'
import { startCommand } from './commands/start'
import { quizCommand } from './commands/quiz'
import { anatomyCommand } from './commands/anatomy'
import { scheduleCommand } from './commands/schedule'
import { initDailyScheduler } from './scheduler'

// Register commands
bot.command('start', startCommand)
bot.command('quiz', quizCommand)
bot.command('anatomy', anatomyCommand)
bot.command('schedule', scheduleCommand)

bot.command('help', (ctx) => {
  return ctx.reply(
    `🤖 *Доступные команды:*\n\n` +
    `/start - Привязать аккаунт\n` +
    `/quiz - Пройти тест\n` +
    `/anatomy <название> - Найти информацию\n` +
    `/schedule - Мои группы\n` +
    `/help - Эта справка`,
    { parse_mode: 'Markdown' }
  )
})

// Error handling
bot.catch((err, ctx) => {
  console.error('[Telegram Bot] Error:', err)
  ctx.reply('Произошла ошибка. Попробуйте позже.')
})

// Initialize
export async function initTelegramBot() {
  try {
    // Launch bot with timeout
    const launchPromise = bot.launch()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Bot launch timeout')), 10000)
    )

    await Promise.race([launchPromise, timeoutPromise])
    console.log('✅ Telegram bot started')

    // Initialize daily scheduler
    initDailyScheduler()

    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
  } catch (error: any) {
    console.error('❌ Failed to start Telegram bot:', error.message)
    console.log('⚠️  Server will continue without Telegram bot')
  }
}
