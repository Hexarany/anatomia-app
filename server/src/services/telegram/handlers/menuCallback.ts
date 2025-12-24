import { Context, Markup } from 'telegraf'
import User from '../../../models/User'
import { homeworkCommand, gradesCommand } from '../commands/homework'
import { scheduleCommand } from '../commands/schedule'
import { quizCommand } from '../commands/quiz'
import { settingsCommand } from '../commands/settings'
import { t } from '../i18n'
import { getTelegramLang } from '../utils'

export async function showMainMenu(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const userDoc = telegramId ? await User.findOne({ telegramId }).select('role telegramLanguage') : null
  const lang = getTelegramLang(ctx, userDoc?.telegramLanguage)

  const menuText = `*${t(lang, 'common.mainMenuTitle')}*\n\n${t(lang, 'common.chooseAction')}`

  const buttons = [
    [Markup.button.callback(t(lang, 'buttons.homework'), 'cmd_homework')],
    [Markup.button.callback(t(lang, 'buttons.grades'), 'cmd_grades')],
    [Markup.button.callback(t(lang, 'buttons.schedule'), 'cmd_schedule')],
    [Markup.button.callback(t(lang, 'buttons.quiz'), 'cmd_quiz')],
    [Markup.button.callback(t(lang, 'buttons.anatomy'), 'cmd_anatomy')],
    [Markup.button.callback(t(lang, 'buttons.settings'), 'cmd_settings')],
    [Markup.button.callback(t(lang, 'buttons.help'), 'cmd_help')],
  ]

  if (userDoc && (userDoc.role === 'teacher' || userDoc.role === 'admin')) {
    buttons.push([Markup.button.callback(t(lang, 'buttons.mySubmissions'), 'cmd_mysubmissions')])
  }

  const keyboard = Markup.inlineKeyboard(buttons)

  if (ctx.callbackQuery) {
    return ctx.editMessageText(menuText, {
      parse_mode: 'Markdown',
      ...keyboard,
    })
  }

  return ctx.reply(menuText, {
    parse_mode: 'Markdown',
    ...keyboard,
  })
}

export async function handleMainMenuCallback(ctx: Context) {
  await ctx.answerCbQuery()
  return showMainMenu(ctx)
}

export async function handleCommandCallback(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const data = ctx.callbackQuery.data
  const telegramId = ctx.from?.id.toString()
  const userDoc = telegramId ? await User.findOne({ telegramId }).select('role telegramLanguage') : null
  const lang = getTelegramLang(ctx, userDoc?.telegramLanguage)

  await ctx.answerCbQuery()

  switch (data) {
    case 'cmd_homework':
      return homeworkCommand(ctx)
    case 'cmd_grades':
      return gradesCommand(ctx)
    case 'cmd_schedule':
      return scheduleCommand(ctx)
    case 'cmd_quiz':
      return quizCommand(ctx)
    case 'cmd_anatomy':
      return ctx.reply(t(lang, 'anatomy.usage'))
    case 'cmd_settings':
      return settingsCommand(ctx)
    case 'cmd_help': {
      let message = `*${t(lang, 'common.helpTitle')}*\n\n${t(lang, 'help.general')}`
      if (userDoc && (userDoc.role === 'teacher' || userDoc.role === 'admin')) {
        message += `\n\n*${t(lang, 'common.helpTeacherTitle')}*\n\n${t(lang, 'help.teacher')}`
      }
      return ctx.reply(message, { parse_mode: 'Markdown' })
    }
  }
}

export async function handleSubmitCallback(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const data = ctx.callbackQuery.data
  await ctx.answerCbQuery()

  const assignmentId = data.replace('submit_', '')
  const telegramId = ctx.from?.id.toString()
  const userDoc = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, userDoc?.telegramLanguage)

  if (!userDoc) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  userDoc.telegramPendingAction = {
    action: 'submit',
    assignmentId,
    createdAt: new Date(),
  } as any
  await userDoc.save()

  const helpText =
    `📝 *${t(lang, 'buttons.submit')}*\n\n` +
    `${t(lang, 'labels.id')}: \`${assignmentId}\`\n\n` +
    `${t(lang, 'submit.prompt')}`

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'buttons.homework'), 'cmd_homework')],
    [Markup.button.callback(t(lang, 'buttons.mainMenu'), 'main_menu')],
  ])

  return ctx.reply(helpText, {
    parse_mode: 'Markdown',
    ...keyboard,
  })
}
