import { Context } from 'telegraf'
import Quiz from '../../../models/Quiz'

export async function handleQuizCallback(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const data = ctx.callbackQuery.data

  // Format: quiz_{quizId}_{questionIndex}_{answerIndex}
  const parts = data.split('_')
  if (parts[0] !== 'quiz' || parts.length !== 4) {
    return
  }

  const quizId = parts[1]
  const questionIndex = parseInt(parts[2])
  const answerIndex = parseInt(parts[3])

  try {
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return ctx.answerCbQuery('Тест не найден')
    }

    const question = quiz.questions[questionIndex]
    if (!question) {
      return ctx.answerCbQuery('Вопрос не найден')
    }

    const isCorrect = question.correctAnswer === answerIndex
    const selectedOption = question.options[answerIndex]

    // Answer callback query with result
    await ctx.answerCbQuery(isCorrect ? '✅ Правильно!' : '❌ Неправильно')

    // Build result message
    let resultMessage = `${isCorrect ? '✅ Правильно!' : '❌ Неправильно'}\n\n`
    resultMessage += `Ваш ответ: ${selectedOption.ru}\n`

    if (!isCorrect) {
      const correctOption = question.options[question.correctAnswer]
      resultMessage += `Правильный ответ: ${correctOption.ru}\n`
    }

    if (question.explanation && question.explanation.ru) {
      resultMessage += `\n💡 ${question.explanation.ru}`
    }

    // Check if there are more questions
    const nextQuestionIndex = questionIndex + 1
    if (nextQuestionIndex < quiz.questions.length) {
      const nextQuestion = quiz.questions[nextQuestionIndex]

      // Create keyboard for next question
      const keyboard = {
        inline_keyboard: nextQuestion.options.map((opt, idx) => [{
          text: opt.ru,
          callback_data: `quiz_${quizId}_${nextQuestionIndex}_${idx}`
        }])
      }

      resultMessage += `\n\n---\n\n*Вопрос ${nextQuestionIndex + 1}/${quiz.questions.length}:*\n${nextQuestion.question.ru}`

      await ctx.editMessageText(resultMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      })
    } else {
      // Quiz finished
      resultMessage += `\n\n🎉 *Тест завершен!*\n\nСпасибо за участие! Используйте /quiz для нового теста.`

      await ctx.editMessageText(resultMessage, {
        parse_mode: 'Markdown'
      })
    }
  } catch (error) {
    console.error('Error handling quiz callback:', error)
    await ctx.answerCbQuery('Произошла ошибка')
  }
}
