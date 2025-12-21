import { Context } from 'telegraf'
import User from '../../../models/User'
import Assignment from '../../../models/Assignment'
import Submission from '../../../models/Submission'
import mongoose from 'mongoose'

/**
 * Команда /homework - показать список домашних заданий
 */
export async function homeworkCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте команду /start для привязки аккаунта.',
      { parse_mode: 'Markdown' }
    )
  }

  try {
    // Получаем все задания для групп студента
    const submissions = await Submission.find({ student: user._id })
      .populate({
        path: 'assignment',
        populate: { path: 'group', select: 'name' }
      })
      .sort({ 'assignment.deadline': 1 })
      .lean()

    // Получаем ID заданий, которые уже сданы
    const submittedAssignmentIds = submissions.map(s => s.assignment._id)

    // Находим все группы: где пользователь студент, преподаватель, или админ
    const Group = (await import('../../../models/Group')).default
    const groupQuery: any = { isActive: true }

    // Если не админ, ограничиваем группы
    if (user.role !== 'admin') {
      groupQuery.$or = [
        { students: user._id },  // Пользователь - студент
        { teacher: user._id }     // Пользователь - преподаватель
      ]
    }

    const userGroups = await Group.find(groupQuery).select('_id').lean()
    const groupIds = userGroups.map(g => g._id)

    // Получаем все активные задания для групп студента
    const allAssignments = await Assignment.find({
      group: { $in: groupIds },
      deadline: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // За последний месяц
    })
      .populate('group', 'name')
      .sort({ deadline: 1 })
      .lean()

    // Разделяем на активные и завершенные
    const now = new Date()
    const activeAssignments = allAssignments.filter(
      a => !submittedAssignmentIds.some(id => id.toString() === a._id.toString()) &&
           new Date(a.deadline) > now
    )
    const completedSubmissions = submissions.filter(s => s.status === 'graded')

    if (activeAssignments.length === 0 && completedSubmissions.length === 0) {
      return ctx.reply(
        '📚 *Домашние задания*\n\n' +
        'У вас пока нет активных заданий.',
        { parse_mode: 'Markdown' }
      )
    }

    let response = '📚 *Домашние задания*\n\n'

    // Активные задания
    if (activeAssignments.length > 0) {
      response += '📝 *Активные:*\n\n'
      activeAssignments.forEach((assignment, index) => {
        const deadline = new Date(assignment.deadline)
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const urgency = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟡' : '🟢'

        response += `${urgency} *${assignment.title.ru}*\n`
        response += `Группа: ${(assignment.group as any).name.ru}\n`
        response += `Дедлайн: ${deadline.toLocaleDateString('ru-RU')} ${deadline.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n`
        response += `Осталось: ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}\n`
        response += `ID: \`${assignment._id}\`\n\n`
      })
    }

    // Завершенные задания с оценками
    if (completedSubmissions.length > 0) {
      response += '✅ *Проверенные (последние 5):*\n\n'
      completedSubmissions.slice(0, 5).forEach(sub => {
        const assignment = sub.assignment as any
        response += `*${assignment.title.ru}*\n`
        response += `Оценка: ${sub.grade}/${assignment.maxScore}\n`
        if (sub.feedback) {
          response += `Комментарий: ${sub.feedback.substring(0, 100)}${sub.feedback.length > 100 ? '...' : ''}\n`
        }
        response += '\n'
      })
    }

    response += '\n_Для сдачи работы используйте:_\n'
    response += '`/submit <ID> <текст или файл>`'

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in homeworkCommand:', error)
    return ctx.reply('❌ Произошла ошибка при получении списка заданий.')
  }
}

/**
 * Команда /submit - сдать домашнее задание
 * Использование: /submit <assignment_id> <ответ>
 */
