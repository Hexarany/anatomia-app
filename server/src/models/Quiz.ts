import mongoose, { Schema, Document } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

interface IQuizOption {
  ru: string
  ro: string
}

interface IQuizQuestion {
  question: IMultiLangText
  options: IQuizOption[]
  correctAnswer: number
  explanation?: IMultiLangText
  image?: string
}

export interface IQuiz extends Document {
  topicId?: mongoose.Types.ObjectId
  categoryId?: mongoose.Types.ObjectId
  title: IMultiLangText
  description: IMultiLangText
  questions: IQuizQuestion[]
  slug: string
  createdAt: Date
  updatedAt: Date
}

const QuizQuestionSchema = new Schema({
  question: {
    ru: { type: String, required: true },
    ro: { type: String, required: true },
  },
  options: [
    {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
  ],
  correctAnswer: { type: Number, required: true },
  explanation: {
    ru: String,
    ro: String,
  },
  image: String,
})

const QuizSchema: Schema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    title: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    description: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    questions: [QuizQuestionSchema],
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IQuiz>('Quiz', QuizSchema)
