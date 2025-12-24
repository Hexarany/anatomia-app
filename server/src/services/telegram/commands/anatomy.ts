import { Context } from 'telegraf'
import Topic from '../../../models/Topic'
import { escapeMarkdown, t } from '../i18n'
import { getLocalizedText, getTelegramLang } from '../utils'

export async function anatomyCommand(ctx: Context) {
  const args =
    ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1).join(' ') : ''

  const lang = getTelegramLang(ctx)

  if (!args) {
    return ctx.reply(t(lang, 'anatomy.usage'))
  }

  const topics = await Topic.find({
    $or: [
      { 'name.ru': { $regex: args, $options: 'i' } },
      { 'name.ro': { $regex: args, $options: 'i' } },
    ],
  }).limit(5)

  if (topics.length > 0) {
    let response = `*${t(lang, 'anatomy.results')}:*\n\n`
    topics.forEach((topic) => {
      const name = escapeMarkdown(getLocalizedText(topic.name, lang))
      response += `- ${name}\n`
      if (topic.description) {
        const desc = escapeMarkdown(getLocalizedText(topic.description, lang)).slice(0, 100)
        if (desc) {
          response += `_${desc}..._\n`
        }
      }
      response += '\n'
    })
    return ctx.reply(response, { parse_mode: 'Markdown' })
  }

  return ctx.reply(t(lang, 'anatomy.notFound', { query: args }))
}
