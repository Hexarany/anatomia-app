import crypto from 'crypto'
import User from '../../models/User'

export class TelegramLinkService {
  // Generate linking code
  static async generateLinkCode(userId: string): Promise<string> {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await User.findByIdAndUpdate(userId, {
      telegramLinkCode: code,
      telegramLinkCodeExpires: expires
    })

    return code
  }

  // Verify and link account
  static async linkAccount(code: string, telegramId: string, telegramUsername?: string): Promise<boolean> {
    const user = await User.findOne({
      telegramLinkCode: code,
      telegramLinkCodeExpires: { $gt: new Date() }
    })

    if (!user) return false

    user.telegramId = telegramId
    user.telegramUsername = telegramUsername
    user.telegramLinkCode = undefined
    user.telegramLinkCodeExpires = undefined
    user.telegramLinkedAt = new Date()
    await user.save()

    return true
  }

  // Unlink account
  static async unlinkAccount(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $unset: {
        telegramId: 1,
        telegramUsername: 1,
        telegramLinkedAt: 1
      }
    })
  }
}
