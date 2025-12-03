import mongoose, { Document } from 'mongoose'

export interface INote extends Document {
  userId: mongoose.Types.ObjectId
  contentType: 'topic' | 'protocol' | 'trigger_point' | 'hygiene' | 'model_3d' | 'quiz' | 'general'
  contentId?: mongoose.Types.ObjectId
  title: string
  content: string
  isImportant: boolean
  tags: string[]
  color?: string
  createdAt: Date
  updatedAt: Date
}

const noteSchema = new mongoose.Schema<INote>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['topic', 'protocol', 'trigger_point', 'hygiene', 'model_3d', 'quiz', 'general'],
      default: 'general',
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    isImportant: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: '#fff9c4',
    },
  },
  {
    timestamps: true,
  }
)

noteSchema.index({ userId: 1, contentType: 1, contentId: 1 })
noteSchema.index({ userId: 1, isImportant: 1 })
noteSchema.index({ userId: 1, tags: 1 })

export default mongoose.model<INote>('Note', noteSchema)
