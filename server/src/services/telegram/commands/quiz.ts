import { Context } from 'telegraf'
import User from '../../../models/User'
import Quiz from '../../../models/Quiz'
import { escapeMarkdown, t } from '../i18n'
import { getLocalizedText, getTelegramLang } from '../utils'

export async function quizCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  const quizzes = await Quiz.find().limit(10)
  if (quizzes.length === 0) {
    return ctx.reply(t(lang, 'quiz.noQuizzes'))
  }

  const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]
  const firstQuestion = randomQuiz.questions[0]
  const quizTitle = escapeMarkdown(getLocalizedText(randomQuiz.title, lang))
  const questionText = escapeMarkdown(getLocalizedText(firstQuestion.question, lang))

  const keyboard = {
    inline_keyboard: firstQuestion.options.map((opt, idx) => [
      {
        text: getLocalizedText(opt, lang),
        callback_data: `quiz_${randomQuiz._id}_0_${idx}`,
      },
    ]),
  }

  return ctx.reply(
    `*${t(lang, 'quiz.title')}:* ${quizTitle}\n\n*${t(lang, 'quiz.question', {
      current: 1,
      total: randomQuiz.questions.length,
    })}:*\n${questionText}`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  )
}
