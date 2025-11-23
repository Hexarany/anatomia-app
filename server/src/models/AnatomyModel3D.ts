import mongoose, { Schema, Document } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

export interface IAnatomyModel3D extends Document {
  name: IMultiLangText
  description: IMultiLangText
  category: 'bones' | 'muscles' | 'organs' | 'nervous_system' | 'cardiovascular_system' | 'other'
  modelUrl: string // URL к .glb файлу
  previewImage?: string // URL к изображению превью
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: IMultiLangText[]
  slug: string
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const AnatomyModel3DSchema: Schema = new Schema(
  {
    name: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    description: {
      ru: { type: String, default: '' },
      ro: { type: String, default: '' },
    },
    category: {
      type: String,
      enum: ['bones', 'muscles', 'organs', 'nervous_system', 'cardiovascular_system', 'other'],
      required: true,
    },
    modelUrl: { type: String, required: true },
    previewImage: { type: String },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    tags: [
      {
        ru: String,
        ro: String,
      },
    ],
    slug: { type: String, unique: true, sparse: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

// Автоматическое создание slug из названия на русском
AnatomyModel3DSchema.pre<IAnatomyModel3D>('save', function (next) {
  if (!this.slug && (this.name as IMultiLangText).ru) {
    const transliterate = require('transliteration').transliterate
    this.slug = transliterate((this.name as IMultiLangText).ru)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

// Индекс для быстрого поиска
AnatomyModel3DSchema.index({ category: 1, order: 1 })
AnatomyModel3DSchema.index({ slug: 1 })

export default mongoose.model<IAnatomyModel3D>('AnatomyModel3D', AnatomyModel3DSchema)
