import express from 'express'
import {
  getAllMassageProtocols,
  getMassageProtocolById,
  createMassageProtocol,
  updateMassageProtocol,
  deleteMassageProtocol,
  addImageToProtocol,
  removeImageFromProtocol,
  updateImageCaption,
  addVideoToProtocol,
  removeVideoFromProtocol,
  updateVideoCaption,
} from '../controllers/massageProtocolController'
import { authenticateToken, authorizeRole, optionalAuth } from '../middleware/auth'

const router = express.Router()

// PUBLIC: Чтение протоколов (логика блокировки внутри контроллера)
router.get('/', optionalAuth, getAllMassageProtocols)
router.get('/:id', optionalAuth, getMassageProtocolById)

// ADMIN ONLY: Создание, обновление, удаление
router.post('/', authenticateToken, authorizeRole('admin'), createMassageProtocol)
router.put('/:id', authenticateToken, authorizeRole('admin'), updateMassageProtocol)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteMassageProtocol)

// ADMIN ONLY: Управление изображениями
router.post('/:protocolId/images', authenticateToken, authorizeRole('admin'), addImageToProtocol)
router.delete('/:protocolId/images/:imageId', authenticateToken, authorizeRole('admin'), removeImageFromProtocol)
router.put('/:protocolId/images/:imageId', authenticateToken, authorizeRole('admin'), updateImageCaption)

// ADMIN ONLY: Управление видео
router.post('/:protocolId/videos', authenticateToken, authorizeRole('admin'), addVideoToProtocol)
router.delete('/:protocolId/videos/:videoId', authenticateToken, authorizeRole('admin'), removeVideoFromProtocol)
router.put('/:protocolId/videos/:videoId', authenticateToken, authorizeRole('admin'), updateVideoCaption)

export default router
