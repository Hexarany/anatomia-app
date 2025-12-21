import { Context } from 'telegraf'
import User from '../../../models/User'
import Group from '../../../models/Group'
import Schedule from '../../../models/Schedule'

export async function scheduleCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply('❌ Аккаунт не привязан. Используйте /start для привязки.')
  }

  // Find user's groups: where they are student, teacher, or admin
  const groupQuery: any = { isActive: true }

  // Если не админ, ограничиваем группы
  if (user.role !== 'admin') {
    groupQuery.$or = [
      { students: user._id },  // Пользователь - студент
      { teacher: user._id }     // Пользователь - преподаватель
    ]
  }

  const groups = await Group.find(groupQuery).select('_id name')

  if (groups.length === 0) {
    return ctx.reply('У вас пока нет активных групп.')
  }

  // Get schedule for all user's groups
  const groupIds = groups.map(g => g._id)
  const scheduleEntries = await Schedule.find({
    group: { $in: groupIds },
    date: { $gte: new Date() } // Only future/current lessons
  })
    .populate('group', 'name')
    .populate('topic', 'name')
    .sort({ date: 1 })
    .limit(10) // Show next 10 lessons

  if (scheduleEntries.length === 0) {
    return ctx.reply(
      `📅 *Расписание*\n\n` +
      `Занятий пока не запланировано.\n` +
      `Следите за обновлениями!`,
      { parse_mode: 'Markdown' }
    )
  }

  let response = `📅 *Расписание занятий*\n\n`

  scheduleEntries.forEach((lesson, index) => {
    const date = new Date(lesson.date)
    const group = lesson.group as any
    const topic = lesson.topic as any

    response += `${index + 1}. *Урок ${lesson.lessonNumber}*: ${lesson.title.ru}\n`
    response += `   📚 Группа: ${group.name.ru}\n`
    if (topic) {
      response += `   📖 Тема: ${topic.name.ru}\n`
    }
    response += `   📍 ${lesson.location}\n`
    response += `   🕐 ${date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n`
    response += `   ⏱ ${lesson.duration} мин\n`
    response += `\n`
  })

  response += `_Показаны ближайшие занятия_`

  return ctx.reply(response, { parse_mode: 'Markdown' })
}
