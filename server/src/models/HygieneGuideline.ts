import mongoose, { Schema, Document } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

interface IMediaFile {
  url: string
  filename: string
  caption?: IMultiLangText
  type: 'image' | 'video'
}

export interface IHygieneGuideline extends Document {
  title: IMultiLangText
  category: 'sterilization' | 'disinfection' | 'ergonomics' | 'office_requirements' | 'therapist_requirements' | 'dress_code'
  content: IMultiLangText
  images: IMediaFile[]
  order: number
  isPublished: boolean
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
    enum: ['image', 'video'],
    required: true,
  },
})

const HygieneGuidelineSchema: Schema = new Schema(
  {
    title: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    category: {
      type: String,
      enum: ['sterilization', 'disinfection', 'ergonomics', 'office_requirements', 'therapist_requirements', 'dress_code'],
      required: true,
    },
    content: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    images: [MediaFileSchema],
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

// Индекс для быстрого поиска по категории
HygieneGuidelineSchema.index({ category: 1, order: 1 })

export default mongoose.model<IHygieneGuideline>('HygieneGuideline', HygieneGuidelineSchema)
