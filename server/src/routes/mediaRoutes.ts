// server/src/routes/mediaRoutes.ts
import express from 'express'
import { upload, uploadMedia, deleteMedia, getMediaList } from '../controllers/mediaController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// ADMIN ONLY: Защищенный маршрут для загрузки
router.post(
  '/upload',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('file'), // 'file' - имя поля в FormData
  uploadMedia
)

// ADMIN ONLY: Защищенный маршрут для получения списка файлов
router.get('/list', authenticateToken, authorizeRole('admin'), getMediaList)

// ADMIN ONLY: Защищенный маршрут для удаления (по ID)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteMedia)

export default router