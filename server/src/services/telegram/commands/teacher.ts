import { Context } from 'telegraf'
import { Markup } from 'telegraf'
import User from '../../../models/User'
import Assignment from '../../../models/Assignment'
import Submission from '../../../models/Submission'
import Group from '../../../models/Group'

/**
 * Команда /mysubmissions - проверить сданные работы
 */
export async function mySubmissionsCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте /start для привязки.',
      { parse_mode: 'Markdown' }
    )
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return ctx.reply('❌ Эта команда доступна только преподавателям.')
  }

  try {
    // Найти группы где пользователь - преподаватель
    const groups = await Group.find({
      teacher: user._id,
      isActive: true
    }).select('_id name')

    if (groups.length === 0) {
      return ctx.reply('У вас нет активных групп.')
    }

    const groupIds = groups.map(g => g._id)

    // Найти задания для этих групп
    const assignments = await Assignment.find({
      group: { $in: groupIds }
    }).select('_id title')

    if (assignments.length === 0) {
      return ctx.reply('Вы еще не создавали заданий.')
    }

    const assignmentIds = assignments.map(a => a._id)

    // Найти непроверенные сдачи
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      status: { $in: ['submitted', 'late'] }
    })
      .populate('assignment', 'title maxScore')
      .populate('student', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean()

    if (submissions.length === 0) {
      return ctx.reply(
        '📝 *Работы на проверку*\n\n' +
        'Нет работ ожидающих проверки.',
        { parse_mode: 'Markdown' }
      )
    }

    let response = '📝 *Работы на проверку (последние 10):*\n\n'

    const buttons: any[] = []

    submissions.forEach((sub, index) => {
      const assignment = sub.assignment as any
      const student = sub.student as any
      const submittedDate = new Date(sub.submittedAt)
      const lateEmoji = sub.isLate ? '⚠️' : '✅'

      response += `${lateEmoji} *${assignment.title.ru}*\n`
      response += `Студент: ${student.firstName} ${student.lastName}\n`
      response += `Сдано: ${submittedDate.toLocaleDateString('ru-RU')} ${submittedDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n`
      response += `ID: \`${sub._id}\`\n\n`

      // Добавляем кнопку для каждой сдачи
      if (index < 5) {
        buttons.push([
          Markup.button.callback(
            `📋 ${assignment.title.ru.substring(0, 20)}... - ${student.firstName}`,
            `view_submission_${sub._id}`
          )
        ])
      }
    })

    response += '\n_Для проверки используйте веб-интерфейс или кнопки выше_'

    buttons.push([Markup.button.callback('🏠 Главное меню', 'main_menu')])

    return ctx.reply(response, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    })
  } catch (error) {
    console.error('[Telegram] Error in mySubmissionsCommand:', error)
    return ctx.reply('❌ Произошла ошибка.')
  }
}

/**
 * Команда /mystudents - список студентов
 */
export async function myStudentsCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply('❌ Аккаунт не привязан. Используйте /start')
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return ctx.reply('❌ Эта команда доступна только преподавателям.')
  }

  try {
    const groups = await Group.find({
      teacher: user._id,
      isActive: true
    })
      .populate('students', 'firstName lastName telegramId')
      .lean()

    if (groups.length === 0) {
      return ctx.reply('У вас нет активных групп.')
    }

    let response = '👥 *Мои студенты:*\n\n'

    for (const group of groups) {
      const students = group.students as any[]
      response += `📚 *${(group.name as any).ru}*\n`
      response += `Студентов: ${students.length}\n`

      const linkedCount = students.filter(s => s.telegramId).length
      response += `Привязано Telegram: ${linkedCount}/${students.length}\n\n`
    }

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in myStudentsCommand:', error)
    return ctx.reply('❌ Произошла ошибка.')
  }
}

/**
 * Обработчик просмотра сдачи
 */
export async function handleViewSubmission(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const data = ctx.callbackQuery.data
  await ctx.answerCbQuery()

  const submissionId = data.replace('view_submission_', '')

  try {
    const submission = await Submission.findById(submissionId)
      .populate('assignment', 'title maxScore')
      .populate('student', 'firstName lastName')
      .lean()

    if (!submission) {
      return ctx.reply('❌ Сдача не найдена.')
    }

    const assignment = submission.assignment as any
    const student = submission.student as any

    let response = '📄 *Просмотр работы*\n\n'
    response += `*Задание:* ${assignment.title.ru}\n`
    response += `*Студент:* ${student.firstName} ${student.lastName}\n`
    response += `*Макс балл:* ${assignment.maxScore}\n`
    response += `*Статус:* ${submission.isLate ? '⚠️ С опозданием' : '✅ Вовремя'}\n\n`

    if (submission.textAnswer) {
      response += `*Ответ:*\n${submission.textAnswer.substring(0, 500)}${submission.textAnswer.length > 500 ? '...' : ''}\n\n`
    }

    if (submission.files && submission.files.length > 0) {
      response += `📎 *Файлы:* ${submission.files.length}\n`
      submission.files.forEach((file, i) => {
        response += `${i + 1}. ${file}\n`
      })
      response += '\n'
    }

    response += `_Для выставления оценки используйте веб-интерфейс_\n`
    response += `ID: \`${submissionId}\``

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('« Назад к списку', 'cmd_mysubmissions')],
      [Markup.button.callback('🏠 Главное меню', 'main_menu')]
    ])

    return ctx.reply(response, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  } catch (error) {
    console.error('[Telegram] Error viewing submission:', error)
    return ctx.reply('❌ Произошла ошибка.')
  }
}
