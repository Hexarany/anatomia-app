import { Request, Response } from 'express'
import Presentation from '../models/Presentation'
import path from 'path'
import fs from 'fs'

// Получить все презентации
export const getPresentations = async (req: Request, res: Response) => {
  try {
    const { categoryId, published } = req.query

    const filter: any = {}
    if (categoryId) filter.categoryId = categoryId
    if (published !== undefined) filter.isPublished = published === 'true'

    const presentations = await Presentation.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('categoryId', 'name')
      .sort({ order: 1, createdAt: -1 })

    res.json(presentations)
  } catch (error) {
    console.error('Error fetching presentations:', error)
    res.status(500).json({ message: 'Ошибка получения презентаций' })
  }
}

// Получить одну презентацию
export const getPresentationById = async (req: Request, res: Response) => {
  try {
    const presentation = await Presentation.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('categoryId', 'name')

    if (!presentation) {
      return res.status(404).json({ message: 'Презентация не найдена' })
    }

    res.json(presentation)
  } catch (error) {
    console.error('Error fetching presentation:', error)
    res.status(500).json({ message: 'Ошибка получения презентации' })
  }
}

// Создать новую презентацию
export const createPresentation = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' })
    }

    const { title_ru, title_ro, description_ru, description_ro, categoryId, order } = req.body

    // Проверка обязательных полей
    if (!title_ru || !title_ro) {
      // Удаляем загруженный файл если валидация не прошла
      if (req.file.path) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(400).json({ message: 'Заголовки на обоих языках обязательны' })
    }

    const presentation = await Presentation.create({
      title: {
        ru: title_ru,
        ro: title_ro,
      },
      description: {
        ru: description_ru || '',
        ro: description_ro || '',
      },
      file: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
      categoryId: categoryId || undefined,
      uploadedBy: req.user!._id,
      order: order || 0,
    })

    const populatedPresentation = await Presentation.findById(presentation._id)
      .populate('uploadedBy', 'name email')
      .populate('categoryId', 'name')

    res.status(201).json(populatedPresentation)
  } catch (error) {
    console.error('Error creating presentation:', error)
    // Удаляем файл при ошибке
    if (req.file?.path) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: 'Ошибка создания презентации' })
  }
}

// Обновить презентацию
export const updatePresentation = async (req: Request, res: Response) => {
  try {
    const { title_ru, title_ro, description_ru, description_ro, categoryId, order, isPublished } = req.body

    const presentation = await Presentation.findById(req.params.id)
    if (!presentation) {
      return res.status(404).json({ message: 'Презентация не найдена' })
    }

    // Обновляем поля
    if (title_ru) presentation.title.ru = title_ru
    if (title_ro) presentation.title.ro = title_ro
    if (description_ru !== undefined) presentation.description.ru = description_ru
    if (description_ro !== undefined) presentation.description.ro = description_ro
    if (categoryId !== undefined) presentation.categoryId = categoryId || undefined
    if (order !== undefined) presentation.order = order
    if (isPublished !== undefined) presentation.isPublished = isPublished

    // Если загружен новый файл
    if (req.file) {
      // Удаляем старый файл
      const oldFilePath = path.join(process.cwd(), 'uploads', presentation.file.filename)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }

      // Обновляем информацию о файле
      presentation.file = {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      }
    }

    await presentation.save()

    const updatedPresentation = await Presentation.findById(presentation._id)
      .populate('uploadedBy', 'name email')
      .populate('categoryId', 'name')

    res.json(updatedPresentation)
  } catch (error) {
    console.error('Error updating presentation:', error)
    // Удаляем новый файл при ошибке
    if (req.file?.path) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: 'Ошибка обновления презентации' })
  }
}

// Удалить презентацию
export const deletePresentation = async (req: Request, res: Response) => {
  try {
    const presentation = await Presentation.findById(req.params.id)
    if (!presentation) {
      return res.status(404).json({ message: 'Презентация не найдена' })
    }

    // Удаляем файл
    const filePath = path.join(process.cwd(), 'uploads', presentation.file.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await Presentation.findByIdAndDelete(req.params.id)

    res.json({ message: 'Презентация успешно удалена' })
  } catch (error) {
    console.error('Error deleting presentation:', error)
    res.status(500).json({ message: 'Ошибка удаления презентации' })
  }
}

// Скачать файл презентации
export const downloadPresentation = async (req: Request, res: Response) => {
  try {
    const presentation = await Presentation.findById(req.params.id)
    if (!presentation) {
      return res.status(404).json({ message: 'Презентация не найдена' })
    }

    const filePath = path.join(process.cwd(), 'uploads', presentation.file.filename)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Файл не найден' })
    }

    // Устанавливаем заголовки для скачивания
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(presentation.file.originalName)}"`)
    res.setHeader('Content-Type', presentation.file.mimeType)

    // Отправляем файл
    res.sendFile(filePath)
  } catch (error) {
    console.error('Error downloading presentation:', error)
    res.status(500).json({ message: 'Ошибка скачивания файла' })
  }
}
