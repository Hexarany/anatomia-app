import { Request, Response } from 'express'
import AnatomyModel3D from '../models/AnatomyModel3D'

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
    res.status(200).json(model)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении модели' })
  }
}

export const getModelBySlug = async (req: Request, res: Response) => {
  try {
    const model = await AnatomyModel3D.findOne({ slug: req.params.slug })
    if (!model) return res.status(404).json({ message: 'Модель не найдена' })
    res.status(200).json(model)
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
