import { Context, Markup } from 'telegraf'
import mongoose from 'mongoose'
import User from '../../../models/User'
import Assignment from '../../../models/Assignment'
import Submission from '../../../models/Submission'
import Group from '../../../models/Group'
import { escapeMarkdown, t } from '../i18n'
import { getLocale, getLocalizedText, getTelegramLang } from '../utils'

const PENDING_EXPIRATION_MS = 30 * 60 * 1000

const formatDateTime = (date: Date, lang: 'ru' | 'ro') => {
  const locale = getLocale(lang)
  return `${date.toLocaleDateString(locale)} ${date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

const normalizeTitle = (value: any, lang: 'ru' | 'ro') => {
  return escapeMarkdown(getLocalizedText(value, lang).trim())
}

const parseAttachment = async (ctx: Context) => {
  const message = ctx.message as any
  if (!message?.photo && !message?.document) return null

  let fileId: string
  let fileName: string

  if (message.photo) {
    const photo = message.photo[message.photo.length - 1]
    fileId = photo.file_id
    fileName = `photo_${Date.now()}.jpg`
  } else {
    fileId = message.document.file_id
    fileName = message.document.file_name || `document_${Date.now()}`
  }

  const fileLink = await ctx.telegram.getFileLink(fileId)
  return { fileUrl: fileLink.href, fileName }
}

const clearPendingAction = async (user: any) => {
  if (!user) return
  user.telegramPendingAction = undefined
  await user.save()
}

const processSubmission = async (
  ctx: Context,
  user: any,
  assignmentId: string,
  answer: string,
  fileUrl: string | null,
  action: 'submit' | 'resubmit',
  lang: 'ru' | 'ro'
) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    await ctx.reply(t(lang, 'submit.invalidIdWithHint'))
    return false
  }

  const assignment = await Assignment.findById(assignmentId)
  if (!assignment) {
    await ctx.reply(t(lang, 'submit.assignmentNotFound'))
    return false
  }

  if (action === 'submit') {
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: user._id,
    })

    if (existingSubmission) {
      await ctx.reply(t(lang, 'submit.alreadySubmitted'))
      return false
    }

    const now = new Date()
    const isLate = now > assignment.deadline

    if (isLate && !assignment.allowLateSubmission) {
      await ctx.reply(t(lang, 'submit.deadlinePassed'))
      return false
    }

    const submission = new Submission({
      assignment: assignmentId,
      student: user._id,
      textAnswer: answer,
      files: fileUrl ? [fileUrl] : [],
      status: isLate ? 'late' : 'submitted',
      isLate,
      submittedAt: now,
    })

    await submission.save()

    const title = normalizeTitle(assignment.title, lang)
    const answerPreview = answer.length > 200 ? `${answer.slice(0, 200)}...` : answer
    const answerText = escapeMarkdown(answerPreview)

    let response = `${t(lang, isLate ? 'submit.successLate' : 'submit.success')}\n\n`
    response += `*${t(lang, 'labels.assignment')}:* ${title}\n`

    if (fileUrl) {
      response += `*${t(lang, 'labels.file')}:* ${answerText}\n`
    } else {
      response += `*${t(lang, 'labels.answer')}:* ${answerText}\n`
    }

    await ctx.reply(response, { parse_mode: 'Markdown' })
    return true
  }

  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: user._id,
  })

  if (!existingSubmission) {
    await ctx.reply(t(lang, 'submit.missingSubmission'))
    return false
  }

  existingSubmission.textAnswer = answer
  existingSubmission.files = fileUrl ? [fileUrl] : existingSubmission.files
  existingSubmission.status = 'submitted'
  existingSubmission.submittedAt = new Date()
  existingSubmission.grade = undefined
  existingSubmission.feedback = undefined
  existingSubmission.gradedBy = undefined
  existingSubmission.gradedAt = undefined

  await existingSubmission.save()

  const title = normalizeTitle(assignment.title, lang)
  const answerPreview = answer.length > 200 ? `${answer.slice(0, 200)}...` : answer
  const answerText = escapeMarkdown(answerPreview)

  let response = `${t(lang, 'submit.resubmitSuccess')}\n\n`
  response += `*${t(lang, 'labels.assignment')}:* ${title}\n`

  if (fileUrl) {
    response += `*${t(lang, 'labels.file')}:* ${answerText}\n`
  } else {
    response += `*${t(lang, 'labels.answer')}:* ${answerText}\n`
  }

  await ctx.reply(response, { parse_mode: 'Markdown' })
  return true
}

export const pendingSubmissionMiddleware = async (ctx: Context, next: () => Promise<void>) => {
  const message = ctx.message as any
  if (!message || !ctx.from) {
    return next()
  }

  const caption = message.caption || ''
  if (caption.startsWith('/submit')) {
    await submitCommand(ctx)
    return
  }
  if (caption.startsWith('/resubmit')) {
    await resubmitCommand(ctx)
    return
  }

  if ('text' in message && message.text?.startsWith('/')) {
    return next()
  }

  const telegramId = ctx.from.id.toString()
  const user = await User.findOne({ telegramId })
  if (!user?.telegramPendingAction) {
    return next()
  }

  const lang = getTelegramLang(ctx, user.telegramLanguage)
  const pending = user.telegramPendingAction
  const createdAt = pending.createdAt ? new Date(pending.createdAt).getTime() : 0

  if (createdAt && Date.now() - createdAt > PENDING_EXPIRATION_MS) {
    await clearPendingAction(user)
    await ctx.reply(t(lang, 'common.actionExpired'))
    return
  }

  const hasText = 'text' in message && typeof message.text === 'string'
  const hasFile = message.photo || message.document

  if (!hasText && !hasFile) {
    await ctx.reply(t(lang, 'submit.missingContent'))
    return
  }

  let answer = ''
  let fileUrl: string | null = null

  if (hasFile) {
    try {
      const file = await parseAttachment(ctx)
      if (file) {
        fileUrl = file.fileUrl
        answer = file.fileName
      }
    } catch (error) {
      console.error('[Telegram] Error getting file:', error)
      await ctx.reply(t(lang, 'submit.fileError'))
      return
    }
  } else {
    answer = message.text
  }

  await clearPendingAction(user)

  await processSubmission(
    ctx,
    user,
    pending.assignmentId.toString(),
    answer,
    fileUrl,
    pending.action,
    lang
  )
}

export async function cancelCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (user?.telegramPendingAction) {
    await clearPendingAction(user)
  }

  return ctx.reply(t(lang, 'common.cancelled'))
}

export async function homeworkCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  try {
    const submissions = await Submission.find({ student: user._id })
      .populate({
        path: 'assignment',
        populate: { path: 'group', select: 'name' },
      })
      .sort({ 'assignment.deadline': 1 })
      .lean()

    const submittedAssignmentIds = submissions.map((sub) => (sub.assignment as any)._id.toString())

    const groupQuery: any = { isActive: true }
    if (user.role !== 'admin') {
      groupQuery.$or = [{ students: user._id }, { teacher: user._id }]
    }

    const userGroups = await Group.find(groupQuery).select('_id').lean()
    const groupIds = userGroups.map((group) => group._id)

    const allAssignments = await Assignment.find({
      group: { $in: groupIds },
      deadline: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })
      .populate('group', 'name')
      .sort({ deadline: 1 })
      .lean()

    const now = new Date()
    const activeAssignments = allAssignments.filter(
      (assignment) =>
        !submittedAssignmentIds.includes(assignment._id.toString()) &&
        new Date(assignment.deadline) > now
    )

    const completedSubmissions = submissions.filter((sub) => sub.status === 'graded')

    if (activeAssignments.length === 0 && completedSubmissions.length === 0) {
      return ctx.reply(t(lang, 'homework.noAssignments'))
    }

    let response = `*${t(lang, 'homework.title')}*\n\n`
    const buttons: any[] = []

    if (activeAssignments.length > 0) {
      response += `*${t(lang, 'homework.activeHeader')}:*\n\n`

      activeAssignments.forEach((assignment: any, index: number) => {
        const deadline = new Date(assignment.deadline)
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const title = normalizeTitle(assignment.title, lang)
        const groupName = normalizeTitle((assignment.group as any).name, lang)

        response += `*${title}*\n`
        response += `${t(lang, 'labels.group')}: ${groupName}\n`
        response += `${t(lang, 'labels.deadline')}: ${formatDateTime(deadline, lang)}\n`
        response += `${t(lang, 'labels.daysLeft')}: ${daysLeft}\n`
        response += `${t(lang, 'labels.id')}: \`${assignment._id}\`\n\n`

        if (index < 5) {
          const shortTitle = getLocalizedText(assignment.title, lang)
            .replace(/\\s+/g, ' ')
            .slice(0, 25)
          buttons.push([
            Markup.button.callback(
              `${t(lang, 'buttons.submit')}: ${shortTitle}...`,
              `submit_${assignment._id}`
            ),
          ])
        }
      })
    }

    if (completedSubmissions.length > 0) {
      response += `*${t(lang, 'homework.completedHeader')}:*\n\n`
      completedSubmissions.slice(0, 5).forEach((sub: any) => {
        const assignment = sub.assignment as any
        const title = normalizeTitle(assignment.title, lang)

        response += `*${title}*\n`
        response += `${t(lang, 'labels.score')}: ${sub.grade}/${assignment.maxScore}\n`
        if (sub.feedback) {
          const feedback = escapeMarkdown(sub.feedback.substring(0, 100))
          response += `${t(lang, 'labels.feedback')}: ${feedback}${sub.feedback.length > 100 ? '...' : ''}\n`
        }
        response += '\n'
      })
    }

    response += `${t(lang, 'homework.submitHint')}\n${t(lang, 'homework.submitWithFileHint')}`

    buttons.push([Markup.button.callback(t(lang, 'buttons.mainMenu'), 'main_menu')])

    return ctx.reply(response, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons),
    })
  } catch (error) {
    console.error('[Telegram] Error in homeworkCommand:', error)
    return ctx.reply(t(lang, 'common.serverError'))
  }
}

