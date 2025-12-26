import mongoose, { Document, Schema } from 'mongoose'

interface PaymentHistoryItem {
  amount: number
  fromTier: 'free' | 'basic' | 'premium'
  toTier: 'free' | 'basic' | 'premium'
  paymentMethod: string
  paypalOrderId?: string
  paypalPayerId?: string
  date: Date
}

export interface IUser extends Document {
  email: string
  password: string
  // NEW: Split name into firstName and lastName
  firstName: string
  lastName: string
  // DEPRECATED: Keep for backward compatibility during migration
  name?: string
  role: 'student' | 'teacher' | 'admin'
  // NEW: Tier-based access level
  accessLevel: 'free' | 'basic' | 'premium'
  // NEW: Subscription expiration tracking
  subscriptionEndsAt?: Date // When paid subscription expires
  trialEndsAt?: Date // When trial period expires
  // NEW: Payment tracking
  paymentAmount?: number
  paymentDate?: Date
  paymentHistory: PaymentHistoryItem[]
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  // DEPRECATED: Keep for backward compatibility
  subscriptionStatus?: 'none' | 'active' | 'trial' | 'expired' | 'cancelled'
  subscriptionEndDate?: Date
  stripeCustomerId?: string
  // Telegram integration
  telegramId?: string
  telegramUsername?: string
  telegramLinkCode?: string
  telegramLinkCodeExpires?: Date
  telegramNotifications?: {
    enabled: boolean
    newContent: boolean
    homework: boolean
    grades: boolean
    dailyChallenge: boolean
  }
  telegramLanguage?: 'ru' | 'ro'
  telegramQuietHours?: {
    enabled: boolean
    start: string
    end: string
  }
  telegramPendingAction?: {
    action: 'submit' | 'resubmit'
    assignmentId: mongoose.Types.ObjectId
    createdAt: Date
  }
  telegramLinkedAt?: Date
  // Email notifications
  emailNotifications?: {
    enabled: boolean
    homework: boolean
    grades: boolean
    schedule: boolean
  }
  createdAt: Date
  updatedAt: Date
  // DEPRECATED: Use hasAccessToContent instead
  hasActiveSubscription(): boolean
  // NEW: Check tier-based access
  hasAccessToContent(tierRequired: 'free' | 'basic' | 'premium'): boolean
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email'],
    },
    password: {
      type: String,
      required: [true, 'Пароль обязателен'],
      minlength: [6, 'Пароль должен быть минимум 6 символов'],
    },
    // NEW: firstName and lastName
    firstName: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
      minlength: [1, 'Имя должно содержать минимум 1 символ'],
    },
    lastName: {
      type: String,
      required: false,  // Optional - some users may have single names
      default: '',
      trim: true,
    },
    // DEPRECATED: Keep for migration, now optional
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    // NEW: Tier-based access level
    accessLevel: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
    // NEW: Subscription expiration tracking
    subscriptionEndsAt: {
      type: Date,
    },
    trialEndsAt: {
      type: Date,
    },
    // NEW: Payment tracking
    paymentAmount: {
      type: Number,
    },
    paymentDate: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    paymentHistory: [
      {
        amount: { type: Number, required: true },
        fromTier: {
          type: String,
          enum: ['free', 'basic', 'premium'],
          required: true,
        },
        toTier: {
          type: String,
          enum: ['free', 'basic', 'premium'],
          required: true,
        },
        paymentMethod: { type: String, required: true },
        paypalOrderId: String,
        paypalPayerId: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // DEPRECATED: Keep for backward compatibility
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'trial', 'expired', 'cancelled'],
    },
    subscriptionEndDate: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
    },
    // Telegram integration
    telegramId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to be non-unique
      index: true,
    },
    telegramUsername: {
      type: String,
    },
    telegramLinkCode: {
      type: String,
    },
    telegramLinkCodeExpires: {
      type: Date,
    },
    telegramNotifications: {
      enabled: { type: Boolean, default: true },
      newContent: { type: Boolean, default: true },
      homework: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      dailyChallenge: { type: Boolean, default: true },
    },
    telegramLanguage: {
      type: String,
      enum: ['ru', 'ro'],
      default: 'ru',
    },
    telegramQuietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' },
    },
    telegramPendingAction: {
      action: {
        type: String,
        enum: ['submit', 'resubmit'],
      },
      assignmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Assignment',
      },
      createdAt: {
        type: Date,
      },
    },
    telegramLinkedAt: {
      type: Date,
    },
    // Email notifications
    emailNotifications: {
      enabled: { type: Boolean, default: true },
      homework: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      schedule: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
)

// Индексы
userSchema.index({ email: 1 })
userSchema.index({ accessLevel: 1 })
userSchema.index({ createdAt: -1 })

// DEPRECATED: Method to check if user has active subscription (for backward compatibility)
userSchema.methods.hasActiveSubscription = function (): boolean {
  if (this.role === 'admin' || this.role === 'teacher') {
    return true // Admins and teachers always have access
  }

  if (this.subscriptionStatus === 'active') {
    if (this.subscriptionEndDate && this.subscriptionEndDate > new Date()) {
      return true
    }
  }

  if (this.subscriptionStatus === 'trial') {
    if (this.subscriptionEndDate && this.subscriptionEndDate > new Date()) {
      return true
    }
  }

  return false
}

// NEW: Method to check tier-based access
userSchema.methods.hasAccessToContent = function (tierRequired: 'free' | 'basic' | 'premium'): boolean {
  // Admins and teachers always have full access
  if (this.role === 'admin' || this.role === 'teacher') {
    return true
  }

  const now = new Date()
  let effectiveAccessLevel = this.accessLevel || 'free'

  // Check if subscription has expired
  if (this.subscriptionEndsAt && this.subscriptionEndsAt < now) {
    effectiveAccessLevel = 'free' // Subscription expired, downgrade to free
  }

  // Check if trial has expired (and no paid subscription)
  if (this.trialEndsAt && this.trialEndsAt < now && (!this.subscriptionEndsAt || this.subscriptionEndsAt < now)) {
    effectiveAccessLevel = 'free' // Trial expired, downgrade to free
  }

  // Define tier hierarchy
  const tierHierarchy: { [key: string]: number } = { free: 0, basic: 1, premium: 2 }
  const userTierLevel = tierHierarchy[effectiveAccessLevel]
  const requiredTierLevel = tierHierarchy[tierRequired]

  return userTierLevel >= requiredTierLevel
}

const User = mongoose.model<IUser>('User', userSchema)

export default User
