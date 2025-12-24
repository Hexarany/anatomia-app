import { Context, Markup } from 'telegraf'
import User from '../../../models/User'
import { t } from '../i18n'
import { getTelegramLang } from '../utils'

const buildSettingsMessage = (lang: 'ru' | 'ro', user: any) => {
  const notificationsEnabled = user?.telegramNotifications?.enabled !== false
  const quietHours = user?.telegramQuietHours
  const quietHoursEnabled = quietHours?.enabled
  const quietRange = quietHours ? `${quietHours.start}-${quietHours.end}` : '22:00-08:00'

  const notificationsLine = notificationsEnabled
    ? t(lang, 'settings.notificationsEnabled')
    : t(lang, 'settings.notificationsDisabled')
  const quietHoursLine = quietHoursEnabled
    ? t(lang, 'settings.quietHoursEnabled', { start: quietRange.split('-')[0], end: quietRange.split('-')[1] })
    : t(lang, 'settings.quietHoursDisabled')
  const languageLabel = lang === 'ru' ? t(lang, 'buttons.languageRu') : t(lang, 'buttons.languageRo')
  const languageLine = t(lang, 'settings.languageCurrent', { lang: languageLabel })

  return `⚙️ *${t(lang, 'settings.title')}*\n\n${notificationsLine}\n${quietHoursLine}\n${languageLine}`
}

const buildSettingsKeyboard = (lang: 'ru' | 'ro', user: any) => {
  const notificationsEnabled = user?.telegramNotifications?.enabled !== false
  const quietHoursEnabled = user?.telegramQuietHours?.enabled === true
  const notificationsState = notificationsEnabled ? t(lang, 'common.yes') : t(lang, 'common.no')
  const quietHoursState = quietHoursEnabled ? t(lang, 'common.yes') : t(lang, 'common.no')

  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'buttons.toggleNotifications', { state: notificationsState }), 'settings_toggle_notifications')],
    [Markup.button.callback(t(lang, 'buttons.toggleQuietHours', { state: quietHoursState }), 'settings_toggle_quiet')],
    [
      Markup.button.callback(t(lang, 'buttons.languageRu'), 'settings_lang_ru'),
      Markup.button.callback(t(lang, 'buttons.languageRo'), 'settings_lang_ro'),
    ],
    [Markup.button.callback(t(lang, 'buttons.mainMenu'), 'main_menu')],
  ])
}

export async function settingsCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  const message = buildSettingsMessage(lang, user)
  const keyboard = buildSettingsKeyboard(lang, user)

  return ctx.reply(message, {
    parse_mode: 'Markdown',
    ...keyboard,
  })
}

export async function handleSettingsCallback(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    await ctx.answerCbQuery(t(lang, 'common.notLinked'), { show_alert: true })
    return
  }

  const data = ctx.callbackQuery.data

  if (data === 'settings_toggle_notifications') {
    const current = user.telegramNotifications?.enabled !== false
    user.telegramNotifications = {
      enabled: !current,
      newContent: user.telegramNotifications?.newContent !== false,
      homework: user.telegramNotifications?.homework !== false,
      grades: user.telegramNotifications?.grades !== false,
      dailyChallenge: user.telegramNotifications?.dailyChallenge !== false,
    }
  } else if (data === 'settings_toggle_quiet') {
    const current = user.telegramQuietHours?.enabled === true
    user.telegramQuietHours = {
      enabled: !current,
      start: user.telegramQuietHours?.start || '22:00',
      end: user.telegramQuietHours?.end || '08:00',
    }
  } else if (data === 'settings_lang_ru') {
    user.telegramLanguage = 'ru'
  } else if (data === 'settings_lang_ro') {
    user.telegramLanguage = 'ro'
  } else {
    await ctx.answerCbQuery()
    return
  }

  await user.save()

  const updatedLang = getTelegramLang(ctx, user.telegramLanguage)
  const message = buildSettingsMessage(updatedLang, user)
  const keyboard = buildSettingsKeyboard(updatedLang, user)

  await ctx.answerCbQuery(t(updatedLang, 'settings.updated'))

  if (ctx.callbackQuery.message && 'message_id' in ctx.callbackQuery.message) {
    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...keyboard,
    })
  }

  return ctx.reply(message, {
    parse_mode: 'Markdown',
    ...keyboard,
  })
}
