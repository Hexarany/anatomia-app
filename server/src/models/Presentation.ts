import mongoose, { Schema, Document } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

interface IFileInfo {
  url: string
  filename: string
  originalName: string
  size: number
  mimeType: string
}

export interface IPresentation extends Document {
  title: IMultiLangText
  description: IMultiLangText
  file: IFileInfo
  categoryId?: mongoose.Types.ObjectId
  uploadedBy: mongoose.Types.ObjectId
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const PresentationSchema: Schema = new Schema(
  {
    title: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    description: {
      ru: { type: String, default: '' },
      ro: { type: String, default: '' },
    },
    file: {
      url: { type: String, required: true },
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      size: { type: Number, required: true },
      mimeType: { type: String, required: true },
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Индексы для быстрого поиска
PresentationSchema.index({ categoryId: 1, order: 1 })
PresentationSchema.index({ isPublished: 1 })
PresentationSchema.index({ createdAt: -1 })

export default mongoose.model<IPresentation>('Presentation', PresentationSchema)
