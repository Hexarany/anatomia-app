import cron from 'node-cron'
import User from '../../models/User'
import Quiz from '../../models/Quiz'
import Topic from '../../models/Topic'
import { TelegramNotificationService } from './notificationService'
import { escapeMarkdown, resolveTelegramLang, t } from './i18n'
import { getLocalizedText } from './utils'

export function initDailyScheduler() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Sending daily anatomy fact...')

    try {
      const topics = await Topic.find().limit(50)
      if (topics.length === 0) return

      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      const users = await User.find({
        'telegramNotifications.enabled': true,
        'telegramNotifications.dailyChallenge': true,
        telegramId: { $exists: true },
      })

      const clientUrl =
        process.env.CLIENT_URL?.split(',')[0].trim() || 'https://mateevmassage.com'

      for (const user of users) {
        const lang = resolveTelegramLang(user.telegramLanguage)
        const topicName = escapeMarkdown(getLocalizedText(randomTopic.name, lang))
        const topicDescription = escapeMarkdown(getLocalizedText(randomTopic.description, lang)).substring(0, 200)
        const message =
          `*${t(lang, 'daily.anatomyTitle')}*\n\n` +
          `${topicName}\n\n` +
          `${topicDescription}...\n\n` +
          `${t(lang, 'daily.anatomyHint', { url: clientUrl })}`

        await TelegramNotificationService.sendToUser(user._id.toString(), message, undefined, user)
      }

      console.log(`[Scheduler] Daily anatomy sent to ${users.length} users`)
    } catch (error) {
      console.error('[Scheduler] Error sending daily anatomy:', error)
    }
  })

  cron.schedule('0 18 * * *', async () => {
    console.log('[Scheduler] Sending daily quiz...')

    try {
      const quizzes = await Quiz.find().limit(20)
      if (quizzes.length === 0) return

      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]
      const users = await User.find({
        'telegramNotifications.enabled': true,
        'telegramNotifications.dailyChallenge': true,
        telegramId: { $exists: true },
      })

      for (const user of users) {
        const lang = resolveTelegramLang(user.telegramLanguage)
        const quizTitle = escapeMarkdown(getLocalizedText(randomQuiz.title, lang))
        const message =
          `*${t(lang, 'daily.quizTitle')}*\n\n` +
          `${quizTitle}\n\n` +
          `${t(lang, 'daily.quizHint')}`

        await TelegramNotificationService.sendToUser(user._id.toString(), message, undefined, user)
      }

      console.log(`[Scheduler] Daily quiz sent to ${users.length} users`)
    } catch (error) {
      console.error('[Scheduler] Error sending daily quiz:', error)
    }
  })

  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Checking homework deadlines...')

    try {
      const sentCount = await TelegramNotificationService.sendDeadlineReminders()
      console.log(`[Scheduler] Sent ${sentCount} deadline reminders`)
    } catch (error) {
      console.error('[Scheduler] Error checking homework deadlines:', error)
    }
  })

  console.log('[Scheduler] Daily scheduler initialized (daily content + homework deadlines)')
}
