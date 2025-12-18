import { Context } from 'telegraf'
import Topic from '../../../models/Topic'

export async function anatomyCommand(ctx: Context) {
  const args = ctx.message && 'text' in ctx.message
    ? ctx.message.text.split(' ').slice(1).join(' ')
    : ''

  if (!args) {
    return ctx.reply(
      `🔍 Используйте: /anatomy <название>\n\n` +
      `Примеры:\n` +
      `/anatomy трапециевидная\n` +
      `/anatomy мышцы`
    )
  }

  // Search topics
  const topics = await Topic.find({
    $or: [
      { 'name.ru': { $regex: args, $options: 'i' } },
      { 'name.ro': { $regex: args, $options: 'i' } }
    ]
  }).limit(5)

  if (topics.length > 0) {
    let response = `📚 *Найденные темы:*\n\n`
    topics.forEach(topic => {
      response += `• ${topic.name.ru}\n`
      if (topic.description) {
        response += `  _${topic.description.ru.substring(0, 100)}..._\n`
      }
      response += `\n`
    })
    return ctx.reply(response, { parse_mode: 'Markdown' })
  }

  return ctx.reply(`Ничего не найдено по запросу "${args}"`)
}
