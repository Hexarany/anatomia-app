import { Context } from 'telegraf'
import User from '../../../models/User'

export async function startCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const args = ctx.message && 'text' in ctx.message
    ? ctx.message.text.split(' ').slice(1)
    : []

  // If there's a link code
  if (args.length > 0) {
    const linkCode = args[0]
    const user = await User.findOne({
      telegramLinkCode: linkCode,
      telegramLinkCodeExpires: { $gt: new Date() }
    })

    if (user) {
      user.telegramId = telegramId
      user.telegramUsername = ctx.from?.username
      user.telegramLinkCode = undefined
      user.telegramLinkCodeExpires = undefined
      user.telegramLinkedAt = new Date()
      await user.save()

      return ctx.reply(
        `✅ Аккаунт успешно привязан!\n\n` +
        `Добро пожаловать, ${user.firstName}!\n` +
        `Используйте /help для просмотра доступных команд.`
      )
    } else {
      return ctx.reply(
        `❌ Код недействителен или истек.\n` +
        `Пожалуйста, получите новый код на сайте.`
      )
    }
  }

  // Check if account is already linked
  const existingUser = await User.findOne({ telegramId })
  if (existingUser) {
    return ctx.reply(
      `Привет, ${existingUser.firstName}! 👋\n\n` +
      `Ваш аккаунт уже привязан.\n` +
      `Используйте /help для просмотра команд.`
    )
  }

  return ctx.reply(
    `👋 Добро пожаловать в Anatomia Bot!\n\n` +
    `Для привязки вашего аккаунта:\n` +
    `1. Войдите на сайт anatomia.md\n` +
    `2. Перейдите в Профиль → Настройки\n` +
    `3. Нажмите "Подключить Telegram"\n` +
    `4. Скопируйте код и введите: /start ВАШ_КОД`
  )
}
