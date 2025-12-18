// client/src/types/index.ts
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
  categoryId: string | Category // Добавлен тип Category для populated
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
  region?: {
    ru: string
    ro: string
  }
  // === ДОБАВЛЕННЫЕ ПОЛЯ (для TopicsManager.tsx) ===
  imageUrl?: string // Используется в форме
  modelUrl?: string // Используется в форме
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: number
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

export interface MassageProtocol {
  _id: string
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
  type: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  benefits: {
    ru: string
    ro: string
  }
  contraindications: {
    ru: string
    ro: string
  }
  technique: {
    ru: string
    ro: string
  }
  images: MediaFile[]
  videos: MediaFile[]
  slug: string
  order: number
  createdAt?: string | Date
  updatedAt?: string | Date
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

// Subscription types
export interface SubscriptionPlan {
  id: string
  name: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  price: number
  currency: string
  duration: number // in days
  features: {
    ru: string[]
    ro: string[]
  }
  stripePriceId?: string
}

export interface Subscription {
  _id: string
  userId: string
  plan: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: string | Date
  endDate: string | Date
  autoRenew: boolean
  paymentMethod?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  amount: number
  currency: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CurrentSubscription {
  user: {
    subscriptionStatus: 'none' | 'active' | 'trial' | 'expired'
    subscriptionEndDate?: string | Date
    hasActiveSubscription: boolean
  }
  subscription: Subscription | null
}

export interface HygieneGuideline {
  _id: string
  title: {
    ru: string
    ro: string
  }
  category: 'sterilization' | 'disinfection' | 'ergonomics' | 'office_requirements' | 'therapist_requirements' | 'dress_code'
  content: {
    ru: string
    ro: string
  }
  images: MediaFile[]
  order: number
  isPublished: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface AnatomyModel3D {
  _id: string
  name: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  category: 'bones' | 'muscles' | 'organs' | 'nervous_system' | 'cardiovascular_system' | 'other'
  modelUrl: string
  previewImage?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: Array<{
    ru: string
    ro: string
  }>
  attribution?: {
    author: string
    source: string
    sourceUrl?: string
    license: string
  }
  slug: string
  order: number
  isPublished: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface TriggerPoint {
  _id: string
  name: {
    ru: string
    ro: string
  }
  muscle: string
  location: {
    ru: string
    ro: string
  }
  symptoms: {
    ru: string
    ro: string
  }
  referralPattern: {
    ru: string
    ro: string
  }
  technique: {
    ru: string
    ro: string
  }
  contraindications?: {
    ru: string
    ro: string
  }
  images: MediaFile[]
  videos: MediaFile[]
  model3D?: string
  category: 'head_neck' | 'shoulder_arm' | 'back' | 'chest' | 'hip_leg' | 'other'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  slug: string
  order: number
  isPublished: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

// User (simplified for group management)
export interface UserBasic {
  _id: string
  firstName: string
  lastName: string
  email: string
  name?: string // Some endpoints return combined name
}

// Group Management
export interface Group {
  _id: string
  name: {
    ru: string
    ro: string
  }
  description?: {
    ru: string
    ro: string
  }
  teacher: UserBasic
  students: UserBasic[]
  startDate: string
  endDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateGroupDto {
  name: {
    ru: string
    ro: string
  }
  description?: {
    ru: string
    ro: string
  }
  teacher: string // ID преподавателя
  students?: string[] // ID студентов
  startDate: string
  endDate?: string
  isActive?: boolean
}

// Telegram Integration
export interface TelegramLinkStatus {
  isLinked: boolean
  telegramUsername?: string
  linkedAt?: string
  notifications?: {
    enabled: boolean
    newContent: boolean
    homework: boolean
    grades: boolean
    dailyChallenge: boolean
  }
}

export interface TelegramLinkCode {
  code: string
  expiresIn: number
  botUsername: string
}