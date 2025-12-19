import mongoose, { Document, Schema } from 'mongoose'

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId // Ссылка на задание
  student: mongoose.Types.ObjectId // Студент
  submittedAt: Date
  textAnswer?: string // Текстовый ответ
  files: string[] // Загруженные файлы (URLs)
  status: 'submitted' | 'graded' | 'revision' | 'late'
  isLate: boolean // Сдано ли с опозданием

  // Оценка
  grade?: number // Оценка (например, 8 из 10)
  feedback?: string // Комментарий преподавателя
  gradedAt?: Date
  gradedBy?: mongoose.Types.ObjectId // Кто проверил

  // История
  resubmissions: Array<{
    submittedAt: Date
    textAnswer?: string
    files: string[]
    comment?: string
  }>

  createdAt: Date
  updatedAt: Date

  // Методы
  sendForRevision(feedback: string): Promise<ISubmission>
  setGrade(grade: number, feedback: string, gradedBy: mongoose.Types.ObjectId): Promise<ISubmission>
  resubmit(textAnswer?: string, files?: string[], comment?: string): Promise<ISubmission>
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment is required'],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    textAnswer: {
      type: String,
    },
    files: [{ type: String }],
    status: {
      type: String,
      enum: ['submitted', 'graded', 'revision', 'late'],
      default: 'submitted',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    grade: {
      type: Number,
      min: 0,
    },
    feedback: {
      type: String,
    },
    gradedAt: {
      type: Date,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resubmissions: [
      {
        submittedAt: { type: Date, default: Date.now },
        textAnswer: String,
        files: [String],
        comment: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Индексы для быстрого поиска
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true })
submissionSchema.index({ student: 1, status: 1 })
submissionSchema.index({ assignment: 1, status: 1 })
submissionSchema.index({ gradedBy: 1 })
submissionSchema.index({ submittedAt: 1 })

// Виртуальное поле: процент от максимального балла
submissionSchema.virtual('scorePercentage').get(function () {
  if (!this.grade || !this.populated('assignment')) return null
  const assignment = this.assignment as any
  if (!assignment.maxScore) return null
  return Math.round((this.grade / assignment.maxScore) * 100)
})

// Метод для отправки на доработку
submissionSchema.methods.sendForRevision = function (feedback: string) {
  this.status = 'revision'
  this.feedback = feedback
  return this.save()
}

// Метод для выставления оценки
submissionSchema.methods.setGrade = function (grade: number, feedback: string, gradedBy: mongoose.Types.ObjectId) {
  this.grade = grade
  this.feedback = feedback
  this.status = 'graded'
  this.gradedAt = new Date()
  this.gradedBy = gradedBy
  return this.save()
}

// Метод для повторной сдачи
submissionSchema.methods.resubmit = function (textAnswer?: string, files?: string[], comment?: string) {
  // Сохраняем предыдущую версию в историю
  this.resubmissions.push({
    submittedAt: this.submittedAt,
    textAnswer: this.textAnswer,
    files: this.files,
    comment,
  })

  // Обновляем текущую версию
  this.textAnswer = textAnswer
  this.files = files || []
  this.submittedAt = new Date()
  this.status = 'submitted'

  return this.save()
}

// Валидация: при выставлении оценки должен быть указан проверяющий
submissionSchema.pre('save', function (next) {
  if (this.status === 'graded' && this.grade !== undefined && !this.gradedBy) {
    return next(new Error('Graded by is required when setting a grade'))
  }

  // Автоматически определяем, сдано ли с опозданием
  if (this.isNew && this.assignment) {
    // Проверка будет выполнена на уровне контроллера с полными данными assignment
  }

  next()
})

const Submission = mongoose.model<ISubmission>('Submission', submissionSchema)

export default Submission
