import { Context } from 'telegraf'
import User from '../../../models/User'
import Quiz from '../../../models/Quiz'

export async function quizCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = await User.findOne({ telegramId })

  if (!user) {
    return ctx.reply(
      `❌ Аккаунт не привязан.\n` +
      `Используйте /start для привязки.`
    )
  }

  // Get random quiz
  const quizzes = await Quiz.find().limit(10)
  if (quizzes.length === 0) {
    return ctx.reply('К сожалению, пока нет доступных тестов.')
  }

  const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]
  const firstQuestion = randomQuiz.questions[0]

  // Create inline keyboard with options
  const keyboard = {
    inline_keyboard: firstQuestion.options.map((opt, idx) => [{
      text: opt.ru,
      callback_data: `quiz_${randomQuiz._id}_0_${idx}`
    }])
  }

  return ctx.reply(
    `📝 *Тест:* ${randomQuiz.title.ru}\n\n` +
    `*Вопрос 1/${randomQuiz.questions.length}:*\n` +
    `${firstQuestion.question.ru}`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  )
}
