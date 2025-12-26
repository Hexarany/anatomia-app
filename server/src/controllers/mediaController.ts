import { Request, Response } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import { slugify } from 'transliteration'
import Media from '../models/Media'
import fs from 'fs'
import path from 'path'

// Используем multer для временного хранения в памяти
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB лимит (соответствует бесплатному плану Cloudinary)
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/jpg',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'model/gltf-binary',
      'application/octet-stream',
      // Document types
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ]
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.glb')) {
      cb(null, true)
    } else {
      cb(new Error('Неподдерживаемый тип файла'))
    }
  }
})

// Функция для загрузки в Cloudinary
const uploadToCloudinary = (buffer: Buffer, filename: string, mimetype: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Определяем тип ресурса
    let resourceType: 'image' | 'video' | 'raw' = 'image'
    if (mimetype.startsWith('video/')) {
      resourceType = 'video'
    } else if (
      mimetype === 'model/gltf-binary' ||
      mimetype === 'application/pdf' ||
      mimetype === 'application/msword' ||
      mimetype.includes('document') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('presentation') ||
      mimetype === 'text/plain' ||
      mimetype.includes('zip') ||
      mimetype.includes('rar') ||
      filename.endsWith('.glb') ||
      filename.endsWith('.pdf') ||
      filename.endsWith('.doc') ||
      filename.endsWith('.docx') ||
      filename.endsWith('.xls') ||
      filename.endsWith('.xlsx') ||
      filename.endsWith('.ppt') ||
      filename.endsWith('.pptx') ||
      filename.endsWith('.txt') ||
      filename.endsWith('.zip') ||
      filename.endsWith('.rar')
    ) {
      resourceType = 'raw'
    }

    // Генерируем уникальное имя
    const basename = filename.substring(0, filename.lastIndexOf('.')) || filename
    const extension = filename.substring(filename.lastIndexOf('.')) || ''
    const transliteratedName = slugify(basename, {
      lowercase: true,
      separator: '-'
    })
    const finalName = transliteratedName && transliteratedName.length > 2
      ? transliteratedName
      : 'file'
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // For raw files (like .glb), preserve the file extension in public_id
    const publicId = resourceType === 'raw'
      ? `anatomia/${resourceType}s/${finalName}-${uniqueSuffix}${extension}`
      : `anatomia/${resourceType}s/${finalName}-${uniqueSuffix}`

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
        type: 'upload',
        access_mode: 'public',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    const readableStream = Readable.from(buffer)
    readableStream.pipe(uploadStream)
  })
}

// Функция для сохранения файла локально
const saveFileLocally = async (buffer: Buffer, filename: string, mimetype: string): Promise<{ url: string; filename: string }> => {
  const uploadsDir = process.env.UPLOAD_PATH || './uploads'

  // Создаем директорию если не существует
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  // Генерируем уникальное имя
  const basename = filename.substring(0, filename.lastIndexOf('.')) || filename
  const extension = filename.substring(filename.lastIndexOf('.')) || ''
  const transliteratedName = slugify(basename, {
    lowercase: true,
    separator: '-'
  })
  const finalName = transliteratedName && transliteratedName.length > 2
    ? transliteratedName
    : 'file'
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  const uniqueFilename = `${finalName}-${uniqueSuffix}${extension}`

  const filePath = path.join(uploadsDir, uniqueFilename)

  // Сохраняем файл
  fs.writeFileSync(filePath, buffer)

  // Генерируем URL
  const fileUrl = `/uploads/${uniqueFilename}`

  console.log('[Upload] File saved locally:', filePath)

  return {
    url: fileUrl,
    filename: uniqueFilename
  }
}

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'Файл не был предоставлен' } })
    }

    // Все файлы сохраняем локально
    console.log('[Upload] Saving file locally:', req.file.originalname)
    const localResult = await saveFileLocally(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
    const fileUrl = localResult.url
    const storedFilename = localResult.filename

    // Сохраняем информацию в базу данных
    const media = new Media({
      filename: storedFilename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: (req as any).userId,
    })

    await media.save()

    const fileInfo = {
      url: fileUrl,
      filename: storedFilename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      message: 'Файл успешно загружен на сервер',
    }

    res.status(200).json(fileInfo)
  } catch (error: any) {
    console.error('Error uploading file:', error)

    // Проверяем, является ли ошибка ограничением размера файла
    if (error.message && error.message.includes('File size too large')) {
      const maxSizeMB = 10
      return res.status(400).json({
        error: {
          message: `Размер файла превышает лимит ${maxSizeMB} МБ. Пожалуйста, выберите файл меньшего размера.`
        }
      })
    }

    res.status(500).json({ error: { message: 'Ошибка при загрузке файла' } })
  }
}

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const media = await Media.findById(id)

    if (!media) {
      return res.status(404).json({ error: { message: 'Файл не найден' } })
    }

    // Удаляем локальный файл если URL начинается с /uploads
    if (media.url && media.url.startsWith('/uploads/')) {
      const uploadsDir = process.env.UPLOAD_PATH || './uploads'
      const filename = media.url.replace('/uploads/', '')
      const filePath = path.join(uploadsDir, filename)

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log('[Delete] Local file deleted:', filePath)
        }
      } catch (fileError) {
        console.warn('Local file delete failed:', fileError)
      }
    }

    // Удаляем из Cloudinary если это старый файл
    if (media.cloudinaryPublicId) {
      try {
        const mimetype = media.mimetype || ''
        let resourceType: 'image' | 'video' | 'raw' = 'image'
        if (mimetype.startsWith('video/')) {
          resourceType = 'video'
        } else if (!mimetype.startsWith('image/')) {
          resourceType = 'raw'
        }

        await cloudinary.uploader.destroy(media.cloudinaryPublicId, {
          resource_type: resourceType
        })
        console.log('[Delete] Cloudinary file deleted:', media.cloudinaryPublicId)
      } catch (cloudinaryError) {
        console.warn('Cloudinary delete failed:', cloudinaryError)
      }
    }

    // Удаляем запись из БД
    await Media.findByIdAndDelete(id)

    res.json({ message: `Файл ${media.originalName} успешно удален` })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении файла' } })
  }
}

export const getMediaList = async (req: Request, res: Response) => {
  try {
    const mediaFiles = await Media.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .populate('uploadedBy', 'firstName lastName email')

    res.json(mediaFiles)
  } catch (error) {
    console.error('Error fetching media list:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении списка файлов' } })
  }
}
