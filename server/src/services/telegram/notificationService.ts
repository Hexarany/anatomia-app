import bot from './bot'
import User from '../../models/User'
import Group from '../../models/Group'
import Assignment from '../../models/Assignment'
import Submission from '../../models/Submission'
import TelegramGroupChat from '../../models/TelegramGroupChat'
import Schedule from '../../models/Schedule'
import { escapeMarkdown, resolveTelegramLang, t } from './i18n'
import { getLocalizedText, getLocale } from './utils'

const isWithinQuietHours = (user: any, now: Date = new Date()) => {
  if (!user?.telegramQuietHours?.enabled) return false

  const parseTime = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
    return hours * 60 + minutes
  }

  const startMinutes = parseTime(user.telegramQuietHours.start)
  const endMinutes = parseTime(user.telegramQuietHours.end)
  if (startMinutes === null || endMinutes === null) return false
  if (startMinutes === endMinutes) return false

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes
  }
  return nowMinutes >= startMinutes || nowMinutes < endMinutes
}

const getUserLang = (user?: any) => resolveTelegramLang(user?.telegramLanguage)

export class TelegramNotificationService {
  static async sendToUser(userId: string, message: string, options?: any, userOverride?: any) {
    const user = userOverride || (await User.findById(userId))

    if (!user?.telegramId || !user.telegramNotifications?.enabled) {
      return false
    }

    if (isWithinQuietHours(user)) {
      return false
    }

    try {
      await bot.telegram.sendMessage(user.telegramId, message, {
        parse_mode: 'Markdown',
        ...options,
      })
      return true
    } catch (error) {
      console.error(`Failed to send Telegram notification to user ${userId}:`, error)
      return false
    }
  }

  static async sendToGroup(groupId: string, message: string, options?: any) {
    const group = await Group.findById(groupId).populate('students')
    if (!group) return 0

    let sentCount = 0
    for (const student of group.students as any[]) {
      const sent = await this.sendToUser(student._id.toString(), message, options, student)
      if (sent) sentCount++
    }

    return sentCount
  }

  static async notifyNewContent(contentType: string, title: string, userIds: string[]) {
    let sentCount = 0
    for (const userId of userIds) {
      const user = await User.findById(userId)
      if (!user) continue

      const lang = getUserLang(user)
      const message = t(lang, 'notifications.newContent', {
        contentType,
        title,
      })

      const sent = await this.sendToUser(userId, message, undefined, user)
      if (sent) sentCount++
    }

    return sentCount
  }

