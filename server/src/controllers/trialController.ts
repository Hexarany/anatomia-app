import { Request, Response } from 'express'
import User from '../models/User'

const TRIAL_DURATION_DAYS = 3
const TRIAL_TIER = 'basic'

// POST /api/trial/activate - Activate trial for user
export const activateTrial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Check if user already has/had trial
    if (user.trialEndsAt) {
      return res.status(400).json({
        message: 'Вы уже использовали пробный период',
        error: {
          code: 'TRIAL_ALREADY_USED',
          trialEndsAt: user.trialEndsAt
        }
      })
    }

    // Check if user already has paid subscription
    if (user.subscriptionEndsAt && user.subscriptionEndsAt > new Date()) {
      return res.status(400).json({
        message: 'У вас уже есть активная подписка',
        error: {
          code: 'SUBSCRIPTION_ACTIVE',
          subscriptionEndsAt: user.subscriptionEndsAt
        }
      })
    }

    // Check if user already has basic or premium
    if (user.accessLevel !== 'free') {
      return res.status(400).json({
        message: 'Пробный период доступен только для пользователей с бесплатным доступом',
        error: {
          code: 'NOT_FREE_USER',
          currentAccessLevel: user.accessLevel
        }
      })
    }

    // Activate trial
    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000)

    user.accessLevel = TRIAL_TIER
    user.trialEndsAt = trialEndsAt

    await user.save()

    res.json({
      message: `Пробный период на ${TRIAL_DURATION_DAYS} дня успешно активирован!`,
      trial: {
        tier: TRIAL_TIER,
        duration: TRIAL_DURATION_DAYS,
        startsAt: now,
        endsAt: trialEndsAt,
      },
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessLevel: user.accessLevel,
        trialEndsAt: user.trialEndsAt,
      },
    })
  } catch (error: any) {
    console.error('Error activating trial:', error)
    res.status(500).json({
      message: 'Ошибка при активации пробного периода',
      error: error.message,
    })
  }
}

// GET /api/trial/status - Check trial status for user
export const getTrialStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    const now = new Date()
    const hasActiveTrial = user.trialEndsAt && user.trialEndsAt > now
    const hasUsedTrial = user.trialEndsAt !== undefined && user.trialEndsAt !== null
    const canActivateTrial = !hasUsedTrial && user.accessLevel === 'free' && (!user.subscriptionEndsAt || user.subscriptionEndsAt < now)

    res.json({
      canActivateTrial,
      hasActiveTrial,
      hasUsedTrial,
      trialEndsAt: user.trialEndsAt,
      currentAccessLevel: user.accessLevel,
      subscriptionEndsAt: user.subscriptionEndsAt,
      trial: {
        duration: TRIAL_DURATION_DAYS,
        tier: TRIAL_TIER,
      }
    })
  } catch (error: any) {
    console.error('Error getting trial status:', error)
    res.status(500).json({
      message: 'Ошибка при получении статуса пробного периода',
      error: error.message,
    })
  }
}
