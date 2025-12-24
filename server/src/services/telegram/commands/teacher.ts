import { Context, Markup } from 'telegraf'
import User from '../../../models/User'
import Assignment from '../../../models/Assignment'
import Submission from '../../../models/Submission'
import Group from '../../../models/Group'
import { escapeMarkdown, t } from '../i18n'
import { getLocale, getLocalizedText, getTelegramLang } from '../utils'

export async function mySubmissionsCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return ctx.reply(t(lang, 'common.accessDenied'))
  }

  try {
    const groups = await Group.find({
      teacher: user._id,
      isActive: true,
    }).select('_id name')

    if (groups.length === 0) {
      return ctx.reply(t(lang, 'teacher.noGroups'))
    }

    const groupIds = groups.map((group) => group._id)
    const assignments = await Assignment.find({
      group: { $in: groupIds },
    }).select('_id title')

    if (assignments.length === 0) {
      return ctx.reply(t(lang, 'teacher.noAssignments'))
    }

    const assignmentIds = assignments.map((assignment) => assignment._id)
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      status: { $in: ['submitted', 'late'] },
    })
      .populate('assignment', 'title maxScore')
      .populate('student', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean()

    if (submissions.length === 0) {
      return ctx.reply(t(lang, 'teacher.reviewEmpty'))
    }

    let response = `*${t(lang, 'teacher.reviewTitle')}*\n\n`
    const buttons: any[] = []

    submissions.forEach((sub: any, index: number) => {
      const assignment = sub.assignment as any
      const student = sub.student as any
      const submittedDate = new Date(sub.submittedAt)
      const title = escapeMarkdown(getLocalizedText(assignment.title, lang))
      const studentName = escapeMarkdown(`${student.firstName} ${student.lastName}`.trim())

      response += `*${title}*\n`
      response += `${t(lang, 'labels.student')}: ${studentName}\n`
      response += `${t(lang, 'labels.submittedAt')}: ${submittedDate.toLocaleDateString(getLocale(lang))} ${submittedDate.toLocaleTimeString(getLocale(lang), {
        hour: '2-digit',
        minute: '2-digit',
      })}\n`
      response += `${t(lang, 'labels.id')}: \`${sub._id}\`\n\n`

      if (index < 5) {
        const shortTitle = getLocalizedText(assignment.title, lang).replace(/\s+/g, ' ').slice(0, 20)
        buttons.push([
          Markup.button.callback(
            `${t(lang, 'buttons.view')}: ${shortTitle}...`,
            `view_submission_${sub._id}`
          ),
        ])
      }
    })

    response += `_${t(lang, 'teacher.reviewHint')}_`
    buttons.push([Markup.button.callback(t(lang, 'buttons.mainMenu'), 'main_menu')])

    return ctx.reply(response, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons),
    })
  } catch (error) {
    console.error('[Telegram] Error in mySubmissionsCommand:', error)
    return ctx.reply(t(lang, 'common.serverError'))
  }
}

export async function myStudentsCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return ctx.reply(t(lang, 'common.accessDenied'))
  }

  try {
    const groups = await Group.find({
      teacher: user._id,
      isActive: true,
    })
      .populate('students', 'firstName lastName telegramId')
      .lean()

    if (groups.length === 0) {
      return ctx.reply(t(lang, 'teacher.noGroups'))
    }

    let response = `*${t(lang, 'teacher.studentsTitle')}*\n\n`

    for (const group of groups) {
      const students = group.students as any[]
      const groupName = escapeMarkdown(getLocalizedText(group.name as any, lang))

      response += `*${groupName}*\n`
      response += `${t(lang, 'teacher.studentsCount', { count: students.length })}\n`

      const linkedCount = students.filter((student) => student.telegramId).length
      response += `${t(lang, 'teacher.telegramLinkedCount', { linked: linkedCount, total: students.length })}\n\n`
    }

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in myStudentsCommand:', error)
    return ctx.reply(t(lang, 'common.serverError'))
  }
}

export async function handleViewSubmission(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return
  }

  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  const data = ctx.callbackQuery.data
  await ctx.answerCbQuery()

  const submissionId = data.replace('view_submission_', '')

  try {
    const submission = await Submission.findById(submissionId)
      .populate('assignment', 'title maxScore')
      .populate('student', 'firstName lastName')
      .lean()

    if (!submission) {
      return ctx.reply(t(lang, 'teacher.viewNotFound'))
    }

    const assignment = submission.assignment as any
    const student = submission.student as any
    const statusLabel = submission.isLate ? t(lang, 'teacher.submissionLate') : t(lang, 'teacher.submissionOnTime')

    let response = `*${t(lang, 'teacher.viewTitle')}*\n\n`
    response += `*${t(lang, 'labels.assignment')}:* ${escapeMarkdown(getLocalizedText(assignment.title, lang))}\n`
    response += `*${t(lang, 'labels.student')}:* ${escapeMarkdown(`${student.firstName} ${student.lastName}`.trim())}\n`
    response += `*${t(lang, 'labels.maxScore')}:* ${assignment.maxScore}\n`
    response += `*${t(lang, 'labels.status')}:* ${statusLabel}\n\n`

    if (submission.textAnswer) {
      const answer = escapeMarkdown(submission.textAnswer.substring(0, 500))
      response += `*${t(lang, 'teacher.viewAnswer')}:*\n${answer}${submission.textAnswer.length > 500 ? '...' : ''}\n\n`
    }

    if (submission.files && submission.files.length > 0) {
      response += `*${t(lang, 'teacher.viewFiles')}:* ${submission.files.length}\n`
      submission.files.forEach((file: string, idx: number) => {
        response += `${idx + 1}. ${escapeMarkdown(file)}\n`
      })
      response += '\n'
    }

    response += `_${t(lang, 'teacher.viewHint')}_\n`
    response += `${t(lang, 'labels.id')}: \`${submissionId}\``

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(t(lang, 'buttons.backToList'), 'cmd_mysubmissions')],
      [Markup.button.callback(t(lang, 'buttons.mainMenu'), 'main_menu')],
    ])

    return ctx.reply(response, {
      parse_mode: 'Markdown',
      ...keyboard,
    })
  } catch (error) {
    console.error('[Telegram] Error viewing submission:', error)
    return ctx.reply(t(lang, 'common.serverError'))
  }
}
