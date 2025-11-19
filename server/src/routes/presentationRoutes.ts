import express from 'express'
import {
  getPresentations,
  getPresentationById,
  createPresentation,
  updatePresentation,
  deletePresentation,
  downloadPresentation,
} from '../controllers/presentationController'
import { protect, restrictTo } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = express.Router()

// Публичные роуты (доступны всем аутентифицированным пользователям)
router.get('/', protect, getPresentations)
router.get('/:id', protect, getPresentationById)
router.get('/:id/download', protect, downloadPresentation)

// Защищенные роуты (только для админов и учителей)
router.post('/', protect, restrictTo('admin', 'teacher'), upload.single('file'), createPresentation)
router.put('/:id', protect, restrictTo('admin', 'teacher'), upload.single('file'), updatePresentation)
router.delete('/:id', protect, restrictTo('admin', 'teacher'), deletePresentation)

export default router
