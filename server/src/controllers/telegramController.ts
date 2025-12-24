import { Request, Response } from 'express'
import { TelegramLinkService } from '../services/telegram/linkService'
import { GroupChatManager } from '../services/telegram/groupChatManager'
import User from '../models/User'

// Generate link code
export const generateLinkCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const code = await TelegramLinkService.generateLinkCode(userId)

    res.json({
      code,
      expiresIn: 15 * 60, // seconds
      botUsername: process.env.TELEGRAM_BOT_USERNAME || 'AnatomiaBot'
    })
  } catch (error) {
    console.error('Error generating link code:', error)
    res.status(500).json({ error: { message: 'Ошибка при генерации кода' } })
  }
}

// Unlink Telegram
export const unlinkTelegram = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    await TelegramLinkService.unlinkAccount(userId)

    res.json({ message: 'Telegram аккаунт отвязан' })
  } catch (error) {
    console.error('Error unlinking telegram:', error)
    res.status(500).json({ error: { message: 'Ошибка при отвязке' } })
  }
}

// Get link status
export const getLinkStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const user = await User.findById(userId).select(
      'telegramId telegramUsername telegramLinkedAt telegramNotifications telegramLanguage telegramQuietHours'
    )

    res.json({
      isLinked: !!user?.telegramId,
      telegramUsername: user?.telegramUsername,
      linkedAt: user?.telegramLinkedAt,
      notifications: user?.telegramNotifications,
      language: user?.telegramLanguage,
      quietHours: user?.telegramQuietHours,
    })
  } catch (error) {
    console.error('Error getting link status:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении статуса' } })
  }
}

// Update notification settings
export const updateNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const settings = req.body

    await User.findByIdAndUpdate(userId, {
      telegramNotifications: settings
    })

    res.json({ message: 'Настройки обновлены' })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    res.status(500).json({ error: { message: 'Ошибка при обновлении настроек' } })
  }
}

// Create group chat
export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { groupId } = req.body

    const instructions = await GroupChatManager.createGroupChat(groupId, userId)

    if (!instructions) {
      return res.status(400).json({ error: { message: 'Не удалось создать чат' } })
    }

    res.json({ message: instructions })
  } catch (error) {
    console.error('Error creating group chat:', error)
    res.status(500).json({ error: { message: 'Ошибка при создании группового чата' } })
  }
}
