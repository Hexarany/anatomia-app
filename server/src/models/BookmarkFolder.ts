import mongoose, { Document } from 'mongoose'

export interface IBookmarkFolder extends Document {
  userId: mongoose.Types.ObjectId
  name: {
    ru: string
    ro: string
  }
  color?: string
  icon?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const bookmarkFolderSchema = new mongoose.Schema<IBookmarkFolder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      ru: {
        type: String,
        required: true,
        maxlength: 100,
      },
      ro: {
        type: String,
        required: true,
        maxlength: 100,
      },
    },
    color: {
      type: String,
      default: '#2196f3',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

bookmarkFolderSchema.index({ userId: 1, order: 1 })

export default mongoose.model<IBookmarkFolder>('BookmarkFolder', bookmarkFolderSchema)
