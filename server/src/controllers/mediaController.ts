import { Request, Response } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import { slugify } from 'transliteration'
import Media from '../models/Media'

// Используем multer для временного хранения в памяти
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB лимит
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
      'application/octet-stream'
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
    } else if (mimetype === 'model/gltf-binary' || filename.endsWith('.glb')) {
      resourceType = 'raw'
    }

    // Генерируем уникальное имя
    const basename = filename.substring(0, filename.lastIndexOf('.')) || filename
    const transliteratedName = slugify(basename, {
      lowercase: true,
      separator: '-'
    })
    const finalName = transliteratedName && transliteratedName.length > 2
      ? transliteratedName
      : 'file'
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const publicId = `anatomia/${resourceType}s/${finalName}-${uniqueSuffix}`

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
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

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'Файл не был предоставлен' } })
    }

    // Загружаем в Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )

    // Сохраняем информацию в базу данных
    const media = new Media({
      filename: result.public_id,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: result.secure_url,
      uploadedBy: (req as any).userId,
      cloudinaryPublicId: result.public_id,
    })

    await media.save()

    const fileInfo = {
      url: result.secure_url,
      filename: result.public_id,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      message: 'Файл успешно загружен в Cloudinary',
    }

    res.status(200).json(fileInfo)
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error)
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

    // Определяем тип ресурса для удаления
    let resourceType: 'image' | 'video' | 'raw' = 'image'
    if (media.mimetype.startsWith('video/')) {
      resourceType = 'video'
    } else if (media.mimetype === 'model/gltf-binary' || media.originalName.endsWith('.glb')) {
      resourceType = 'raw'
    }

    // Удаляем из Cloudinary
    if (media.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(media.cloudinaryPublicId, {
        resource_type: resourceType
      })
    }

    // Удаляем запись из БД
    await Media.findByIdAndDelete(id)

    res.json({ message: `Файл ${media.originalName} успешно удален` })
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении файла' } })
  }
}

export const getMediaList = async (req: Request, res: Response) => {
  try {
    const mediaFiles = await Media.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .populate('uploadedBy', 'name email')

    res.json(mediaFiles)
  } catch (error) {
    console.error('Error fetching media list:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении списка файлов' } })
  }
}
