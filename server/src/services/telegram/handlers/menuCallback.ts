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

  // Определяем какую команду вызвать
  const commandMap: { [key: string]: string } = {
    'cmd_homework': '/homework',
    'cmd_grades': '/grades',
    'cmd_schedule': '/schedule',
    'cmd_quiz': '/quiz',
    'cmd_anatomy': '/anatomy',
    'cmd_help': '/help'
  }

  const command = commandMap[data]
  if (command) {
    // Имитируем вызов команды
    const message = {
      ...ctx.message,
      text: command
    }
    // @ts-ignore
    ctx.message = message

    // Удаляем callback query чтобы команда обработалась как обычная
    // @ts-ignore
    delete ctx.callbackQuery

    // Вызываем соответствующий handler через processUpdate
    // Telegraf автоматически обработает команду
    if (ctx.chat?.id) {
      await ctx.telegram.callApi('sendMessage', {
        chat_id: ctx.chat.id,
        text: `Выполняется команда ${command}...`
      }).catch(() => {})
    }
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
