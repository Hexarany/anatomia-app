// server/src/controllers/presentationController.ts
import { Request, Response } from 'express'
import Presentation from '../models/Presentation'
import path from 'path' // Оставляем, но используем для Mock URL
import fs from 'fs' // Оставляем, но используем для Mock удаления

// Расширяем стандартный тип Request для доступа к данным пользователя
interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
}

// Получить все презентации
export const getPresentations = async (req: Request, res: Response) => {
  try {
    const { categoryId, published } = req.query

    const filter: any = {}
    if (categoryId) filter.categoryId = categoryId
    if (published !== undefined) filter.isPublished = published === 'true'

    const presentations = await Presentation.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
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
      .populate('uploadedBy', 'firstName lastName email')
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

// Создать новую презентацию (Используем CustomRequest)
export const createPresentation = async (req: CustomRequest, res: Response) => {
  try {
    // === ВАЖНО: ИСПРАВЛЕНИЕ АРХИТЕКТУРЫ ХРАНЕНИЯ ===
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' })
    }

    const { title_ru, title_ro, description_ru, description_ro, categoryId, order } = req.body

    // Проверка обязательных полей
    if (!title_ru || !title_ro) {
      // В Production/Cloud Storage не нужно чистить файл
      return res.status(400).json({ message: 'Заголовки на обоих языках обязательны' })
    }

    // ИСПРАВЛЕНО: req.user!._id заменено на req.userId
    if (!req.userId) {
        return res.status(401).json({ message: 'Пользователь не аутентифицирован' });
    }
    
    // ВНИМАНИЕ: Mock URL для облачного хранилища
    const fileUrl = `https://your.cloud-storage.com/${req.file.filename}`;

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
        // ИСПРАВЛЕНО: Используем Mock Cloud URL вместо локального /uploads/
        url: fileUrl, 
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
      categoryId: categoryId || undefined,
      uploadedBy: req.userId, // ИСПРАВЛЕНО
      order: order || 0,
    })

    const populatedPresentation = await Presentation.findById(presentation._id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('categoryId', 'name')

    res.status(201).json(populatedPresentation)
  } catch (error) {
    console.error('Error creating presentation:', error)
    // В Production/Cloud Storage здесь должна быть логика очистки файла в облаке
    res.status(500).json({ message: 'Ошибка создания презентации' })
  }
}

// Обновить презентацию
export const updatePresentation = async (req: CustomRequest, res: Response) => {
  try {
    const { title_ru, title_ro, description_ru, description_ro, categoryId, order, isPublished } = req.body

    const presentation = await Presentation.findById(req.params.id)
    if (!presentation) {
      return res.status(404).json({ message: 'Презентация не найдена' })
    }

    // Проверка прав (опционально: убедиться, что только владелец или админ может обновить)
    // if (req.userId !== presentation.uploadedBy.toString() && req.userRole !== 'admin') {
    //     return res.status(403).json({ message: 'Недостаточно прав' });
    // }

    // Обновляем поля
    if (title_ru) presentation.title.ru = title_ru
    if (title_ro) presentation.title.ro = title_ro
    if (description_ru !== undefined) presentation.description.ru = description_ru
    if (description_ro !== undefined) presentation.description.ro = description_ro
    if (categoryId !== undefined) presentation.categoryId = categoryId || undefined
    if (order !== undefined) presentation.order = order
    if (isPublished !== undefined) presentation.isPublished = isPublished

    // Если загружен новый файл (В Production/Cloud Storage)
    if (req.file) {
      // В Production: Здесь должна быть логика удаления старого файла из облака
      console.log(`MOCK: Удаление старого файла из облака: ${presentation.file.filename}`)

      // Обновляем информацию о файле
      presentation.file = {
        url: `https://your.cloud-storage.com/${req.file.filename}`, // Mock Cloud URL
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      }
    }

    await presentation.save()

    const updatedPresentation = await Presentation.findById(presentation._id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('categoryId', 'name')

    res.json(updatedPresentation)
  } catch (error) {
    console.error('Error updating presentation:', error)
    // В Production: Здесь должна быть логика отката загрузки нового файла
    res.status(500).json({ message: 'Ошибка обновления презентации' })
  }
}

// Удалить презентацию
export const deletePresentation = async (req: CustomRequest, res: Response) => {
  try {
    const presentation = await Presentation.findById(req.params.id)
    if (!presentation) {
      return res.status(404).json({ message: 'Презентация не найдена' })
    }
    
    // В Production: Здесь должна быть логика удаления файла из облака
    console.log(`MOCK: Удаление файла из облака: ${presentation.file.filename}`)
    
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
    
    // ВНИМАНИЕ: Этот маршрут пытается обслуживать файл с локального диска.
    // Если вы используете Cloud Storage, этот маршрут должен перенаправлять
    // пользователя на URL облачного хранилища (presentation.file.url).
    
    const filePath = presentation.file.url; // Используем URL из базы данных (Mock Cloud URL)
    
    if (!filePath || !filePath.startsWith('https://')) {
        return res.status(500).json({ message: 'Файл находится в облаке, но его URL недействителен.' })
    }

    // Перенаправляем на Cloud URL (работает, если файл публичный)
    res.redirect(filePath);
    
  } catch (error) {
    console.error('Error downloading presentation:', error)
    res.status(500).json({ message: 'Ошибка скачивания файла' })
  }
}