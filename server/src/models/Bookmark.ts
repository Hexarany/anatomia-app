import mongoose, { Document } from 'mongoose'

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId
  contentType: 'topic' | 'protocol' | 'trigger_point' | 'hygiene' | 'model_3d' | 'quiz'
  contentId: mongoose.Types.ObjectId
  folderId?: mongoose.Types.ObjectId
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const bookmarkSchema = new mongoose.Schema<IBookmark>(
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
      enum: ['topic', 'protocol', 'trigger_point', 'hygiene', 'model_3d', 'quiz'],
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookmarkFolder',
      index: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
)

// Составной индекс для быстрого поиска закладок пользователя
bookmarkSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true })
bookmarkSchema.index({ userId: 1, folderId: 1 })

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema)