  static async notifyNewQuiz(quizTitle: { ru: string; ro: string }, questionsCount: number) {
    try {
      const users = await User.find({
        telegramId: { $exists: true },
        'telegramNotifications.enabled': true,
        'telegramNotifications.newContent': true,
      })

      let sentCount = 0
      for (const user of users) {
        const lang = getUserLang(user)
        const title = escapeMarkdown(getLocalizedText(quizTitle, lang))
        const message =
          `*${t(lang, 'notifications.newQuiz')}*\n\n` +
          `${title}\n\n` +
          `${t(lang, 'labels.questions')}: ${questionsCount}\n\n` +
          `${t(lang, 'notifications.quizHint')}`

        const sent = await this.sendToUser(user._id.toString(), message, undefined, user)
        if (sent) sentCount++

        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      return sentCount
    } catch (error) {
      console.error('Failed to send quiz notifications:', error)
      return 0
    }
  }

  static async notifyNewAssignment(assignmentId: string) {
    try {
      const assignment = await Assignment.findById(assignmentId)
        .populate('group', 'students name')
        .lean()

      if (!assignment) return 0

      const group = assignment.group as any
      const deadline = new Date(assignment.deadline)
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      const groupNameRu = escapeMarkdown(getLocalizedText(group.name, 'ru'))
      const groupMessageRu =
        `*${t('ru', 'notifications.newAssignment')}*\n\n` +
        `*${escapeMarkdown(getLocalizedText(assignment.title, 'ru'))}*\n\n` +
        `${t('ru', 'labels.group')}: ${groupNameRu}\n` +
        `${t('ru', 'labels.deadline')}: ${deadline.toLocaleDateString(getLocale('ru'))} ${deadline.toLocaleTimeString(getLocale('ru'), {
          hour: '2-digit',
          minute: '2-digit',
        })}\n` +
        `${t('ru', 'labels.daysLeft')}: ${daysUntil}\n` +
        `${t('ru', 'labels.maxScore')}: ${assignment.maxScore}\n\n` +
        `${escapeMarkdown(getLocalizedText(assignment.description, 'ru')).substring(0, 150)}${assignment.description?.ru?.length > 150 ? '...' : ''}\n\n` +
        `${t('ru', 'notifications.homeworkHint')}`

      const sentToGroup = await this.sendToTelegramGroup(group._id.toString(), groupMessageRu)

      let sentCount = 0
      for (const studentId of group.students) {
        const user = await User.findById(studentId)
        if (!user) continue

        const lang = getUserLang(user)
        const message =
          `*${t(lang, 'notifications.newAssignment')}*\n\n` +
          `*${escapeMarkdown(getLocalizedText(assignment.title, lang))}*\n\n` +
          `${t(lang, 'labels.group')}: ${escapeMarkdown(getLocalizedText(group.name, lang))}\n` +
          `${t(lang, 'labels.deadline')}: ${deadline.toLocaleDateString(getLocale(lang))} ${deadline.toLocaleTimeString(getLocale(lang), {
            hour: '2-digit',
            minute: '2-digit',
          })}\n` +
          `${t(lang, 'labels.daysLeft')}: ${daysUntil}\n` +
          `${t(lang, 'labels.maxScore')}: ${assignment.maxScore}\n\n` +
          `${escapeMarkdown(getLocalizedText(assignment.description, lang)).substring(0, 150)}${getLocalizedText(assignment.description, lang).length > 150 ? '...' : ''}\n\n` +
          `${t(lang, 'notifications.homeworkHint')}`

        const sent = await this.sendToUser(studentId.toString(), message, undefined, user)
        if (sent) sentCount++
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      return sentCount + (sentToGroup ? 1 : 0)
    } catch (error) {
      console.error('Failed to send new assignment notifications:', error)
      return 0
    }
  }

  static async notifyDeadlineReminder(assignmentId: string, studentId: string) {
    try {
      const assignment = await Assignment.findById(assignmentId).populate('group', 'name').lean()
      if (!assignment) return false

      const deadline = new Date(assignment.deadline)
      const hoursUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60))

      const user = await User.findById(studentId)
      const lang = getUserLang(user)
      const message =
        `*${t(lang, 'notifications.deadlineReminder')}*\n\n` +
        `*${escapeMarkdown(getLocalizedText(assignment.title, lang))}*\n\n` +
        `${t(lang, 'labels.group')}: ${escapeMarkdown(getLocalizedText((assignment.group as any).name, lang))}\n` +
        `${t(lang, 'labels.deadline')}: ${deadline.toLocaleDateString(getLocale(lang))} ${deadline.toLocaleTimeString(getLocale(lang), {
          hour: '2-digit',
          minute: '2-digit',
        })}\n` +
        `${t(lang, 'labels.hoursLeft')}: ${hoursUntil}\n\n` +
        `${t(lang, 'notifications.deadlineHint', { id: assignmentId })}`

      return this.sendToUser(studentId, message, undefined, user)
    } catch (error) {
      console.error(`Failed to send deadline reminder to student ${studentId}:`, error)
      return false
    }
  }

  static async notifySubmissionGraded(submissionId: string) {
    try {
      const submission = await Submission.findById(submissionId)
        .populate('assignment', 'title maxScore')
        .populate('student', 'telegramId telegramLanguage')
        .lean()

      if (!submission) return false

      const assignment = submission.assignment as any
      const user = submission.student as any
      const lang = getUserLang(user)
      const scorePercent = Math.round((submission.grade! / assignment.maxScore) * 100)

      let message =
        `*${t(lang, 'notifications.graded')}*\n\n` +
        `*${escapeMarkdown(getLocalizedText(assignment.title, lang))}*\n\n` +
        `${t(lang, 'labels.score')}: *${submission.grade}/${assignment.maxScore}* (${scorePercent}%)\n\n`

      if (submission.feedback) {
        message += `${t(lang, 'labels.feedback')}: ${escapeMarkdown(submission.feedback)}\n\n`
      }

      message += `${t(lang, 'notifications.gradesHint')}`

      return this.sendToUser(submission.student.toString(), message, undefined, user)
    } catch (error) {
      console.error(`Failed to send grade notification for submission ${submissionId}:`, error)
      return false
    }
  }

