import mongoose, { Document, Schema } from 'mongoose'

export interface IMedia extends Document {
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const mediaSchema = new Schema<IMedia>(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      unique: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required'],
    },
    mimetype: {
      type: String,
      required: [true, 'Mimetype is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
  },
  {
    timestamps: true,
  }
)

// Индексы для быстрого поиска
mediaSchema.index({ filename: 1 })
mediaSchema.index({ uploadedBy: 1 })
mediaSchema.index({ createdAt: -1 }) // Сортировка по дате загрузки

const Media = mongoose.model<IMedia>('Media', mediaSchema)

export default Media
