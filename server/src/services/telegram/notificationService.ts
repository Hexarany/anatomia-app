import bot from './bot'
import User from '../../models/User'
import Group from '../../models/Group'
import Assignment from '../../models/Assignment'
import Submission from '../../models/Submission'

export class TelegramNotificationService {
  // Send notification to a single user
  static async sendToUser(userId: string, message: string, options?: any) {
    const user = await User.findById(userId)

    if (!user?.telegramId || !user.telegramNotifications?.enabled) {
      return false
    }

    try {
      await bot.telegram.sendMessage(user.telegramId, message, {
        parse_mode: 'Markdown',
        ...options
      })
      return true
    } catch (error) {
      console.error(`Failed to send Telegram notification to user ${userId}:`, error)
      return false
    }
  }

  // Send notification to a group of students
  static async sendToGroup(groupId: string, message: string, options?: any) {
    const group = await Group.findById(groupId).populate('students')
    if (!group) return 0

    let sentCount = 0
    for (const student of group.students as any[]) {
      const sent = await this.sendToUser(student._id.toString(), message, options)
      if (sent) sentCount++
    }

    return sentCount
  }

  // Notify about new content
  static async notifyNewContent(contentType: string, title: string, userIds: string[]) {
    const message = `📚 *Новый ${contentType}!*\n\n${title}\n\nПерейдите на сайт для изучения.`

    let sentCount = 0
    for (const userId of userIds) {
      const sent = await this.sendToUser(userId, message)
      if (sent) sentCount++
    }

    return sentCount
  }

  // Notify all users with enabled notifications about new quiz
  static async notifyNewQuiz(quizTitle: { ru: string; ro: string }, questionsCount: number) {
    try {
      // Find all users with Telegram notifications enabled for new content
      const users = await User.find({
        telegramId: { $exists: true },
        'telegramNotifications.enabled': true,
        'telegramNotifications.newContent': true
      })

      let sentCount = 0
      for (const user of users) {
        const message =
          `📝 *Новый тест!*\n\n` +
          `${quizTitle.ru}\n\n` +
          `Вопросов: ${questionsCount}\n\n` +
          `Пройти тест: /quiz`

        const sent = await this.sendToUser(user._id.toString(), message)
        if (sent) sentCount++

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      console.log(`✅ Quiz notification sent to ${sentCount} users`)
      return sentCount
    } catch (error) {
      console.error('Failed to send quiz notifications:', error)
      return 0
    }
  }

  // Notify student about new assignment
  static async notifyNewAssignment(assignmentId: string) {
    try {
      const assignment = await Assignment.findById(assignmentId)
        .populate('group', 'students name')
        .lean()

      if (!assignment) return 0

      const group = assignment.group as any
      const deadline = new Date(assignment.deadline)
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      const message =
        `📝 *Новое домашнее задание!*\n\n` +
        `*${assignment.title.ru}*\n\n` +
        `Группа: ${group.name.ru}\n` +
        `Дедлайн: ${deadline.toLocaleDateString('ru-RU')} ${deadline.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n` +
        `Осталось: ${daysUntil} ${daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дня' : 'дней'}\n` +
        `Максимальный балл: ${assignment.maxScore}\n\n` +
        `Описание: ${assignment.description.ru.substring(0, 150)}${assignment.description.ru.length > 150 ? '...' : ''}\n\n` +
        `Просмотреть: /homework`

      let sentCount = 0
      for (const studentId of group.students) {
        const sent = await this.sendToUser(studentId.toString(), message)
        if (sent) sentCount++
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      console.log(`✅ New assignment notification sent to ${sentCount} students`)
      return sentCount
    } catch (error) {
      console.error('Failed to send new assignment notifications:', error)
      return 0
    }
  }

  // Notify student about upcoming deadline
  static async notifyDeadlineReminder(assignmentId: string, studentId: string) {
    try {
      const assignment = await Assignment.findById(assignmentId)
        .populate('group', 'name')
        .lean()

      if (!assignment) return false

      const deadline = new Date(assignment.deadline)
      const hoursUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60))

      const urgencyEmoji = hoursUntil <= 6 ? '🔴' : hoursUntil <= 12 ? '🟡' : '🟠'

      const message =
        `${urgencyEmoji} *Напоминание о дедлайне!*\n\n` +
        `*${assignment.title.ru}*\n\n` +
        `Группа: ${(assignment.group as any).name.ru}\n` +
        `Дедлайн: ${deadline.toLocaleDateString('ru-RU')} ${deadline.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n` +
        `Осталось: ${hoursUntil} ${hoursUntil === 1 ? 'час' : hoursUntil < 5 ? 'часа' : 'часов'}\n\n` +
        `⚠️ *Не забудьте сдать работу!*\n\n` +
        `Сдать: /submit ${assignmentId} <ваш ответ>\n` +
        `Или используйте веб-интерфейс`

      const sent = await this.sendToUser(studentId, message)
      return sent
    } catch (error) {
      console.error(`Failed to send deadline reminder to student ${studentId}:`, error)
      return false
    }
  }

  // Notify student that their submission was graded
  static async notifySubmissionGraded(submissionId: string) {
    try {
      const submission = await Submission.findById(submissionId)
        .populate('assignment', 'title maxScore')
        .populate('student', 'telegramId')
        .lean()

      if (!submission) return false

      const assignment = submission.assignment as any
      const scorePercent = Math.round((submission.grade! / assignment.maxScore) * 100)
      const emoji = scorePercent >= 90 ? '🌟' : scorePercent >= 75 ? '✅' : scorePercent >= 60 ? '📝' : '📌'

      const message =
        `${emoji} *Работа проверена!*\n\n` +
        `*${assignment.title.ru}*\n\n` +
        `Ваша оценка: *${submission.grade}/${assignment.maxScore}* (${scorePercent}%)\n\n` +
        `💬 *Комментарий преподавателя:*\n${submission.feedback}\n\n` +
        `Посмотреть подробнее: /grades`

      const sent = await this.sendToUser(submission.student.toString(), message)
      return sent
    } catch (error) {
      console.error(`Failed to send grade notification for submission ${submissionId}:`, error)
      return false
    }
  }

  // Check all assignments and send reminders for those due soon
  static async sendDeadlineReminders() {
    try {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      // Find assignments with deadline in the next 24 hours
      const upcomingAssignments = await Assignment.find({
        deadline: {
          $gte: now,
          $lte: tomorrow
        }
      }).populate('group', 'students').lean()

      let totalSent = 0

      for (const assignment of upcomingAssignments) {
        const group = assignment.group as any
        const assignmentId = assignment._id.toString()

        // Find submissions for this assignment
        const submissions = await Submission.find({
          assignment: assignmentId
        }).distinct('student')

        // Get students who haven't submitted yet
        const studentsWhoSubmitted = new Set(submissions.map(s => s.toString()))
        const studentsToNotify = group.students.filter(
          (studentId: any) => !studentsWhoSubmitted.has(studentId.toString())
        )

        // Send reminder to each student
        for (const studentId of studentsToNotify) {
          const sent = await this.notifyDeadlineReminder(assignmentId, studentId.toString())
          if (sent) totalSent++
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      if (totalSent > 0) {
        console.log(`✅ Deadline reminders sent to ${totalSent} students`)
      }

      return totalSent
    } catch (error) {
      console.error('Failed to send deadline reminders:', error)
      return 0
    }
  }
}