  static async sendDeadlineReminders() {
    try {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const upcomingAssignments = await Assignment.find({
        deadline: {
          $gte: now,
          $lte: tomorrow,
        },
      })
        .populate('group', 'students')
        .lean()

      let totalSent = 0
      for (const assignment of upcomingAssignments) {
        const group = assignment.group as any
        const assignmentId = assignment._id.toString()
        const submissions = await Submission.find({ assignment: assignmentId }).distinct('student')
        const studentsWhoSubmitted = new Set(submissions.map((s) => s.toString()))
        const studentsToNotify = group.students.filter(
          (studentId: any) => !studentsWhoSubmitted.has(studentId.toString())
        )

        for (const studentId of studentsToNotify) {
          const sent = await this.notifyDeadlineReminder(assignmentId, studentId.toString())
          if (sent) totalSent++
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      return totalSent
    } catch (error) {
      console.error('Failed to send deadline reminders:', error)
      return 0
    }
  }

  static async sendToTelegramGroup(groupId: string, message: string, options?: any) {
    try {
      const telegramGroupChat = await TelegramGroupChat.findOne({
        groupId,
        isActive: true,
      })

      if (!telegramGroupChat) {
        return false
      }

      await bot.telegram.sendMessage(telegramGroupChat.chatId, message, {
        parse_mode: 'Markdown',
        ...options,
      })

      return true
    } catch (error) {
      console.error(`Failed to send message to Telegram group for group ${groupId}:`, error)
      return false
    }
  }

  static async notifyNewSchedule(scheduleId: string) {
    try {
      const schedule = await Schedule.findById(scheduleId)
        .populate('group', 'name students')
        .populate('topic', 'name')
        .lean()

      if (!schedule) return false

      const group = schedule.group as any
      const scheduleDate = new Date(schedule.date)
      const topic = schedule.topic as any

      const clientUrl = process.env.CLIENT_URL?.split(',')[0].trim() || 'https://mateevmassage.com'

      const messageRu =
        `*${t('ru', 'notifications.newSchedule')}*\n\n` +
        `*${t('ru', 'labels.lesson')} ${schedule.lessonNumber}: ${escapeMarkdown(getLocalizedText(schedule.title, 'ru'))}*\n\n` +
        `${t('ru', 'labels.group')}: ${escapeMarkdown(getLocalizedText(group.name, 'ru'))}\n` +
        `${t('ru', 'labels.location')}: ${escapeMarkdown(schedule.location || '')}\n` +
        `${scheduleDate.toLocaleDateString(getLocale('ru'), {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}\n` +
        `${scheduleDate.toLocaleTimeString(getLocale('ru'), { hour: '2-digit', minute: '2-digit' })}\n` +
        `${t('ru', 'labels.duration')}: ${schedule.duration}\n\n` +
        (topic ? `${t('ru', 'labels.topic')}: ${escapeMarkdown(getLocalizedText(topic.name, 'ru'))}\n\n` : '') +
        (schedule.description?.ru
          ? `${escapeMarkdown(schedule.description.ru)}\n\n`
          : '') +
        (schedule.homework?.ru
          ? `${escapeMarkdown(schedule.homework.ru)}\n\n`
          : '') +
        `${t('ru', 'notifications.scheduleHint', { url: clientUrl })}`

      const sentToGroup = await this.sendToTelegramGroup(group._id.toString(), messageRu)

      let sentToIndividuals = 0
      for (const studentId of group.students || []) {
        const user = await User.findById(studentId)
        if (!user) continue

        const lang = getUserLang(user)
        const message =
          `*${t(lang, 'notifications.newSchedule')}*\n\n` +
          `*${t(lang, 'labels.lesson')} ${schedule.lessonNumber}: ${escapeMarkdown(getLocalizedText(schedule.title, lang))}*\n\n` +
          `${t(lang, 'labels.group')}: ${escapeMarkdown(getLocalizedText(group.name, lang))}\n` +
          `${t(lang, 'labels.location')}: ${escapeMarkdown(schedule.location || '')}\n` +
          `${scheduleDate.toLocaleDateString(getLocale(lang), {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}\n` +
          `${scheduleDate.toLocaleTimeString(getLocale(lang), { hour: '2-digit', minute: '2-digit' })}\n` +
          `${t(lang, 'labels.duration')}: ${schedule.duration}\n\n` +
          (topic ? `${t(lang, 'labels.topic')}: ${escapeMarkdown(getLocalizedText(topic.name, lang))}\n\n` : '') +
          (getLocalizedText(schedule.description, lang)
            ? `${escapeMarkdown(getLocalizedText(schedule.description, lang))}\n\n`
            : '') +
          (getLocalizedText(schedule.homework, lang)
            ? `${escapeMarkdown(getLocalizedText(schedule.homework, lang))}\n\n`
            : '') +
          `${t(lang, 'notifications.scheduleHint', { url: clientUrl })}`

        const sent = await this.sendToUser(studentId.toString(), message, undefined, user)
        if (sent) sentToIndividuals++
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      return sentToGroup || sentToIndividuals > 0
    } catch (error) {
      console.error('Failed to send new schedule notifications:', error)
      return false
    }
  }
}
