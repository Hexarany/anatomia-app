import mongoose, { Document, Schema } from 'mongoose'

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId

  // Изученные темы
  completedTopics: Array<{
    topicId: mongoose.Types.ObjectId
    completedAt: Date
    timeSpent: number // в секундах
  }>

  // Просмотренные протоколы массажа
  viewedProtocols: Array<{
    protocolId: mongoose.Types.ObjectId
    viewedAt: Date
    timeSpent: number
  }>

  // Просмотренные гайдлайны
  viewedGuidelines: Array<{
    guidelineId: mongoose.Types.ObjectId
    viewedAt: Date
  }>

  // Просмотренные 3D модели
  viewed3DModels: Array<{
    modelId: mongoose.Types.ObjectId
    viewedAt: Date
  }>

  // Просмотренные триггерные точки
  viewedTriggerPoints: Array<{
    triggerPointId: mongoose.Types.ObjectId
    viewedAt: Date
  }>

  // Пройденные тесты
  completedQuizzes: Array<{
    quizId: mongoose.Types.ObjectId
    score: number
    totalQuestions: number
    correctAnswers: number
    completedAt: Date
    timeSpent: number
    mode: 'practice' | 'exam'
  }>

  // Достижения
  achievements: Array<{
    achievementId: string
    unlockedAt: Date
    title: { ru: string; ro: string }
    description: { ru: string; ro: string }
    icon: string
  }>

  // Статистика
  stats: {
    totalStudyTime: number // общее время обучения в секундах
    streak: number // текущая серия дней подряд
    lastActivityDate: Date
    longestStreak: number
    totalTopicsCompleted: number
    totalQuizzesPassed: number
    averageQuizScore: number
  }

  createdAt: Date
  updatedAt: Date
}

const progressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    completedTopics: [
      {
        topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
        completedAt: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 },
      },
    ],
    viewedProtocols: [
      {
        protocolId: { type: Schema.Types.ObjectId, ref: 'MassageProtocol', required: true },
        viewedAt: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 },
      },
    ],
    viewedGuidelines: [
      {
        guidelineId: { type: Schema.Types.ObjectId, ref: 'HygieneGuideline', required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    viewed3DModels: [
      {
        modelId: { type: Schema.Types.ObjectId, ref: 'AnatomyModel3D', required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    viewedTriggerPoints: [
      {
        triggerPointId: { type: Schema.Types.ObjectId, ref: 'TriggerPoint', required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    completedQuizzes: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        score: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },
        correctAnswers: { type: Number, required: true },
        completedAt: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 },
        mode: { type: String, enum: ['practice', 'exam'], default: 'practice' },
      },
    ],
    achievements: [
      {
        achievementId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        title: {
          ru: { type: String, required: true },
          ro: { type: String, required: true },
        },
        description: {
          ru: { type: String, required: true },
          ro: { type: String, required: true },
        },
        icon: { type: String, required: true },
      },
    ],
    stats: {
      totalStudyTime: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: Date.now },
      longestStreak: { type: Number, default: 0 },
      totalTopicsCompleted: { type: Number, default: 0 },
      totalQuizzesPassed: { type: Number, default: 0 },
      averageQuizScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
)

// Индексы для быстрого поиска
progressSchema.index({ userId: 1 })
progressSchema.index({ 'completedTopics.topicId': 1 })
progressSchema.index({ 'completedQuizzes.quizId': 1 })

export default mongoose.model<IProgress>('Progress', progressSchema)
