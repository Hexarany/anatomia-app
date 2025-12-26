import bot from './bot'
import { Context } from 'telegraf'
import { startCommand } from './commands/start'
import { quizCommand } from './commands/quiz'
import { anatomyCommand } from './commands/anatomy'
import { scheduleCommand } from './commands/schedule'
import { linkgroupCommand, unlinkgroupCommand, handleLinkGroupCallback } from './commands/linkgroup'
import {
  homeworkCommand,
  submitCommand,
  resubmitCommand,
  gradesCommand,
  pendingSubmissionMiddleware,
  cancelCommand,
} from './commands/homework'
import { mySubmissionsCommand, myStudentsCommand, handleViewSubmission } from './commands/teacher'
import { settingsCommand, handleSettingsCallback } from './commands/settings'
import { initDailyScheduler } from './scheduler'
import { handleQuizCallback } from './handlers/quizCallback'
import {
  showMainMenu,
  handleMainMenuCallback,
  handleCommandCallback,
  handleSubmitCallback,
} from './handlers/menuCallback'
import { t } from './i18n'
import { getTelegramLang } from './utils'
import User from '../../models/User'

const TELEGRAM_WEBHOOK_PATH = process.env.TELEGRAM_WEBHOOK_PATH || '/api/telegram/webhook'

export const telegramWebhookPath = TELEGRAM_WEBHOOK_PATH
export const telegramWebhookCallback = bot.webhookCallback(telegramWebhookPath)

// Middleware to filter out group messages (bot should only respond to commands in groups)
const privateMessageFilter = async (ctx: Context, next: () => Promise<void>) => {
  // Allow only private chats for message processing
  // In groups, bot will only respond to commands (handled separately)
  if (ctx.chat?.type === 'private') {
    return next()
  }
  // In groups/supergroups/channels - skip message processing
  // Bot will only respond to commands and programmatic messages from admin panel
}

// Handle pending homework submissions and caption-based commands (ONLY in private chats)
bot.on('message', privateMessageFilter, pendingSubmissionMiddleware)

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
bot.command('settings', settingsCommand)
bot.command('cancel', cancelCommand)

bot.command('help', async (ctx) => {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }).select('telegramLanguage role') : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  let message = `📌 *${t(lang, 'common.helpTitle')}*\n\n${t(lang, 'help.general')}`
  if (user && (user.role === 'teacher' || user.role === 'admin')) {
    message += `\n\n*${t(lang, 'common.helpTeacherTitle')}*\n\n${t(lang, 'help.teacher')}`
  }

  return ctx.reply(message, { parse_mode: 'Markdown' })
})

// Register callback query handlers
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : ''

  if (data.startsWith('link_group:')) {
    return handleLinkGroupCallback(ctx)
  }
  if (data.startsWith('quiz_')) {
    return handleQuizCallback(ctx)
  }
  if (data === 'main_menu') {
    return handleMainMenuCallback(ctx)
  }
  if (data.startsWith('cmd_')) {
    return handleCommandCallback(ctx)
  }
  if (data.startsWith('submit_')) {
    return handleSubmitCallback(ctx)
  }
  if (data.startsWith('view_submission_')) {
    return handleViewSubmission(ctx)
  }
  if (data.startsWith('settings_')) {
    return handleSettingsCallback(ctx)
  }
  if (data === 'cmd_mysubmissions') {
    await ctx.answerCbQuery()
    return mySubmissionsCommand(ctx)
  }

  const lang = getTelegramLang(ctx)
  return ctx.answerCbQuery(t(lang, 'common.unknownCommand'))
})

// Error handling
bot.catch((err, ctx) => {
  console.error('[Telegram Bot] Error:', err)
  const lang = getTelegramLang(ctx)
  ctx.reply(t(lang, 'common.serverError'))
})

const resolveWebhookUrl = () => {
  if (process.env.TELEGRAM_WEBHOOK_URL) {
    return process.env.TELEGRAM_WEBHOOK_URL
  }
  const domain =
    process.env.TELEGRAM_WEBHOOK_DOMAIN ||
    process.env.PUBLIC_URL
  if (!domain) return null
  return `${domain.replace(/\/$/, '')}${TELEGRAM_WEBHOOK_PATH}`
}

const safeStopBot = (signal: string) => {
  try {
    bot.stop(signal)
  } catch (error: any) {
    if (error?.message === 'Bot is not running!') {
      return
    }
    console.warn('[Telegram Bot] Failed to stop gracefully:', error?.message || error)
  }
}

// Initialize
export async function initTelegramBot() {
  try {
    console.log('[Telegram Bot] Starting Telegram bot...')
    console.log('[Telegram Bot] Webhook path:', telegramWebhookPath)

    const webhookUrl = resolveWebhookUrl()
    if (webhookUrl) {
      await bot.telegram.setWebhook(webhookUrl)
      console.log('[Telegram Bot] Webhook configured:', webhookUrl)
    } else {
      await bot.launch({
        dropPendingUpdates: true,
      })
      console.log('[Telegram Bot] Polling started')
    }

    // Set up Web App button (non-blocking)
    const clientUrl = process.env.CLIENT_URL || 'https://mateevmassage.com'
    const urls = clientUrl.split(',').map((url) => url.trim())
    const webAppUrl = urls.find((url) => url.startsWith('https://')) || 'https://mateevmassage.com'

    bot.telegram
      .setChatMenuButton({
        menuButton: {
          type: 'web_app',
          text: t('ru', 'buttons.openApp'),
          web_app: { url: webAppUrl },
        },
      })
      .then(() => console.log('[Telegram Bot] Web App menu button configured:', webAppUrl))
      .catch((err: any) => console.error('[Telegram Bot] Failed to set Web App button:', err.message))

    // Initialize daily scheduler
    initDailyScheduler()

    // Graceful stop
    process.once('SIGINT', () => safeStopBot('SIGINT'))
    process.once('SIGTERM', () => safeStopBot('SIGTERM'))
  } catch (error: any) {
    console.error('[Telegram Bot] Failed to start Telegram bot:', error.message)
    console.error('[Telegram Bot] Full error:', error)
    console.log('[Telegram Bot] Server will continue without Telegram bot')
  }
}
