import cron from 'node-cron'
import User from '../../models/User'
import Quiz from '../../models/Quiz'
import Topic from '../../models/Topic'
import { TelegramNotificationService } from './notificationService'

export function initDailyScheduler() {
  // Daily anatomy at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Sending daily anatomy fact...')

    try {
      const topics = await Topic.find().limit(50)
      if (topics.length === 0) return

      const randomTopic = topics[Math.floor(Math.random() * topics.length)]

      const users = await User.find({
        'telegramNotifications.enabled': true,
        'telegramNotifications.dailyChallenge': true,
        telegramId: { $exists: true }
      })

      const message = `🌅 *Анатомия дня*\n\n` +
                     `📚 ${randomTopic.name.ru}\n\n` +
                     `${randomTopic.description.ru.substring(0, 200)}...\n\n` +
                     `Изучить подробнее: anatomia.md`

      for (const user of users) {
        await TelegramNotificationService.sendToUser(user._id.toString(), message)
      }

      console.log(`[Scheduler] Daily anatomy sent to ${users.length} users`)
    } catch (error) {
      console.error('[Scheduler] Error sending daily anatomy:', error)
    }
  })

  // Daily quiz at 6:00 PM
  cron.schedule('0 18 * * *', async () => {
    console.log('[Scheduler] Sending daily quiz...')

    try {
      const quizzes = await Quiz.find().limit(20)
      if (quizzes.length === 0) return

      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]

      const users = await User.find({
        'telegramNotifications.enabled': true,
        'telegramNotifications.dailyChallenge': true,
        telegramId: { $exists: true }
      })

      const message = `🎯 *Вечерний тест*\n\n` +
                     `${randomQuiz.title.ru}\n\n` +
                     `Пройдите тест: /quiz`

      for (const user of users) {
        await TelegramNotificationService.sendToUser(user._id.toString(), message)
      }

      console.log(`[Scheduler] Daily quiz sent to ${users.length} users`)
    } catch (error) {
      console.error('[Scheduler] Error sending daily quiz:', error)
    }
  })

  console.log('✅ Daily scheduler initialized')
}
