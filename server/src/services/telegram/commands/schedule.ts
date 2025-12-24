import { Context } from 'telegraf'
import User from '../../../models/User'
import Group from '../../../models/Group'
import Schedule from '../../../models/Schedule'
import { escapeMarkdown, t } from '../i18n'
import { getLocale, getLocalizedText, getTelegramLang } from '../utils'

export async function scheduleCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  const groupQuery: any = { isActive: true }
  if (user.role !== 'admin') {
    groupQuery.$or = [{ students: user._id }, { teacher: user._id }]
  }

  const groups = await Group.find(groupQuery).select('_id name')
  if (groups.length === 0) {
    return ctx.reply(t(lang, 'schedule.noGroups'))
  }

  const groupIds = groups.map((group) => group._id)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const scheduleEntries = await Schedule.find({
    group: { $in: groupIds },
    date: { $gte: sevenDaysAgo },
  })
    .populate('group', 'name')
    .populate('topic', 'name')
    .sort({ date: -1 })
    .limit(15)

  if (scheduleEntries.length === 0) {
    return ctx.reply(`*${t(lang, 'schedule.title')}*\n\n${t(lang, 'schedule.none')}`, {
      parse_mode: 'Markdown',
    })
  }

  let response = `*${t(lang, 'schedule.title')}*\n\n`

  scheduleEntries.forEach((lesson, index) => {
    const date = new Date(lesson.date)
    const group = lesson.group as any
    const topic = lesson.topic as any
    const title = escapeMarkdown(getLocalizedText(lesson.title, lang))

    response += `${index + 1}. *${t(lang, 'labels.lesson')} ${lesson.lessonNumber}:* ${title}\n`
    response += `${t(lang, 'labels.group')}: ${escapeMarkdown(getLocalizedText(group.name, lang))}\n`
    if (topic) {
      response += `${t(lang, 'labels.topic')}: ${escapeMarkdown(getLocalizedText(topic.name, lang))}\n`
    }
    if (lesson.location) {
      response += `${t(lang, 'labels.location')}: ${escapeMarkdown(lesson.location)}\n`
    }
    response += `${date.toLocaleDateString(getLocale(lang), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })} ${date.toLocaleTimeString(getLocale(lang), { hour: '2-digit', minute: '2-digit' })}\n`
    response += `${t(lang, 'labels.duration')}: ${lesson.duration}\n\n`
  })

  response += `_${t(lang, 'schedule.footer')}_`

  return ctx.reply(response, { parse_mode: 'Markdown' })
}
