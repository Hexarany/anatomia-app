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

export interface IMassageProtocol extends Document {
  name: IMultiLangText
  description: IMultiLangText
  content: IMultiLangText
  type: string // классический, баночный, антицеллюлитный, медовый, тайский, точечный, массаж лица
  duration: number // продолжительность в минутах
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  benefits: IMultiLangText // польза массажа
  contraindications: IMultiLangText // противопоказания
  technique: IMultiLangText // техника выполнения
  images: IMediaFile[]
  videos: IMediaFile[]
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
    enum: ['image', 'video'],
    required: true,
  },
})

const MassageProtocolSchema: Schema = new Schema(
  {
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
    type: { type: String, required: true },
    duration: { type: Number, default: 60 }, // по умолчанию 60 минут
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    benefits: {
      ru: { type: String, default: '' },
      ro: { type: String, default: '' },
    },
    contraindications: {
      ru: { type: String, default: '' },
      ro: { type: String, default: '' },
    },
    technique: {
      ru: { type: String, default: '' },
      ro: { type: String, default: '' },
    },
    images: [MediaFileSchema],
    videos: [MediaFileSchema],
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

// Автоматическое создание slug из названия на русском
MassageProtocolSchema.pre<IMassageProtocol>('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    const transliterate = require('transliteration').transliterate
    this.slug = transliterate((this.name as IMultiLangText).ru)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

export default mongoose.model<IMassageProtocol>('MassageProtocol', MassageProtocolSchema)
