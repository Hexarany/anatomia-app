import bot from './bot'
import User from '../../models/User'
import Group from '../../models/Group'
import GroupFile from '../../models/GroupFile'
import Media from '../../models/Media'
import cloudinary from '../../config/cloudinary'
import { escapeMarkdown, resolveTelegramLang, t } from './i18n'

const getUserLang = (user?: any) => resolveTelegramLang(user?.telegramLanguage)

const normalizeBaseUrl = (value?: string | null) => {
  if (!value) return null
  let base = value.trim()
  if (!base) return null
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`
  }
  return base.replace(/\/$/, '')
}

const getPublicBaseUrl = () => {
  const clientUrls = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean)
    : []
  const clientUrl = clientUrls.find((url) => url.startsWith('https://')) || clientUrls[0]
  let webhookOrigin: string | null = null
  if (process.env.TELEGRAM_WEBHOOK_URL) {
    try {
      webhookOrigin = new URL(process.env.TELEGRAM_WEBHOOK_URL).origin
    } catch {
      webhookOrigin = null
    }
  }
  return (
    normalizeBaseUrl(process.env.PUBLIC_URL) ||
    normalizeBaseUrl(clientUrl) ||
    normalizeBaseUrl(process.env.TELEGRAM_WEBHOOK_DOMAIN) ||
    normalizeBaseUrl(webhookOrigin)
  )
}

const resolveMediaUrl = (url: string) => {
  if (!url) return url
  const baseUrl = getPublicBaseUrl()

  if (/^https?:\/\//i.test(url)) {
    if (baseUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
      return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, baseUrl)
    }
    return url
  }

  if (!baseUrl) return url
  const path = url.startsWith('/') ? url : `/${url}`
  return `${baseUrl}${path}`
}

const getFilenameFromUrl = (url: string, fallback = 'file') => {
  try {
    const parsed = new URL(url)
    const name = parsed.pathname.split('/').filter(Boolean).pop()
    if (name) return decodeURIComponent(name)
  } catch {
    const name = url.split('/').filter(Boolean).pop()
    if (name) return name
  }
  return fallback
}

const getFileExtension = (value?: string) => {
  if (!value) return null
  const cleaned = value.split('?')[0].split('#')[0]
  const lastDot = cleaned.lastIndexOf('.')
  if (lastDot === -1 || lastDot === cleaned.length - 1) return null
  return cleaned.slice(lastDot + 1)
}

const getCloudinaryPublicIdFromUrl = (url?: string) => {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (parts.length < 4) return null
    const resourceType = parts[1]
    if (!['image', 'video', 'raw'].includes(resourceType)) return null
    const typeIndex = 2
    let start = typeIndex + 1
    if (parts[start] && parts[start].startsWith('v') && /^\d+$/.test(parts[start].slice(1))) {
      start += 1
    }
    const publicId = parts.slice(start).join('/')
    return publicId || null
  } catch {
    return null
  }
}

const getCloudinaryResourceType = (mimetype?: string) => {
  if (mimetype?.startsWith('image/')) return 'image'
  if (mimetype?.startsWith('video/')) return 'video'
  return 'raw'
}

const getCloudinarySignedUrls = (
  publicId?: string,
  sourceUrl?: string,
  filename?: string,
  mimetype?: string
) => {
  const resolvedPublicId = publicId || getCloudinaryPublicIdFromUrl(sourceUrl)
  if (!resolvedPublicId) return []
  const resourceType = getCloudinaryResourceType(mimetype)
  const deliveryTypes = ['upload', 'authenticated', 'private'] as const
  const urls = deliveryTypes.map((type) =>
    cloudinary.url(resolvedPublicId, {
      resource_type: resourceType,
      type,
      secure: true,
      sign_url: true,
    })
  )
  const extension =
    getFileExtension(filename) || getFileExtension(resolvedPublicId) || getFileExtension(sourceUrl)
  const utils: any = (cloudinary as any).utils
  if (extension && typeof utils?.private_download_url === 'function') {
    const baseId = resolvedPublicId.replace(new RegExp(`\\.${extension}$`), '')
    urls.push(
      utils.private_download_url(baseId, extension, {
        resource_type: resourceType,
        type: 'upload',
        secure: true,
      })
    )
  }
  return urls.filter((candidate, index, array) => array.indexOf(candidate) === index)
}

const downloadFileBuffer = async (url: string, fallbackUrls: string[] = []) => {
  const tryFetch = async (target: string) => {
    console.log('[Telegram] Trying to download file from:', target)
    const response = await fetch(target)
    if (!response.ok) {
      console.log('[Telegram] Download failed:', response.status, response.statusText)
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    console.log('[Telegram] File downloaded successfully, size:', arrayBuffer.byteLength)
    return Buffer.from(arrayBuffer)
  }

  const candidates = [url, ...fallbackUrls].filter((candidate, index, array) => {
    return candidate && array.indexOf(candidate) === index
  })

  console.log('[Telegram] Attempting to download file from', candidates.length, 'URLs')

  let lastError: any
  for (const candidate of candidates) {
    try {
      return await tryFetch(candidate)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const buildCaption = (
  lang: 'ru' | 'ro',
  title?: string,
  description?: string,
  media?: any,
  format: 'plain' | 'markdown' = 'plain'
) => {
  const lines: string[] = []
  const escape = format === 'markdown' ? escapeMarkdown : (value: string) => value

  if (title) {
    const safeTitle = escape(title)
    lines.push(format === 'markdown' ? `*${safeTitle}*` : safeTitle)
  }
  if (description) {
    lines.push(escape(description))
  }
  if (media) {
    lines.push(`${t(lang, 'labels.file')}: ${escape(media.originalName)}`)
    lines.push(`${t(lang, 'labels.size')}: ${(media.size / 1024 / 1024).toFixed(2)} MB`)
  }

  return lines.join('\n')
}

export class TelegramFileService {
  static async sendFileToUser(
    userId: string,
    fileUrl: string,
    caption?: string,
    mimetype?: string,
    filename?: string,
    cloudinaryPublicId?: string
  ): Promise<{ success: boolean; error?: string; messageId?: number }> {
    try {
      const resolvedUrl = resolveMediaUrl(fileUrl)
      const resolvedFilename = filename || getFilenameFromUrl(resolvedUrl, 'document')
      const signedUrls = getCloudinarySignedUrls(
        cloudinaryPublicId,
        resolvedUrl,
        resolvedFilename,
        mimetype
      )
      const user = await User.findById(userId)

      if (!user?.telegramId) {
        return {
          success: false,
          error: 'У пользователя не привязан Telegram аккаунт',
        }
      }

      let result
      if (mimetype?.startsWith('image/')) {
        result = await bot.telegram.sendPhoto(user.telegramId, resolvedUrl, {
          caption,
        })
      } else if (mimetype?.startsWith('video/')) {
        result = await bot.telegram.sendVideo(user.telegramId, resolvedUrl, {
          caption,
        })
      } else {
        // For documents, try multiple URLs until one works
        console.log('[Telegram] Attempting to send document to user')
        const allUrls = [resolvedUrl, ...signedUrls]
        let lastError: any
        let sentSuccessfully = false

        for (const tryUrl of allUrls) {
          try {
            console.log('[Telegram] Trying URL for user:', tryUrl.substring(0, 100) + '...')
            result = await bot.telegram.sendDocument(user.telegramId, tryUrl, {
              caption,
            })
            console.log('[Telegram] Document sent successfully to user!')
            sentSuccessfully = true
            break
          } catch (urlError: any) {
            console.log('[Telegram] URL failed for user:', urlError.message)
            lastError = urlError
          }
        }

        if (!sentSuccessfully) {
          throw new Error(`Failed to send document to user after trying ${allUrls.length} URLs. Last error: ${lastError?.message}`)
        }
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
          media.mimetype,
          media.originalName,
          media.cloudinaryPublicId
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
            media.mimetype,
            media.originalName,
            media.cloudinaryPublicId
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
      const resolvedUrl = resolveMediaUrl(media.url)
      const resolvedFilename = media.originalName || getFilenameFromUrl(resolvedUrl, 'document')
      const signedUrls = getCloudinarySignedUrls(
        media.cloudinaryPublicId,
        resolvedUrl,
        resolvedFilename,
        media.mimetype
      )
      const caption = buildCaption('ru', groupFile.title, groupFile.description, media)

      let result
      if (media.mimetype?.startsWith('image/')) {
        result = await bot.telegram.sendPhoto(chatId, resolvedUrl, {
          caption,
        })
      } else if (media.mimetype?.startsWith('video/')) {
        result = await bot.telegram.sendVideo(chatId, resolvedUrl, {
          caption,
        })
      } else {
        // For documents, try multiple approaches
        console.log('[Telegram] Attempting to send document')
        console.log('[Telegram] Resolved URL:', resolvedUrl)
        console.log('[Telegram] Signed URLs:', signedUrls.length)

        // Try all URLs (main + signed) until one works
        const allUrls = [resolvedUrl, ...signedUrls]
        let lastError: any
        let sentSuccessfully = false

        for (const tryUrl of allUrls) {
          try {
            console.log('[Telegram] Trying URL:', tryUrl.substring(0, 100) + '...')
            result = await bot.telegram.sendDocument(chatId, tryUrl, {
              caption,
            })
            console.log('[Telegram] Document sent successfully!')
            sentSuccessfully = true
            break
          } catch (urlError: any) {
            console.log('[Telegram] URL failed:', urlError.message)
            lastError = urlError
          }
        }

        if (!sentSuccessfully) {
          throw new Error(`Failed to send document after trying ${allUrls.length} URLs. Last error: ${lastError?.message}`)
        }
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
