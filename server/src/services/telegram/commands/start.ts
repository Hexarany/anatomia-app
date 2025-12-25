import { Context, Markup } from 'telegraf'
import User from '../../../models/User'
import { t } from '../i18n'
import { getTelegramLang } from '../utils'

const getWebAppUrl = () => {
  const clientUrl = process.env.CLIENT_URL || 'https://mateevmassage.com'
  const urls = clientUrl.split(',').map((url) => url.trim())
  return urls.find((url) => url.startsWith('https://')) || 'https://mateevmassage.com'
}

const getWebAppButton = (lang: 'ru' | 'ro', chatType?: string) => {
  const isPrivateChat = chatType === 'private'
  const text = t(lang, 'buttons.openApp')

  if (isPrivateChat) {
    return {
      text,
      web_app: { url: getWebAppUrl() },
    }
  }

  return {
    text,
    url: getWebAppUrl(),
  }
}

export async function startCommand(ctx: Context) {
  try {
    const telegramId = ctx.from?.id.toString()
    const args =
      ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1) : []

    const fallbackLang = getTelegramLang(ctx)

    if (args.length > 0) {
      const linkCode = args[0]

      const user = await User.findOne({
        telegramLinkCode: linkCode,
        telegramLinkCodeExpires: { $gt: new Date() },
      })

      if (user) {
        user.telegramId = telegramId
        user.telegramUsername = ctx.from?.username
        user.telegramLinkCode = undefined
        user.telegramLinkCodeExpires = undefined
        user.telegramLinkedAt = new Date()
        if (!user.telegramLanguage) {
          user.telegramLanguage = fallbackLang
        }
        await user.save()

        const lang = getTelegramLang(ctx, user.telegramLanguage)

        return ctx.reply(
          `${t(lang, 'start.linkedSuccess', { name: user.firstName })}\n\n${t(lang, 'start.linkedHint')}`,
          {
            reply_markup: {
              inline_keyboard: [
                [getWebAppButton(lang, ctx.chat?.type)],
                [Markup.button.callback(t(lang, 'buttons.mainMenu'), 'main_menu')],
              ],
            },
          }
        )
      }

      return ctx.reply(t(fallbackLang, 'start.linkedInvalid'), {
        reply_markup: {
          inline_keyboard: [[getWebAppButton(fallbackLang, ctx.chat?.type)]],
        },
      })
    }

    const existingUser = telegramId ? await User.findOne({ telegramId }) : null

    if (existingUser) {
      const lang = getTelegramLang(ctx, existingUser.telegramLanguage)
      return ctx.reply(
        `${t(lang, 'start.linkedAlready', { name: existingUser.firstName })}\n\n${t(lang, 'start.linkedHint')}`,
        {
          reply_markup: {
            inline_keyboard: [
              [getWebAppButton(lang, ctx.chat?.type)],
              [Markup.button.callback(t(lang, 'buttons.mainMenu'), 'main_menu')],
            ],
          },
        }
      )
    }

    return ctx.reply(
      t(fallbackLang, 'start.welcome', { appName: t(fallbackLang, 'common.appName') }),
      {
        reply_markup: {
          inline_keyboard: [[getWebAppButton(fallbackLang, ctx.chat?.type)]],
        },
      }
    )
  } catch (error) {
    console.error('[Telegram Bot] Error in /start command:', error)
    throw error
  }
}
