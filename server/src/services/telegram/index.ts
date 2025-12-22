import bot from './bot'
import { startCommand } from './commands/start'
import { quizCommand } from './commands/quiz'
import { anatomyCommand } from './commands/anatomy'
import { scheduleCommand } from './commands/schedule'
import { linkgroupCommand, unlinkgroupCommand, handleLinkGroupCallback } from './commands/linkgroup'
import { homeworkCommand, submitCommand, resubmitCommand, gradesCommand } from './commands/homework'
import { mySubmissionsCommand, myStudentsCommand, handleViewSubmission } from './commands/teacher'
import { initDailyScheduler } from './scheduler'
import { handleQuizCallback } from './handlers/quizCallback'
import { showMainMenu, handleMainMenuCallback, handleCommandCallback, handleSubmitCallback } from './handlers/menuCallback'

// Register commands
bot.command('start', startCommand)
bot.command('menu', showMainMenu)
bot.command('quiz', quizCommand)
bot.command('anatomy', anatomyCommand)
bot.command('schedule', scheduleCommand)
bot.command('homework', homeworkCommand)
bot.command('submit', submitCommand)
bot.command('resubmit', resubmitCommand)
bot.command('grades', gradesCommand)
bot.command('linkgroup', linkgroupCommand)
bot.command('unlinkgroup', unlinkgroupCommand)
bot.command('mysubmissions', mySubmissionsCommand)
bot.command('mystudents', myStudentsCommand)

// Handle file submissions with /submit or /resubmit caption
bot.on(['document', 'photo'], async (ctx) => {
  const caption = (ctx.message as any)?.caption || ''
  if (caption.startsWith('/submit')) {
    return submitCommand(ctx)
  } else if (caption.startsWith('/resubmit')) {
    return resubmitCommand(ctx)
  }
})

bot.command('help', (ctx) => {
  return ctx.reply(
    `🤖 *Доступные команды:*\n\n` +
    `/start - Привязать аккаунт\n` +
    `/menu - Главное меню с кнопками\n` +
    `/schedule - Расписание занятий\n` +
    `/homework - Список домашних заданий\n` +
    `/submit <ID> <ответ> - Сдать домашнюю работу\n` +
    `/resubmit <ID> <ответ> - Пересдать работу\n` +
    `/grades - Мои оценки\n` +
    `/quiz - Пройти тест\n` +
    `/anatomy <название> - Найти информацию\n` +
    `/linkgroup - Привязать Telegram группу (только в групповых чатах)\n` +
    `/unlinkgroup - Отвязать Telegram группу (только в групповых чатах)\n\n` +
    `*Для преподавателей:*\n` +
    `/mysubmissions - Работы на проверку\n` +
    `/mystudents - Список студентов\n\n` +
    `/help - Эта справка`,
    { parse_mode: 'Markdown' }
  )
})

// Register callback query handlers
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : ''

  if (data.startsWith('link_group:')) {
    return handleLinkGroupCallback(ctx)
  } else if (data.startsWith('quiz_')) {
    return handleQuizCallback(ctx)
  } else if (data === 'main_menu') {
    return handleMainMenuCallback(ctx)
  } else if (data.startsWith('cmd_')) {
    return handleCommandCallback(ctx)
  } else if (data.startsWith('submit_')) {
    return handleSubmitCallback(ctx)
  } else if (data.startsWith('view_submission_')) {
    return handleViewSubmission(ctx)
  } else if (data === 'cmd_mysubmissions') {
    await ctx.answerCbQuery()
    return mySubmissionsCommand(ctx)
  }

  // Unknown callback
  return ctx.answerCbQuery('Неизвестная команда')
})

// Error handling
bot.catch((err, ctx) => {
  console.error('[Telegram Bot] Error:', err)
  ctx.reply('Произошла ошибка. Попробуйте позже.')
})

// Initialize
export async function initTelegramBot() {
  try {
    console.log('🔄 Starting Telegram bot...')

    // Launch bot without timeout - let it take as long as needed
    await bot.launch({
      dropPendingUpdates: true // Skip old updates on startup
    })

    console.log('✅ Telegram bot started successfully')

    // Set up Web App button (non-blocking)
    // Extract production URL from CLIENT_URL (which may contain multiple URLs for CORS)
    const clientUrl = process.env.CLIENT_URL || 'https://anatomia-app-docker.onrender.com'
    const urls = clientUrl.split(',').map(url => url.trim())
    const webAppUrl = urls.find(url => url.startsWith('https://')) || 'https://anatomia-app-docker.onrender.com'

    bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: '📚 Открыть Anatomia',
        web_app: { url: webAppUrl }
      }
    })
      .then(() => console.log('✅ Web App menu button configured:', webAppUrl))
      .catch((err: any) => console.error('❌ Failed to set Web App button:', err.message))

    // Initialize daily scheduler
    initDailyScheduler()

    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
  } catch (error: any) {
    console.error('❌ Failed to start Telegram bot:', error.message)
    console.error('Full error:', error)
    console.log('⚠️  Server will continue without Telegram bot')
  }
}
