import { Request, Response } from 'express'
import HygieneGuideline from '../models/HygieneGuideline'
import User from '../models/User'

interface CustomRequest extends Request {
  userId?: string
  userRole?: string
}

// Helper: Check if user has access to hygiene guidelines (Basic tier and above)
const hasAccessToGuideline = async (
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

  // Basic and Premium users have full access to hygiene guidelines
  const hasAccess = userAccessLevel === 'basic' || userAccessLevel === 'premium'

  return { hasAccess, userAccessLevel }
}

// Helper: Apply content lock
const createSafeGuideline = (guideline: any, hasAccess: boolean, userAccessLevel: string) => {
  const previewContentRu = guideline.content.ru
    ? guideline.content.ru.substring(0, 400) + '...'
    : ''
  const previewContentRo = guideline.content.ro
    ? guideline.content.ro.substring(0, 400) + '...'
    : ''

  return {
    ...guideline.toObject(),
    content: hasAccess ? guideline.content : { ru: previewContentRu, ro: previewContentRo },
    hasFullContentAccess: hasAccess,
    accessInfo: {
      hasFullAccess: hasAccess,
      userAccessLevel,
      requiredTier: 'basic', // Hygiene guidelines require basic tier
    },
  }
}

// Получить все рекомендации
export const getAllGuidelines = async (req: Request, res: Response) => {
  try {
    const { category } = req.query
    const filter: any = { isPublished: true }

    if (category) {
      filter.category = category
    }

    const guidelines = await HygieneGuideline.find(filter).sort({ category: 1, order: 1 })
    res.status(200).json(guidelines)
  } catch (error) {
    console.error('Error fetching hygiene guidelines:', error)
    res.status(500).json({ message: 'Ошибка при получении рекомендаций' })
  }
}

// Получить рекомендацию по ID
export const getGuidelineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const guideline = await HygieneGuideline.findById(id)

    if (!guideline) {
      return res.status(404).json({ message: 'Рекомендация не найдена' })
    }

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToGuideline(customReq.userId, customReq.userRole)

    const safeGuideline = createSafeGuideline(
      guideline,
      accessInfo.hasAccess,
      accessInfo.userAccessLevel
    )

    res.status(200).json(safeGuideline)
  } catch (error) {
    console.error('Error fetching hygiene guideline:', error)
    res.status(500).json({ message: 'Ошибка при получении рекомендации' })
  }
}

// Создать новую рекомендацию (admin)
export const createGuideline = async (req: Request, res: Response) => {
  try {
    const guideline = new HygieneGuideline(req.body)
    await guideline.save()
    res.status(201).json(guideline)
  } catch (error) {
    console.error('Error creating hygiene guideline:', error)
    res.status(500).json({ message: 'Ошибка при создании рекомендации' })
  }
}

// Обновить рекомендацию (admin)
export const updateGuideline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const guideline = await HygieneGuideline.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!guideline) {
      return res.status(404).json({ message: 'Рекомендация не найдена' })
    }

    res.status(200).json(guideline)
  } catch (error) {
    console.error('Error updating hygiene guideline:', error)
    res.status(500).json({ message: 'Ошибка при обновлении рекомендации' })
  }
}

// Удалить рекомендацию (admin)
export const deleteGuideline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const guideline = await HygieneGuideline.findByIdAndDelete(id)

    if (!guideline) {
      return res.status(404).json({ message: 'Рекомендация не найдена' })
    }

    res.status(200).json({ message: 'Рекомендация удалена успешно' })
  } catch (error) {
    console.error('Error deleting hygiene guideline:', error)
    res.status(500).json({ message: 'Ошибка при удалении рекомендации' })
  }
}

// Добавить изображение к рекомендации
export const addImageToGuideline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { url, filename, caption } = req.body

    const guideline = await HygieneGuideline.findById(id)
    if (!guideline) {
      return res.status(404).json({ message: 'Рекомендация не найдена' })
    }

    guideline.images.push({
      url,
      filename,
      caption,
      type: 'image',
    })

    await guideline.save()
    res.status(200).json(guideline)
  } catch (error) {
    console.error('Error adding image to guideline:', error)
    res.status(500).json({ message: 'Ошибка при добавлении изображения' })
  }
}

// Удалить изображение из рекомендации
export const removeImageFromGuideline = async (req: Request, res: Response) => {
  try {
    const { id, imageId } = req.params

    const guideline = await HygieneGuideline.findById(id)
    if (!guideline) {
      return res.status(404).json({ message: 'Рекомендация не найдена' })
    }

    guideline.images = guideline.images.filter((img: any) => img._id.toString() !== imageId)
    await guideline.save()

    res.status(200).json(guideline)
  } catch (error) {
    console.error('Error removing image from guideline:', error)
    res.status(500).json({ message: 'Ошибка при удалении изображения' })
  }
}
