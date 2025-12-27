import mongoose, { Document, Schema } from 'mongoose'

export interface BilingualText {
  ru: string
  ro: string
}

export interface EducationItem {
  title: BilingualText
  description: BilingualText
}

export interface ExperienceItem {
  title: BilingualText
  description: BilingualText
}

export interface Stats {
  students: number
  yearsOfExperience: number
  protocols: number
}

export interface IInstructorProfile extends Document {
  // Basic info
  photo?: string // URL to uploaded photo
  name: BilingualText
  title: BilingualText
  badges: BilingualText[]

  // About section
  bio: BilingualText

  // Education section
  education: EducationItem[]

  // Experience section
  experience: ExperienceItem[]

  // Philosophy section
  philosophy: BilingualText

  // Stats
  stats: Stats

  // Why platform section
  whyPlatform: BilingualText
  promise: BilingualText

  // Metadata
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const instructorProfileSchema = new Schema<IInstructorProfile>(
  {
    photo: { type: String },
    name: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    title: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    badges: [
      {
        ru: { type: String },
        ro: { type: String },
      },
    ],
    bio: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    education: [
      {
        title: {
          ru: { type: String, required: true },
          ro: { type: String, required: true },
        },
        description: {
          ru: { type: String, required: true },
          ro: { type: String, required: true },
        },
      },
    ],
    experience: [
      {
        title: {
          ru: { type: String, required: true },
          ro: { type: String, required: true },
        },
        description: {
          ru: { type: String, required: true },
          ro: { type: String, required: true },
        },
      },
    ],
    philosophy: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    stats: {
      students: { type: Number, default: 500 },
      yearsOfExperience: { type: Number, default: 10 },
      protocols: { type: Number, default: 15 },
    },
    whyPlatform: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    promise: {
      ru: { type: String, required: true },
      ro: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

const InstructorProfile = mongoose.model<IInstructorProfile>('InstructorProfile', instructorProfileSchema)

export default InstructorProfile
