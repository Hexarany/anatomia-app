import mongoose, { Schema, Document } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

interface IMediaFile {
  url: string
  filename: string
  caption?: IMultiLangText
  type: 'image' | 'video' | '3d-model'
}

export interface ITopic extends Document {
  categoryId: mongoose.Types.ObjectId
  name: IMultiLangText
  description: IMultiLangText
  content: IMultiLangText
  images: IMediaFile[]
  videos: IMediaFile[]
  model3D?: string
  slug: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const MediaFileSchema = new Schema({
  url: { type: String, required: true },
  filename: { type: String, required: true },
  caption: {
    ru: String,
    ro: String,
  },
  type: {
    type: String,
    enum: ['image', 'video', '3d-model'],
    required: true,
  },
})

const TopicSchema: Schema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    description: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    content: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    images: [MediaFileSchema],
    videos: [MediaFileSchema],
    model3D: { type: String },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<ITopic>('Topic', TopicSchema)
