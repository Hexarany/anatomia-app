export interface Category {
  _id: string
  name: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  icon?: string
  slug: string
  order: number
}

export interface Topic {
  _id: string
  categoryId: string
  name: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  content: {
    ru: string
    ro: string
  }
  images: MediaFile[]
  videos: MediaFile[]
  model3D?: string
  slug: string
  order: number
}

export interface MediaFile {
  _id: string
  url: string
  filename: string
  caption?: {
    ru: string
    ro: string
  }
  type: 'image' | 'video' | '3d-model'
}

export interface Quiz {
  _id: string
  topicId?: string
  categoryId?: string
  title: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  questions: QuizQuestion[]
  slug: string
}

export interface QuizQuestion {
  _id: string
  question: {
    ru: string
    ro: string
  }
  options: Array<{
    ru: string
    ro: string
  }>
  correctAnswer: number
  explanation?: {
    ru: string
    ro: string
  }
  image?: string
}

export interface QuizResult {
  quizId: string
  score: number
  totalQuestions: number
  answers: Array<{
    questionId: string
    selectedAnswer: number
    correct: boolean
  }>
}

export type Language = 'ru' | 'ro'
