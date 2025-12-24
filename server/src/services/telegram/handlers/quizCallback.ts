import { Context } from 'telegraf'
import Quiz from '../../../models/Quiz'
import User from '../../../models/User'
import { escapeMarkdown, t } from '../i18n'
import { getLocalizedText, getTelegramLang } from '../utils'

export async function handleQuizCallback(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const data = ctx.callbackQuery.data
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }).select('telegramLanguage') : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  const parts = data.split('_')
  if (parts[0] !== 'quiz' || parts.length !== 4) {
    return
  }

  const quizId = parts[1]
  const questionIndex = parseInt(parts[2], 10)
  const answerIndex = parseInt(parts[3], 10)

  try {
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return ctx.answerCbQuery(t(lang, 'quiz.notFound'))
    }

    const question = quiz.questions[questionIndex]
    if (!question) {
      return ctx.answerCbQuery(t(lang, 'quiz.questionNotFound'))
    }

    const isCorrect = question.correctAnswer === answerIndex
    const selectedOption = getLocalizedText(question.options[answerIndex], lang)

    await ctx.answerCbQuery(isCorrect ? t(lang, 'quiz.correct') : t(lang, 'quiz.incorrect'))

    let resultMessage = `${isCorrect ? t(lang, 'quiz.correct') : t(lang, 'quiz.incorrect')}\n\n`
    resultMessage += `${t(lang, 'quiz.answerLabel')}: ${escapeMarkdown(selectedOption)}\n`

    if (!isCorrect) {
      const correctOption = getLocalizedText(question.options[question.correctAnswer], lang)
      resultMessage += `${t(lang, 'quiz.correctAnswerLabel')}: ${escapeMarkdown(correctOption)}\n`
    }

    if (question.explanation && question.explanation[lang]) {
      resultMessage += `\n${escapeMarkdown(question.explanation[lang])}`
    }

    const nextQuestionIndex = questionIndex + 1
    if (nextQuestionIndex < quiz.questions.length) {
      const nextQuestion = quiz.questions[nextQuestionIndex]
      const nextQuestionText = escapeMarkdown(getLocalizedText(nextQuestion.question, lang))

      const keyboard = {
        inline_keyboard: nextQuestion.options.map((opt, idx) => [
          {
            text: getLocalizedText(opt, lang),
            callback_data: `quiz_${quizId}_${nextQuestionIndex}_${idx}`,
          },
        ]),
      }

      resultMessage += `\n\n---\n\n*${t(lang, 'quiz.question', {
        current: nextQuestionIndex + 1,
        total: quiz.questions.length,
      })}:*\n${nextQuestionText}`

      await ctx.editMessageText(resultMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      })
      return
    }

    resultMessage += `\n\n*${t(lang, 'quiz.finishedTitle')}*\n\n${t(lang, 'quiz.finishedHint')}`

    await ctx.editMessageText(resultMessage, {
      parse_mode: 'Markdown',
    })
  } catch (error) {
    console.error('Error handling quiz callback:', error)
    await ctx.answerCbQuery(t(lang, 'common.serverError'))
  }
}