export async function submitCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  const message = ctx.message as any
  let assignmentId = ''
  let answer = ''
  let fileUrl: string | null = null

  if (message?.photo || message?.document) {
    const caption = message.caption || ''
    const captionArgs = caption.split(' ').slice(1)

    if (captionArgs.length < 1) {
      return ctx.reply(t(lang, 'submit.fileUsageText'))
    }

    assignmentId = captionArgs[0]

    try {
      const file = await parseAttachment(ctx)
      if (file) {
        fileUrl = file.fileUrl
        answer = file.fileName
      }
    } catch (error) {
      console.error('[Telegram] Error getting file:', error)
      return ctx.reply(t(lang, 'submit.fileError'))
    }
  } else {
    const text = message && 'text' in message ? message.text : ''
    const args = text.split(' ').slice(1)

    if (args.length === 1) {
      assignmentId = args[0]
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return ctx.reply(t(lang, 'submit.invalidIdWithHint'))
      }
      user.telegramPendingAction = {
        action: 'submit',
        assignmentId,
        createdAt: new Date(),
      } as any
      await user.save()
      return ctx.reply(t(lang, 'submit.prompt'))
    }

    if (args.length < 2) {
      return ctx.reply(t(lang, 'submit.usageText'))
    }

    assignmentId = args[0]
    answer = args.slice(1).join(' ')
  }

  await processSubmission(ctx, user, assignmentId, answer, fileUrl, 'submit', lang)
}

