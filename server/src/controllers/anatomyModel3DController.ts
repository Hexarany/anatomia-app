import { Request, Response } from 'express'
import AnatomyModel3D from '../models/AnatomyModel3D'
import User from '../models/User'

interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean
}

// Helper: Check if user has access to 3D models (Premium tier only)
const hasAccessToModel = async (
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

  // Only Premium users have full access to 3D models
  const hasAccess = userAccessLevel === 'premium'

  return { hasAccess, userAccessLevel }
}

// Helper: Apply content lock
const createSafeModel = (model: any, hasAccess: boolean, userAccessLevel: string) => {
  const previewDescriptionRu = model.description.ru
    ? model.description.ru.substring(0, 400) + '...'
    : ''
  const previewDescriptionRo = model.description.ro
    ? model.description.ro.substring(0, 400) + '...'
    : ''

  return {
    ...model.toObject(),
    modelUrl: hasAccess ? model.modelUrl : null, // Hide 3D model file for non-premium users
    description: hasAccess
      ? model.description
      : { ru: previewDescriptionRu, ro: previewDescriptionRo },
    hasFullContentAccess: hasAccess,
    accessInfo: {
      hasFullAccess: hasAccess,
      userAccessLevel,
      requiredTier: 'premium', // 3D models require premium tier
    },
  }
}

export const getAllModels = async (req: Request, res: Response) => {
  try {
    const { category } = req.query
    const filter: any = { isPublished: true }
    if (category) filter.category = category
    const models = await AnatomyModel3D.find(filter).sort({ category: 1, order: 1 })
    res.status(200).json(models)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении моделей' })
  }
}

export const getModelById = async (req: Request, res: Response) => {
  try {
    const model = await AnatomyModel3D.findById(req.params.id)
    if (!model) return res.status(404).json({ message: 'Модель не найдена' })

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToModel(customReq.userId, customReq.userRole)

    const safeModel = createSafeModel(model, accessInfo.hasAccess, accessInfo.userAccessLevel)

    res.status(200).json(safeModel)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении модели' })
  }
}

export const getModelBySlug = async (req: Request, res: Response) => {
  try {
    const model = await AnatomyModel3D.findOne({ slug: req.params.slug })
    if (!model) return res.status(404).json({ message: 'Модель не найдена' })

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToModel(customReq.userId, customReq.userRole)

    const safeModel = createSafeModel(model, accessInfo.hasAccess, accessInfo.userAccessLevel)

    res.status(200).json(safeModel)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении модели' })
  }
}

export const createModel = async (req: Request, res: Response) => {
  try {
    const model = new AnatomyModel3D(req.body)
    await model.save()
    res.status(201).json(model)
  } catch (error: any) {
    console.error('Error creating model:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Ошибка валидации', details: error.message })
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Модель с таким slug уже существует' })
    }
    res.status(500).json({ message: 'Ошибка при создании модели', error: error.message })
  }
}

export const updateModel = async (req: Request, res: Response) => {
  try {
    const model = await AnatomyModel3D.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!model) return res.status(404).json({ message: 'Модель не найдена' })
    res.status(200).json(model)
  } catch (error: any) {
    console.error('Error updating model:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Ошибка валидации', details: error.message })
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Модель с таким slug уже существует' })
    }
    res.status(500).json({ message: 'Ошибка при обновлении модели', error: error.message })
  }
}

export const deleteModel = async (req: Request, res: Response) => {
  try {
    const model = await AnatomyModel3D.findByIdAndDelete(req.params.id)
    if (!model) return res.status(404).json({ message: 'Модель не найдена' })
    res.status(200).json({ message: 'Модель удалена' })
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении модели' })
  }
}
