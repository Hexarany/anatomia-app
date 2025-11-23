import { Request, Response } from 'express'
import HygieneGuideline from '../models/HygieneGuideline'

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

    res.status(200).json(guideline)
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