export async function resubmitCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  const message = ctx.message as any
  let assignmentId = ''
  let answer = ''
  let fileUrl: string | null = null

  if (message?.photo || message?.document) {
    const caption = message.caption || ''
    const captionArgs = caption.split(' ').slice(1)

    if (captionArgs.length < 1) {
      return ctx.reply(t(lang, 'submit.fileUsageText'))
    }

    assignmentId = captionArgs[0]

    try {
      const file = await parseAttachment(ctx)
      if (file) {
        fileUrl = file.fileUrl
        answer = file.fileName
      }
    } catch (error) {
      console.error('[Telegram] Error getting file:', error)
      return ctx.reply(t(lang, 'submit.fileError'))
    }
  } else {
    const text = message && 'text' in message ? message.text : ''
    const args = text.split(' ').slice(1)

    if (args.length === 1) {
      assignmentId = args[0]
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return ctx.reply(t(lang, 'submit.invalidIdWithHint'))
      }
      user.telegramPendingAction = {
        action: 'resubmit',
        assignmentId,
        createdAt: new Date(),
      } as any
      await user.save()
      return ctx.reply(t(lang, 'submit.resubmitPrompt'))
    }

    if (args.length < 2) {
      return ctx.reply(t(lang, 'submit.usageText'))
    }

    assignmentId = args[0]
    answer = args.slice(1).join(' ')
  }

  await processSubmission(ctx, user, assignmentId, answer, fileUrl, 'resubmit', lang)
}

export async function gradesCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString()
  const user = telegramId ? await User.findOne({ telegramId }) : null
  const lang = getTelegramLang(ctx, user?.telegramLanguage)

  if (!user) {
    return ctx.reply(t(lang, 'common.notLinked'))
  }

  try {
    const submissions = await Submission.find({
      student: user._id,
      status: 'graded',
    })
      .populate({
        path: 'assignment',
        populate: { path: 'group', select: 'name' },
      })
      .sort({ gradedAt: -1 })
      .limit(10)
      .lean()

    if (submissions.length === 0) {
      return ctx.reply(t(lang, 'grades.noGrades'))
    }

    let response = `*${t(lang, 'grades.title')}*\n\n`

    let totalScore = 0
    let maxPossibleScore = 0

    submissions.forEach((sub: any) => {
      const assignment = sub.assignment as any
      const title = normalizeTitle(assignment.title, lang)
      const groupName = normalizeTitle(assignment.group.name, lang)

      const scorePercent = Math.round((sub.grade / assignment.maxScore) * 100)

      response += `*${title}*\n`
      response += `${t(lang, 'labels.group')}: ${groupName}\n`
      response += `${t(lang, 'labels.score')}: *${sub.grade}/${assignment.maxScore}* (${scorePercent}%)\n`

      if (sub.feedback) {
        const feedback = escapeMarkdown(sub.feedback.substring(0, 100))
        response += `${t(lang, 'labels.feedback')}: ${feedback}${sub.feedback.length > 100 ? '...' : ''}\n`
      }

      response += `${t(lang, 'labels.submittedAt')}: ${new Date(sub.gradedAt).toLocaleDateString(
        getLocale(lang)
      )}\n\n`

      totalScore += sub.grade
      maxPossibleScore += assignment.maxScore
    })

    const averagePercent = Math.round((totalScore / maxPossibleScore) * 100)
    response += `*${t(lang, 'grades.average')}:* ${averagePercent}%`

    return ctx.reply(response, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[Telegram] Error in gradesCommand:', error)
    return ctx.reply(t(lang, 'common.serverError'))
  }
}
