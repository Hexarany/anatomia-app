import mongoose, { Document, Schema } from 'mongoose'

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId
  certificateNumber: string
  certificateType: 'course_completion' | 'topic_mastery' | 'exam_excellence' | 'full_course'
  title: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  issuedAt: Date
  validUntil?: Date
  requirements: {
    minTopicsCompleted: number
    minQuizzesPassed: number
    minAverageScore: number
    specificTopics?: string[]
    specificQuizzes?: string[]
  }
  requirementsMet: {
    topicsCompleted: number
    quizzesPassed: number
    averageScore: number
    completedAt: Date
  }
  metadata: {
    courseName?: string
    instructorName?: string
    institution: string
    credentialId: string
  }
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    certificateType: {
      type: String,
      enum: ['course_completion', 'topic_mastery', 'exam_excellence', 'full_course'],
      required: true,
    },
    title: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    description: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
    },
    requirements: {
      minTopicsCompleted: { type: Number, required: true },
      minQuizzesPassed: { type: Number, required: true },
      minAverageScore: { type: Number, required: true },
      specificTopics: [{ type: String }],
      specificQuizzes: [{ type: String }],
    },
    requirementsMet: {
      topicsCompleted: { type: Number, required: true },
      quizzesPassed: { type: Number, required: true },
      averageScore: { type: Number, required: true },
      completedAt: { type: Date, required: true },
    },
    metadata: {
      courseName: { type: String },
      instructorName: { type: String },
      institution: {
        type: String,
        required: true,
        default: 'Anatomia Study Platform',
      },
      credentialId: {
        type: String,
        required: true,
        unique: true,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Generate certificate number before saving
CertificateSchema.pre('save', async function (next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('Certificate').countDocuments()
    this.certificateNumber = `ANAT-${year}-${String(count + 1).padStart(6, '0')}`
  }
  if (!this.metadata.credentialId) {
    this.metadata.credentialId = `CRED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }
  next()
})

// Index for verification
CertificateSchema.index({ certificateNumber: 1, 'metadata.credentialId': 1 })

export default mongoose.model<ICertificate>('Certificate', CertificateSchema)
