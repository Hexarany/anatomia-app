import mongoose, { Document, Schema } from 'mongoose'

interface IMultiLangText {
  ru: string
  ro: string
}

export interface IAssignment extends Document {
  schedule: mongoose.Types.ObjectId // Связь с занятием
  group: mongoose.Types.ObjectId // Группа
  title: IMultiLangText
  description: IMultiLangText
  deadline: Date
  maxScore: number // Максимальный балл (например, 10)
  allowLateSubmission: boolean
  lateSubmissionDeadline?: Date // Крайний срок для поздней сдачи
  attachments: string[] // Прикрепленные файлы от преподавателя (URLs)
  instructions?: IMultiLangText // Дополнительные инструкции
  requiresFile: boolean // Требуется ли прикрепление файла
  createdBy: mongoose.Types.ObjectId // Преподаватель
  createdAt: Date
  updatedAt: Date
}

const assignmentSchema = new Schema<IAssignment>(
  {
    schedule: {
      type: Schema.Types.ObjectId,
      ref: 'Schedule',
      required: [true, 'Schedule is required'],
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
    },
    title: {
      ru: {
        type: String,
        required: [true, 'Title in Russian is required'],
      },
      ro: {
        type: String,
        required: [true, 'Title in Romanian is required'],
      },
    },
    description: {
      ru: {
        type: String,
        required: [true, 'Description in Russian is required'],
      },
      ro: {
        type: String,
        required: [true, 'Description in Romanian is required'],
      },
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    maxScore: {
      type: Number,
      required: [true, 'Max score is required'],
      min: 1,
      default: 10,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    lateSubmissionDeadline: {
      type: Date,
    },
    attachments: [{ type: String }],
    instructions: {
      ru: String,
      ro: String,
    },
    requiresFile: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
)

// Индексы для быстрого поиска
assignmentSchema.index({ schedule: 1 })
assignmentSchema.index({ group: 1, deadline: 1 })
assignmentSchema.index({ createdBy: 1 })
assignmentSchema.index({ deadline: 1 })

// Виртуальное поле: просрочено ли задание
assignmentSchema.virtual('isOverdue').get(function () {
  return new Date() > this.deadline
})

// Виртуальное поле: можно ли ещё сдать с опозданием
assignmentSchema.virtual('canSubmitLate').get(function () {
  if (!this.allowLateSubmission) return false
  if (!this.lateSubmissionDeadline) return true
  return new Date() <= this.lateSubmissionDeadline
})

// Валидация: крайний срок поздней сдачи должен быть после основного дедлайна
assignmentSchema.pre('save', function (next) {
  if (this.allowLateSubmission && this.lateSubmissionDeadline) {
    if (this.lateSubmissionDeadline <= this.deadline) {
      return next(new Error('Late submission deadline must be after the main deadline'))
    }
  }
  next()
})

const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema)

export default Assignment
