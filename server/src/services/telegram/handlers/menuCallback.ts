import { Context } from 'telegraf'
import { Markup } from 'telegraf'
import { homeworkCommand, gradesCommand } from '../commands/homework'
import { scheduleCommand } from '../commands/schedule'
import { quizCommand } from '../commands/quiz'
import { anatomyCommand } from '../commands/anatomy'

/**
 * Показать главное меню с кнопками
 */
export async function showMainMenu(ctx: Context) {
  const menuText =
    `🏠 *Главное меню*\n\n` +
    `Выберите нужное действие:`

  const buttons = [
    [Markup.button.callback('📚 Домашние задания', 'cmd_homework')],
    [Markup.button.callback('📊 Мои оценки', 'cmd_grades')],
    [Markup.button.callback('📅 Расписание', 'cmd_schedule')],
    [Markup.button.callback('📝 Пройти тест', 'cmd_quiz')],
    [Markup.button.callback('🔍 Поиск по анатомии', 'cmd_anatomy')],
    [Markup.button.callback('❓ Помощь', 'cmd_help')]
  ]

  // Добавляем кнопки для преподавателей
  const user = await import('../../../models/User').then(m => m.default)
  const telegramId = ctx.from?.id.toString()
  const userDoc = await user.findOne({ telegramId })

  if (userDoc && (userDoc.role === 'teacher' || userDoc.role === 'admin')) {
    buttons.push([Markup.button.callback('👨‍🏫 Работы на проверку', 'cmd_mysubmissions')])
  }

  const keyboard = Markup.inlineKeyboard(buttons)

  if (ctx.callbackQuery) {
    // Если вызвано через callback, редактируем сообщение
    return ctx.editMessageText(menuText, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  } else {
    // Если вызвано командой, отправляем новое сообщение
    return ctx.reply(menuText, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  }
}

/**
 * Обработчик callback для главного меню
 */
export async function handleMainMenuCallback(ctx: Context) {
  await ctx.answerCbQuery()
  return showMainMenu(ctx)
}

/**
 * Обработчик callback для команд через кнопки
 */
export async function handleCommandCallback(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const data = ctx.callbackQuery.data
  await ctx.answerCbQuery()

  // Вызываем соответствующую команду напрямую
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
      return ctx.reply('Используйте: /anatomy <название>')
    case 'cmd_help':
      return ctx.reply(
        `🤖 *Доступные команды:*\n\n` +
        `/start - Привязать аккаунт\n` +
        `/menu - Главное меню\n` +
        `/homework - Домашние задания\n` +
        `/grades - Оценки\n` +
        `/schedule - Расписание\n` +
        `/quiz - Тесты\n` +
        `/help - Помощь`,
        { parse_mode: 'Markdown' }
      )
  }
}

/**
 * Обработчик callback для кнопки "Сдать работу"
 */
export async function handleSubmitCallback(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const data = ctx.callbackQuery.data
  await ctx.answerCbQuery()

  // Извлекаем ID задания из callback data (формат: submit_<assignment_id>)
  const assignmentId = data.replace('submit_', '')

  const helpText =
    `📝 *Сдача работы*\n\n` +
    `ID задания: \`${assignmentId}\`\n\n` +
    `*Текстовый ответ:*\n` +
    `/submit ${assignmentId} <ваш текст>\n\n` +
    `*Или отправьте файл* с подписью:\n` +
    `/submit ${assignmentId}`

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('« Назад к заданиям', 'cmd_homework')],
    [Markup.button.callback('🏠 Главное меню', 'main_menu')]
  ])

  return ctx.reply(helpText, {
    parse_mode: 'Markdown',
    ...keyboard
  })
}
