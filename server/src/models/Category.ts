import mongoose, { Schema, Document } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

export interface ICategory extends Document {
  name: IMultiLangText
  description: IMultiLangText
  icon?: string
  slug: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    description: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    icon: { type: String },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<ICategory>('Category', CategorySchema)
