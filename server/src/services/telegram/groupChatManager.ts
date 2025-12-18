import bot from './bot'
import TelegramGroupChat from '../../models/TelegramGroupChat'
import Group from '../../models/Group'

export class GroupChatManager {
  // Create group chat
  static async createGroupChat(groupId: string, creatorId: string): Promise<string | null> {
    const group = await Group.findById(groupId).populate('students teacher')
    if (!group) return null

    try {
      // The bot should be added to the group manually by admin
      const chatTitle = `${group.name.ru} - Anatomia`

      // Save to DB (chatId will be updated when bot is added to group)
      const telegramChat = new TelegramGroupChat({
        groupId,
        chatId: 'pending',
        isActive: true,
        createdBy: creatorId
      })
      await telegramChat.save()

      // Return instructions
      return `Чтобы завершить создание группового чата:\n` +
             `1. Создайте группу в Telegram с названием: "${chatTitle}"\n` +
             `2. Добавьте бота @${process.env.TELEGRAM_BOT_USERNAME || 'AnatomiaBot'} в группу\n` +
             `3. Сделайте бота администратором\n` +
             `4. Бот автоматически подключится`
    } catch (error) {
      console.error('Error creating group chat:', error)
      return null
    }
  }

  // Send message to group chat
  static async sendToGroupChat(groupId: string, message: string): Promise<boolean> {
    const telegramChat = await TelegramGroupChat.findOne({ groupId, isActive: true })
    if (!telegramChat || telegramChat.chatId === 'pending') return false

    try {
      await bot.telegram.sendMessage(telegramChat.chatId, message, {
        parse_mode: 'Markdown'
      })
      return true
    } catch (error) {
      console.error('Error sending to group chat:', error)
      return false
    }
  }
}
