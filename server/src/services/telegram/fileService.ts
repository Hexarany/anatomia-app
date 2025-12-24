import bot from './bot'
import User from '../../models/User'
import Group from '../../models/Group'
import GroupFile from '../../models/GroupFile'
import Media from '../../models/Media'
import { escapeMarkdown, resolveTelegramLang, t } from './i18n'

const getUserLang = (user?: any) => resolveTelegramLang(user?.telegramLanguage)

const buildCaption = (lang: 'ru' | 'ro', title?: string, description?: string, media?: any) => {
  const lines: string[] = []

  if (title) {
    lines.push(`*${escapeMarkdown(title)}*`)
  }
  if (description) {
    lines.push(escapeMarkdown(description))
  }
  if (media) {
    lines.push(`${t(lang, 'labels.file')}: ${escapeMarkdown(media.originalName)}`)
    lines.push(`${t(lang, 'labels.size')}: ${(media.size / 1024 / 1024).toFixed(2)} MB`)
  }

  return lines.join('\n')
}

export class TelegramFileService {
  static async sendFileToUser(
    userId: string,
    fileUrl: string,
    caption?: string,
    mimetype?: string
  ): Promise<{ success: boolean; error?: string; messageId?: number }> {
    try {
      const user = await User.findById(userId)

      if (!user?.telegramId) {
        return {
          success: false,
          error: 'У пользователя не привязан Telegram аккаунт',
        }
      }

      let result
      if (mimetype?.startsWith('image/')) {
        result = await bot.telegram.sendPhoto(user.telegramId, fileUrl, {
          caption,
          parse_mode: 'Markdown',
        })
      } else if (mimetype?.startsWith('video/')) {
        result = await bot.telegram.sendVideo(user.telegramId, fileUrl, {
          caption,
          parse_mode: 'Markdown',
        })
      } else {
        result = await bot.telegram.sendDocument(user.telegramId, fileUrl, {
          caption,
          parse_mode: 'Markdown',
        })
      }

      return {
        success: true,
        messageId: result.message_id,
      }
    } catch (error: any) {
      console.error(`Failed to send file to user ${userId}:`, error)
      return {
        success: false,
        error: error.message || 'Ошибка при отправке файла',
      }
    }
  }

  static async sendFileToGroup(
    groupId: string,
    mediaId: string,
    title?: string,
    description?: string
  ): Promise<{
    groupFileId: string
    totalStudents: number
    successCount: number
    failedCount: number
  }> {
    try {
      const group = await Group.findById(groupId).populate('students')
      const media = await Media.findById(mediaId)

      if (!group) {
        throw new Error('Группа не найдена')
      }

      if (!media) {
        throw new Error('Файл не найден')
      }

      const groupFile = new GroupFile({
        group: groupId,
        media: mediaId,
        uploadedBy: group.teacher,
        title,
        description,
        deliveryStatus: [],
        sentToTelegramGroup: false,
      })

      let successCount = 0
      let failedCount = 0

      const students = group.students as any[]
      for (const student of students) {
        const lang = getUserLang(student)
        const caption = buildCaption(lang, title, description, media)
        const result = await this.sendFileToUser(
          student._id.toString(),
          media.url,
          caption,
          media.mimetype
        )

        const deliveryRecord = {
          student: student._id,
          delivered: result.success,
          deliveredAt: result.success ? new Date() : undefined,
          error: result.error,
        }

        groupFile.deliveryStatus.push(deliveryRecord)

        if (result.success) {
          successCount++
        } else {
          failedCount++
        }

        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      await groupFile.save()

      return {
        groupFileId: groupFile._id.toString(),
        totalStudents: students.length,
        successCount,
        failedCount,
      }
    } catch (error: any) {
      console.error('Failed to send file to group:', error)
      throw error
    }
  }

  static async retryFailedDeliveries(groupFileId: string): Promise<{
    successCount: number
    stillFailedCount: number
  }> {
    try {
      const groupFile = await GroupFile.findById(groupFileId).populate('media')

      if (!groupFile) {
        throw new Error('GroupFile не найден')
      }

      const media = groupFile.media as any
      let successCount = 0
      let stillFailedCount = 0

      for (let i = 0; i < groupFile.deliveryStatus.length; i++) {
        const delivery = groupFile.deliveryStatus[i]

        if (!delivery.delivered) {
          const student = await User.findById(delivery.student)
          const lang = getUserLang(student)
          const caption = buildCaption(lang, groupFile.title, groupFile.description, media)

          const result = await this.sendFileToUser(
            delivery.student.toString(),
            media.url,
            caption,
            media.mimetype
          )

          groupFile.deliveryStatus[i].delivered = result.success
          groupFile.deliveryStatus[i].deliveredAt = result.success
            ? new Date()
            : undefined
          groupFile.deliveryStatus[i].error = result.error

          if (result.success) {
            successCount++
          } else {
            stillFailedCount++
          }

          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      await groupFile.save()

      return { successCount, stillFailedCount }
    } catch (error: any) {
      console.error('Failed to retry deliveries:', error)
      throw error
    }
  }

  static async sendFileToTelegramGroup(
    groupFileId: string,
    chatId: number
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      const groupFile = await GroupFile.findById(groupFileId).populate('media')

      if (!groupFile) {
        return { success: false, error: 'GroupFile не найден' }
      }

      const media = groupFile.media as any
      const caption = buildCaption('ru', groupFile.title, groupFile.description, media)

      let result
      if (media.mimetype?.startsWith('image/')) {
        result = await bot.telegram.sendPhoto(chatId, media.url, {
          caption,
          parse_mode: 'Markdown',
        })
      } else if (media.mimetype?.startsWith('video/')) {
        result = await bot.telegram.sendVideo(chatId, media.url, {
          caption,
          parse_mode: 'Markdown',
        })
      } else {
        result = await bot.telegram.sendDocument(chatId, media.url, {
          caption,
          parse_mode: 'Markdown',
        })
      }

      groupFile.sentToTelegramGroup = true
      groupFile.telegramMessageId = result.message_id
      await groupFile.save()

      return {
        success: true,
        messageId: result.message_id,
      }
    } catch (error: any) {
      console.error('Failed to send file to Telegram group:', error)
      return {
        success: false,
        error: error.message || 'Ошибка при отправке файла в группу',
      }
    }
  }
}
