import { Context } from 'telegraf'
import User from '../../../models/User'
import Group from '../../../models/Group'
import TelegramGroupChat from '../../../models/TelegramGroupChat'
import { Markup } from 'telegraf'

export async function linkgroupCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const chatId = ctx.chat?.id

  // Проверяем, что команда вызвана в группе
  if (ctx.chat?.type === 'private') {
    return ctx.reply(
      '❌ Эта команда работает только в групповых чатах Telegram.\n\n' +
        'Чтобы связать Telegram группу с группой обучения:\n' +
        '1. Создайте Telegram группу\n' +
        '2. Добавьте меня в группу\n' +
        '3. Сделайте меня администратором\n' +
        '4. Отправьте /linkgroup в группе'
    )
  }

  // Проверяем, является ли бот администратором группы
  try {
    const botMember = await ctx.telegram.getChatMember(chatId!, ctx.botInfo.id)
    if (botMember.status !== 'administrator' && botMember.status !== 'creator') {
      return ctx.reply(
        '❌ Я должен быть администратором этой группы.\n\n' +
          'Пожалуйста, сделайте меня администратором и попробуйте снова.'
      )
    }
  } catch (error) {
    console.error('Error checking bot admin status:', error)
    return ctx.reply('❌ Не удалось проверить права доступа.')
  }

  // Находим пользователя
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ Ваш аккаунт не привязан к системе.\n\n' +
        'Используйте /start для привязки аккаунта.'
    )
  }

  // Проверяем, что пользователь - учитель
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return ctx.reply(
      '❌ Только преподаватели могут связывать Telegram группы с группами обучения.'
    )
  }

  // Получаем группы учителя (или все группы для админа)
  const groupQuery: any = { isActive: true }

  // Если не админ, показываем только группы где пользователь - teacher
  if (user.role !== 'admin') {
    groupQuery.teacher = user._id
  }

  const groups = await Group.find(groupQuery)

  if (groups.length === 0) {
    return ctx.reply(
      '❌ У вас нет активных групп обучения.\n\n' +
        'Создайте группу через веб-интерфейс, затем вернитесь сюда.'
    )
  }

  // Проверяем, не привязана ли уже эта Telegram группа
  const existingLink = await TelegramGroupChat.findOne({
    chatId: chatId!.toString(),
    isActive: true,
  }).populate('groupId')

  if (existingLink) {
    const linkedGroup = existingLink.groupId as any
    return ctx.reply(
      `ℹ️ Эта Telegram группа уже привязана к группе обучения:\n\n` +
        `*${linkedGroup.name.ru}*\n\n` +
        `Чтобы изменить привязку, сначала отвяжите текущую группу через /unlinkgroup`,
      { parse_mode: 'Markdown' }
    )
  }

  // Создаем inline-кнопки для выбора группы
  const keyboard = groups.map((group) => [
    Markup.button.callback(
      `${group.name.ru}`,
      `link_group:${chatId}:${group._id.toString()}`
    ),
  ])

  keyboard.push([Markup.button.callback('❌ Отмена', 'link_group:cancel')])

  return ctx.reply(
    '📚 *Выберите группу обучения для привязки:*\n\n' +
      'После привязки все файлы, отправленные этой группе, будут автоматически дублироваться в этот Telegram чат.',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard),
    }
  )
}

export async function unlinkgroupCommand(ctx: Context) {
  const chatId = ctx.chat?.id

  // Проверяем, что команда вызвана в группе
  if (ctx.chat?.type === 'private') {
    return ctx.reply('❌ Эта команда работает только в групповых чатах Telegram.')
  }

  // Находим привязку
  const link = await TelegramGroupChat.findOne({
    chatId: chatId!.toString(),
    isActive: true,
  }).populate('groupId')

  if (!link) {
    return ctx.reply('ℹ️ Эта Telegram группа не привязана ни к одной группе обучения.')
  }

  // Проверяем права пользователя
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply('❌ Ваш аккаунт не привязан к системе.')
  }

  const group = link.groupId as any
  if (
    user.role !== 'admin' &&
    group.teacher.toString() !== user._id.toString()
  ) {
    return ctx.reply('❌ Только преподаватель группы может отвязать Telegram группу.')
  }

  // Отвязываем группу
  link.isActive = false
  await link.save()

  return ctx.reply(
    `✅ Telegram группа отвязана от группы обучения "${group.name.ru}".`
  )
}

// Обработчик callback для привязки группы
export async function handleLinkGroupCallback(ctx: any) {
  const callbackData = ctx.callbackQuery.data
  const parts = callbackData.split(':')

  if (parts[1] === 'cancel') {
    await ctx.deleteMessage()
    return ctx.answerCbQuery('Отменено')
  }

  const chatId = parts[1]
  const groupId = parts[2]

  try {
    // Проверяем права пользователя
    const telegramId = ctx.from.id.toString()
    const user = await User.findOne({ telegramId })

    if (!user) {
      await ctx.answerCbQuery('❌ Аккаунт не привязан', { show_alert: true })
      return
    }

    // Проверяем группу
    const group = await Group.findById(groupId)
    if (!group) {
      await ctx.answerCbQuery('❌ Группа не найдена', { show_alert: true })
      return
    }

    // Проверяем права
    if (
      user.role !== 'admin' &&
      group.teacher.toString() !== user._id.toString()
    ) {
      await ctx.answerCbQuery('❌ Нет прав для привязки этой группы', {
        show_alert: true,
      })
      return
    }

    // Проверяем, не привязана ли уже эта группа обучения к другому чату
    const existingLink = await TelegramGroupChat.findOne({
      groupId,
      isActive: true,
    })

    if (existingLink && existingLink.chatId !== chatId) {
      await ctx.answerCbQuery(
        '❌ Эта группа уже привязана к другому Telegram чату',
        { show_alert: true }
      )
      return
    }

    // Создаем или обновляем привязку
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

    // Обновляем сообщение
    await ctx.editMessageText(
      `✅ *Успешно привязано!*\n\n` +
        `Группа обучения: *${group.name.ru}*\n\n` +
        `Теперь все файлы, отправленные этой группе, будут автоматически дублироваться в этот Telegram чат.\n\n` +
        `Используйте /unlinkgroup чтобы отвязать.`,
      { parse_mode: 'Markdown' }
    )

    await ctx.answerCbQuery('✅ Группа привязана')
  } catch (error) {
    console.error('Error linking group:', error)
    await ctx.answerCbQuery('❌ Ошибка при привязке группы', {
      show_alert: true,
    })
  }
}
