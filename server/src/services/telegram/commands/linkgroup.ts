import { Context, Markup } from 'telegraf'
import User from '../../../models/User'
import Group from '../../../models/Group'
import TelegramGroupChat from '../../../models/TelegramGroupChat'
import { escapeMarkdown, t } from '../i18n'
import { getLocalizedText, getTelegramLang } from '../utils'

export async function linkgroupCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const lang = getTelegramLang(ctx)
  const chatId = ctx.chat?.id

  if (ctx.chat?.type === 'private') {
    return ctx.reply(t(lang, 'linkgroup.privateOnly'))
  }

  try {
    const botMember = await ctx.telegram.getChatMember(chatId!, ctx.botInfo.id)
    if (botMember.status !== 'administrator' && botMember.status !== 'creator') {
      return ctx.reply(t(lang, 'linkgroup.botNotAdmin'))
    }
  } catch (error) {
    console.error('Error checking bot admin status:', error)
    return ctx.reply(t(lang, 'common.serverError'))
  }

  const user = await User.findOne({ telegramId })
  const userLang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(userLang, 'common.notLinked'))
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return ctx.reply(t(userLang, 'linkgroup.onlyTeacher'))
  }

  const groupQuery: any = { isActive: true }
  if (user.role !== 'admin') {
    groupQuery.teacher = user._id
  }

  const groups = await Group.find(groupQuery)
  if (groups.length === 0) {
    return ctx.reply(t(userLang, 'linkgroup.noGroups'))
  }

  const existingLink = await TelegramGroupChat.findOne({
    chatId: chatId!.toString(),
    isActive: true,
  }).populate('groupId')

  if (existingLink) {
    const linkedGroup = existingLink.groupId as any
    const groupName = escapeMarkdown(getLocalizedText(linkedGroup.name, userLang))
    return ctx.reply(t(userLang, 'linkgroup.alreadyLinked', { groupName }), {
      parse_mode: 'Markdown',
    })
  }

  const keyboard = groups.map((group) => [
    Markup.button.callback(
      `${getLocalizedText(group.name, userLang)}`,
      `link_group:${chatId}:${group._id.toString()}`
    ),
  ])

  keyboard.push([Markup.button.callback(t(userLang, 'buttons.cancel'), 'link_group:cancel')])

  return ctx.reply(t(userLang, 'linkgroup.selectGroup'), {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(keyboard),
  })
}

export async function unlinkgroupCommand(ctx: Context) {
  const lang = getTelegramLang(ctx)
  const chatId = ctx.chat?.id

  if (ctx.chat?.type === 'private') {
    return ctx.reply(t(lang, 'common.onlyGroupChat'))
  }

  const link = await TelegramGroupChat.findOne({
    chatId: chatId!.toString(),
    isActive: true,
  }).populate('groupId')

  if (!link) {
    return ctx.reply(t(lang, 'linkgroup.notLinkedGroup'))
  }

  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })
  const userLang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(userLang, 'common.notLinked'))
  }

  const group = link.groupId as any
  if (user.role !== 'admin' && group.teacher.toString() !== user._id.toString()) {
    return ctx.reply(t(userLang, 'linkgroup.unlinkOnlyTeacher'))
  }

  link.isActive = false
  await link.save()

  const groupName = escapeMarkdown(getLocalizedText(group.name, userLang))
  return ctx.reply(t(userLang, 'linkgroup.unlinkSuccess', { groupName }))
}

export async function handleLinkGroupCallback(ctx: any) {
  const callbackData = ctx.callbackQuery.data
  const parts = callbackData.split(':')
  const lang = getTelegramLang(ctx)

  if (parts[1] === 'cancel') {
    await ctx.deleteMessage()
    return ctx.answerCbQuery(t(lang, 'common.cancelled'))
  }

  const chatId = parts[1]
  const groupId = parts[2]

  try {
    const telegramId = ctx.from.id.toString()
    const user = await User.findOne({ telegramId })
    const userLang = getTelegramLang(ctx, user?.telegramLanguage)

    if (!user) {
      await ctx.answerCbQuery(t(userLang, 'common.notLinked'), { show_alert: true })
      return
    }

    const group = await Group.findById(groupId)
    if (!group) {
      await ctx.answerCbQuery(t(userLang, 'linkgroup.groupNotFound'), { show_alert: true })
      return
    }

    if (user.role !== 'admin' && group.teacher.toString() !== user._id.toString()) {
      await ctx.answerCbQuery(t(userLang, 'common.accessDenied'), { show_alert: true })
      return
    }

    const existingLink = await TelegramGroupChat.findOne({
      groupId,
      isActive: true,
    })

    if (existingLink && existingLink.chatId !== chatId) {
      await ctx.answerCbQuery(t(userLang, 'linkgroup.alreadyLinkedOther'), { show_alert: true })
      return
    }

    if (existingLink) {
      existingLink.chatId = chatId
      existingLink.createdBy = user._id
      await existingLink.save()
    } else {
      await TelegramGroupChat.create({
        groupId,
        chatId,
        createdBy: user._id,
        isActive: true,
      })
    }

    const groupName = escapeMarkdown(getLocalizedText(group.name, userLang))
    await ctx.editMessageText(t(userLang, 'linkgroup.linkSuccess', { groupName }), {
      parse_mode: 'Markdown',
    })

    await ctx.answerCbQuery(t(userLang, 'linkgroup.linkedShort'))
  } catch (error) {
    console.error('Error linking group:', error)
    await ctx.answerCbQuery(t(lang, 'linkgroup.linkError'), { show_alert: true })
  }
}
