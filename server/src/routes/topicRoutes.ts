import express from 'express'
import {
  getAllTopics,
  getTopicById,
  getTopicsByCategory,
  createTopic,
  updateTopic,
  deleteTopic,
  addImageToTopic,
  removeImageFromTopic,
  updateImageCaption,
} from '../controllers/topicController'
import { authenticateToken, authorizeRole, optionalAuth } from '../middleware/auth'

const router = express.Router()

// PUBLIC: Чтение тем (логика блокировки внутри контроллера)
// optionalAuth - позволяет получить userRole если пользователь залогинен
router.get('/', optionalAuth, getAllTopics)
router.get('/:id', optionalAuth, getTopicById) // Теперь поддерживает ID ИЛИ SLUG
router.get('/category/:categoryId', optionalAuth, getTopicsByCategory)

// ADMIN ONLY: Создание, обновление, удаление
router.post('/', authenticateToken, authorizeRole('admin'), createTopic)
router.put('/:id', authenticateToken, authorizeRole('admin'), updateTopic)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteTopic)

// ADMIN ONLY: Управление иллюстрациями
router.post('/:topicId/images', authenticateToken, authorizeRole('admin'), addImageToTopic)
router.delete('/:topicId/images/:imageId', authenticateToken, authorizeRole('admin'), removeImageFromTopic)
router.put('/:topicId/images/:imageId', authenticateToken, authorizeRole('admin'), updateImageCaption)

export default router