import express from 'express'
import {
  getAllGuidelines,
  getGuidelineById,
  createGuideline,
  updateGuideline,
  deleteGuideline,
  addImageToGuideline,
  removeImageFromGuideline,
} from '../controllers/hygieneGuidelineController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Публичные маршруты
router.get('/', getAllGuidelines)
router.get('/:id', getGuidelineById)

// Защищенные маршруты (admin/teacher)
router.post('/', authenticateToken, authorizeRole('admin', 'teacher'), createGuideline)
router.put('/:id', authenticateToken, authorizeRole('admin', 'teacher'), updateGuideline)
router.delete('/:id', authenticateToken, authorizeRole('admin', 'teacher'), deleteGuideline)

// Управление изображениями
router.post('/:id/images', authenticateToken, authorizeRole('admin', 'teacher'), addImageToGuideline)
router.delete('/:id/images/:imageId', authenticateToken, authorizeRole('admin', 'teacher'), removeImageFromGuideline)

export default router
