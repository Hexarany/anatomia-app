import mongoose, { Schema, Document } from 'mongoose'

export interface ITelegramGroupChat extends Document {
  groupId: mongoose.Types.ObjectId // Reference to learning group
  chatId: string // Telegram chat ID
  inviteLink?: string // Invite link to the chat
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TelegramGroupChatSchema = new Schema<ITelegramGroupChat>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      unique: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    inviteLink: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

// Indexes
TelegramGroupChatSchema.index({ groupId: 1 })
TelegramGroupChatSchema.index({ chatId: 1 })
TelegramGroupChatSchema.index({ isActive: 1 })

export default mongoose.model<ITelegramGroupChat>('TelegramGroupChat', TelegramGroupChatSchema)
