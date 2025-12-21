import { Context } from 'telegraf'
import { Markup } from 'telegraf'

/**
 * Показать главное меню с кнопками
 */
export async function showMainMenu(ctx: Context) {
  const menuText =
    `🏠 *Главное меню*\n\n` +
    `Выберите нужное действие:`

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📚 Домашние задания', 'cmd_homework')],
    [Markup.button.callback('📊 Мои оценки', 'cmd_grades')],
    [Markup.button.callback('📅 Расписание', 'cmd_schedule')],
    [Markup.button.callback('📝 Пройти тест', 'cmd_quiz')],
    [Markup.button.callback('🔍 Поиск по анатомии', 'cmd_anatomy')],
    [Markup.button.callback('❓ Помощь', 'cmd_help')]
  ])

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

  // Определяем какую команду вызвать и просто отправляем инструкцию
  const instructions: { [key: string]: string } = {
    'cmd_homework': 'Используйте команду /homework для просмотра заданий',
    'cmd_grades': 'Используйте команду /grades для просмотра оценок',
    'cmd_schedule': 'Используйте команду /schedule для просмотра расписания',
    'cmd_quiz': 'Используйте команду /quiz для прохождения теста',
    'cmd_anatomy': 'Используйте команду /anatomy <название> для поиска',
    'cmd_help': 'Используйте команду /help для справки'
  }

  const instruction = instructions[data]
  if (instruction) {
    return ctx.reply(instruction)
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
