// server/src/routes/mediaRoutes.ts
import express from 'express'
import { upload, uploadMedia, deleteMedia, getMediaList } from '../controllers/mediaController'
import { authenticateToken, authorizeRole } from '../middleware/auth'
import multer from 'multer'

const router = express.Router()

// Middleware для обработки ошибок multer
const handleMulterError = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          message: 'Размер файла превышает лимит 10 МБ. Пожалуйста, выберите файл меньшего размера.'
        }
      })
    }
    return res.status(400).json({
      error: {
        message: `Ошибка загрузки: ${err.message}`
      }
    })
  }

  if (err) {
    return res.status(400).json({
      error: {
        message: err.message || 'Ошибка при загрузке файла'
      }
    })
  }

  next()
}

// ADMIN ONLY: Защищенный маршрут для загрузки
router.post(
  '/upload',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('file'), // 'file' - имя поля в FormData
  handleMulterError,
  uploadMedia
)

// ADMIN ONLY: Защищенный маршрут для получения списка файлов
router.get('/list', authenticateToken, authorizeRole('admin'), getMediaList)

// ADMIN ONLY: Защищенный маршрут для удаления (по ID)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteMedia)

export default router