export async function submitCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте команду /start для привязки аккаунта.',
      { parse_mode: 'Markdown' }
    )
  }

  // Парсим аргументы команды
  const text = (ctx.message && 'text' in ctx.message) ? ctx.message.text : ''
  const args = text.split(' ').slice(1) // Убираем /submit

  if (args.length < 2) {
    return ctx.reply(
      '❌ *Неверный формат команды*\n\n' +
      '*Использование:*\n' +
      '`/submit <ID задания> <ваш ответ>`\n\n' +
      '*Пример:*\n' +
      '`/submit 507f1f77bcf86cd799439011 Мышца начинается от...`\n\n' +
      'Для получения ID используйте команду /homework',
      { parse_mode: 'Markdown' }
    )
  }

  const assignmentId = args[0]
  const answer = args.slice(1).join(' ')

  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return ctx.reply('❌ Неверный ID задания. Используйте /homework для получения списка.')
  }

  try {
    // Проверяем существование задания
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return ctx.reply('❌ Задание не найдено.')
    }

    // Проверяем дедлайн
    const now = new Date()
    const isLate = now > assignment.deadline

    if (isLate && !assignment.allowLateSubmission) {
      return ctx.reply(
        '❌ *Дедлайн прошёл*\n\n' +
        'К сожалению, срок сдачи этого задания истёк.',
        { parse_mode: 'Markdown' }
      )
    }

    // Проверяем, не сдано ли уже
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: user._id
    })

    if (existingSubmission) {
      return ctx.reply(
        '❌ *Вы уже сдали это задание*\n\n' +
        'Для повторной сдачи используйте веб-интерфейс.',
        { parse_mode: 'Markdown' }
      )
    }

    // Создаём сдачу
    const submission = new Submission({
      assignment: assignmentId,
      student: user._id,
      textAnswer: answer,
      files: [],
      status: isLate ? 'late' : 'submitted',
      isLate,
      submittedAt: new Date()
    })

    await submission.save()

    let response = '✅ *Работа сдана успешно!*\n\n'
    response += `*Задание:* ${assignment.title.ru}\n`
    response += `*Ваш ответ:* ${answer.substring(0, 200)}${answer.length > 200 ? '...' : ''}\n`

    if (isLate) {
      response += '\n⚠️ Работа сдана с опозданием'
    }

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in submitCommand:', error)
    return ctx.reply('❌ Произошла ошибка при сдаче работы.')
  }
}

/**
 * Команда /grades - показать оценки
 */
export async function gradesCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      '❌ *Аккаунт не привязан*\n\n' +
      'Используйте команду /start для привязки аккаунта.',
      { parse_mode: 'Markdown' }
    )
  }

  try {
    // Получаем все оценки студента
    const submissions = await Submission.find({
      student: user._id,
      status: 'graded'
    })
      .populate({
        path: 'assignment',
        populate: { path: 'group', select: 'name' }
      })
      .sort({ gradedAt: -1 })
      .limit(10)
      .lean()

    if (submissions.length === 0) {
      return ctx.reply(
        '📊 *Оценки*\n\n' +
        'У вас пока нет проверенных работ.',
        { parse_mode: 'Markdown' }
      )
    }

    let response = '📊 *Ваши оценки (последние 10):*\n\n'

    let totalScore = 0
    let maxPossibleScore = 0

    submissions.forEach((sub, index) => {
      const assignment = sub.assignment as any
      const scorePercent = Math.round((sub.grade! / assignment.maxScore) * 100)
      const emoji = scorePercent >= 90 ? '🌟' : scorePercent >= 75 ? '✅' : scorePercent >= 60 ? '📝' : '📌'

      response += `${emoji} *${assignment.title.ru}*\n`
      response += `Группа: ${assignment.group.name.ru}\n`
      response += `Оценка: *${sub.grade}/${assignment.maxScore}* (${scorePercent}%)\n`

      if (sub.feedback) {
        response += `💬 ${sub.feedback.substring(0, 100)}${sub.feedback.length > 100 ? '...' : ''}\n`
      }

      response += `Проверено: ${new Date(sub.gradedAt!).toLocaleDateString('ru-RU')}\n\n`

      totalScore += sub.grade!
      maxPossibleScore += assignment.maxScore
    })

    // Общая статистика
    const averagePercent = Math.round((totalScore / maxPossibleScore) * 100)
    response += `📈 *Общая статистика:*\n`
    response += `Средний балл: ${averagePercent}%\n`
    response += `Всего баллов: ${totalScore}/${maxPossibleScore}`

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in gradesCommand:', error)
    return ctx.reply('❌ Произошла ошибка при получении оценок.')
  }
}
