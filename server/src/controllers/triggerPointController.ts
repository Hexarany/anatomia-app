import { Request, Response } from 'express'
import TriggerPoint from '../models/TriggerPoint'
import User from '../models/User'

interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean
}

// Helper: Check if user has access to trigger points (Premium tier only)
const hasAccessToTriggerPoint = async (
  userId: string | undefined,
  userRole: string | undefined
): Promise<{ hasAccess: boolean; userAccessLevel: string }> => {
  // Admins and teachers have full access
  if (userRole === 'admin' || userRole === 'teacher') {
    return { hasAccess: true, userAccessLevel: 'premium' }
  }

  // Get user access level
  let userAccessLevel: 'free' | 'basic' | 'premium' = 'free'
  if (userId) {
    const user = await User.findById(userId)
    userAccessLevel = user?.accessLevel || 'free'
  }

  // Only Premium users have full access to trigger points
  const hasAccess = userAccessLevel === 'premium'

  return { hasAccess, userAccessLevel }
}

// Helper: Apply content lock
const createSafeTriggerPoint = (triggerPoint: any, hasAccess: boolean, userAccessLevel: string) => {
  // Create preview versions of all text fields
  const createPreview = (text: string | undefined) => {
    return text ? text.substring(0, 400) + '...' : ''
  }

  if (hasAccess) {
    // Full access - return everything
    return {
      ...triggerPoint.toObject(),
      hasFullContentAccess: true,
      accessInfo: {
        hasFullAccess: true,
        userAccessLevel,
        requiredTier: 'premium',
      },
    }
  }

  // Limited access - return preview versions
  return {
    ...triggerPoint.toObject(),
    location: {
      ru: createPreview(triggerPoint.location?.ru),
      ro: createPreview(triggerPoint.location?.ro),
    },
    symptoms: {
      ru: createPreview(triggerPoint.symptoms?.ru),
      ro: createPreview(triggerPoint.symptoms?.ro),
    },
    referralPattern: {
      ru: createPreview(triggerPoint.referralPattern?.ru),
      ro: createPreview(triggerPoint.referralPattern?.ro),
    },
    technique: {
      ru: createPreview(triggerPoint.technique?.ru),
      ro: createPreview(triggerPoint.technique?.ro),
    },
    hasFullContentAccess: false,
    accessInfo: {
      hasFullAccess: false,
      userAccessLevel,
      requiredTier: 'premium',
    },
  }
}

// Получить все триггерные точки
export const getTriggerPoints = async (req: Request, res: Response) => {
  try {
    const { category } = req.query
    const filter: any = { isPublished: true }

    if (category) {
      filter.category = category
    }

    const triggerPoints = await TriggerPoint.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select('-__v')

    res.json(triggerPoints)
  } catch (error) {
    console.error('Error fetching trigger points:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении триггерных точек' } })
  }
}

// Получить триггерную точку по ID
export const getTriggerPointById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const triggerPoint = await TriggerPoint.findById(id).select('-__v')

    if (!triggerPoint) {
      return res.status(404).json({ error: { message: 'Триггерная точка не найдена' } })
    }

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToTriggerPoint(customReq.userId, customReq.userRole)

    const safeTriggerPoint = createSafeTriggerPoint(
      triggerPoint,
      accessInfo.hasAccess,
      accessInfo.userAccessLevel
    )

    res.json(safeTriggerPoint)
  } catch (error) {
    console.error('Error fetching trigger point:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении триггерной точки' } })
  }
}

// Получить триггерную точку по slug
export const getTriggerPointBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const triggerPoint = await TriggerPoint.findOne({ slug, isPublished: true }).select('-__v')

    if (!triggerPoint) {
      return res.status(404).json({ error: { message: 'Триггерная точка не найдена' } })
    }

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToTriggerPoint(customReq.userId, customReq.userRole)

    const safeTriggerPoint = createSafeTriggerPoint(
      triggerPoint,
      accessInfo.hasAccess,
      accessInfo.userAccessLevel
    )

    res.json(safeTriggerPoint)
  } catch (error) {
    console.error('Error fetching trigger point by slug:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении триггерной точки' } })
  }
}

// Создать новую триггерную точку (ADMIN)
export const createTriggerPoint = async (req: Request, res: Response) => {
  try {
    const triggerPoint = new TriggerPoint(req.body)
    await triggerPoint.save()
    res.status(201).json(triggerPoint)
  } catch (error: any) {
    console.error('Error creating trigger point:', error)

    if (error.code === 11000) {
      return res.status(400).json({
        error: { message: 'Триггерная точка с таким slug уже существует' }
      })
    }

    res.status(500).json({ error: { message: 'Ошибка при создании триггерной точки' } })
  }
}

// Обновить триггерную точку (ADMIN)
export const updateTriggerPoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const triggerPoint = await TriggerPoint.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!triggerPoint) {
      return res.status(404).json({ error: { message: 'Триггерная точка не найдена' } })
    }

    res.json(triggerPoint)
  } catch (error: any) {
    console.error('Error updating trigger point:', error)

    if (error.code === 11000) {
      return res.status(400).json({
        error: { message: 'Триггерная точка с таким slug уже существует' }
      })
    }

    res.status(500).json({ error: { message: 'Ошибка при обновлении триггерной точки' } })
  }
}

// Удалить триггерную точку (ADMIN)
export const deleteTriggerPoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const triggerPoint = await TriggerPoint.findByIdAndDelete(id)

    if (!triggerPoint) {
      return res.status(404).json({ error: { message: 'Триггерная точка не найдена' } })
    }

    res.json({ message: 'Триггерная точка успешно удалена' })
  } catch (error) {
    console.error('Error deleting trigger point:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении триггерной точки' } })
  }
}
