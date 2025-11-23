// server/src/controllers/mediaController.ts
import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { transliterate, slugify } from 'transliteration'
import Media from '../models/Media'

// Создаем папку для загрузок, если её нет
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Конфигурация Multer для локального хранилища (для разработки)
// В Production замените на облачное хранилище (S3/Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла с транслитерацией
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const basename = path.basename(file.originalname, ext)

    // Логируем для отладки
    console.log('📝 Original filename:', file.originalname)
    console.log('📝 Basename:', basename)

    // Транслитерируем имя файла (кириллица -> латиница) и делаем slug
    const transliteratedName = slugify(basename, {
      lowercase: true,
      separator: '-'
    })

    console.log('📝 Transliterated:', transliteratedName)

    // Если после транслитерации имя пустое или слишком короткое, используем 'file'
    const finalName = transliteratedName && transliteratedName.length > 2
      ? transliteratedName
      : 'file'

    cb(null, `${finalName}-${uniqueSuffix}${ext}`)
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB лимит для видео
  fileFilter: (req, file, cb) => {
    // Разрешаем изображения, видео и 3D модели
    const allowedMimes = [
      // Изображения
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/jpg',
      // Видео
      'video/mp4',
      'video/mpeg',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/webm',
      // 3D модели
      'model/gltf-binary', // .glb
      'application/octet-stream' // для .glb (иногда определяется так)
    ]
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.glb')) {
      cb(null, true)
    } else {
      cb(new Error('Неподдерживаемый тип файла. Разрешены: изображения, .mp4, .glb'))
    }
  }
})

// Контроллер загрузки
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'Файл не был предоставлен или превышен лимит размера.' } })
    }

    // URL для доступа к файлу через сервер
    const fileUrl = `/uploads/${req.file.filename}`

    // Сохраняем информацию о файле в базу данных
    const media = new Media({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: (req as any).userId, // userId из JWT токена
    })

    await media.save()

    const fileInfo = {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      message: 'Файл успешно загружен на сервер.',
    }

    res.status(200).json(fileInfo)
  } catch (error) {
    console.error('Error uploading file:', error)
    // Если произошла ошибка при сохранении в БД, удаляем физический файл
    if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    res.status(500).json({ error: { message: 'Ошибка при загрузке файла.' } })
  }
}

// Контроллер для удаления
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params

    // Находим запись в базе данных
    const media = await Media.findOne({ filename })

    if (!media) {
      return res.status(404).json({ error: { message: 'Файл не найден в базе данных.' } })
    }

    // Удаляем физический файл
    const filePath = path.join(uploadDir, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Удаляем запись из базы данных
    await Media.deleteOne({ filename })

    res.json({ message: `Файл ${filename} успешно удален.` })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении файла.' } })
  }
}

// Контроллер для получения списка всех файлов
export const getMediaList = async (req: Request, res: Response) => {
  try {
    const mediaFiles = await Media.find()
      .sort({ createdAt: -1 }) // Сортируем по дате загрузки (новые первыми)
      .select('-__v') // Исключаем версионирование mongoose
      .populate('uploadedBy', 'name email') // Подгружаем информацию о загрузившем пользователе

    res.json(mediaFiles)
  } catch (error) {
    console.error('Error fetching media list:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении списка файлов.' } })
  }
}