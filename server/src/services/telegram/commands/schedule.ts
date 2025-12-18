import { Context } from 'telegraf'
import User from '../../../models/User'
import Group from '../../../models/Group'

export async function scheduleCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply('❌ Аккаунт не привязан.')
  }

  // Find user's groups
  const groups = await Group.find({
    students: user._id,
    isActive: true
  }).populate('teacher', 'firstName lastName')

  if (groups.length === 0) {
    return ctx.reply('У вас пока нет активных групп.')
  }

  let response = `📅 *Ваши группы:*\n\n`
  groups.forEach(group => {
    response += `*${group.name.ru}*\n`
    response += `Преподаватель: ${(group.teacher as any).firstName} ${(group.teacher as any).lastName}\n`
    response += `Начало: ${new Date(group.startDate).toLocaleDateString('ru-RU')}\n`
    if (group.endDate) {
      response += `Окончание: ${new Date(group.endDate).toLocaleDateString('ru-RU')}\n`
    }
    response += `\n`
  })

  return ctx.reply(response, { parse_mode: 'Markdown' })
}
