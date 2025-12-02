import express from 'express'
import {
  getTriggerPoints,
  getTriggerPointById,
  getTriggerPointBySlug,
  createTriggerPoint,
  updateTriggerPoint,
  deleteTriggerPoint,
} from '../controllers/triggerPointController'
import { authenticateToken, authorizeRole, optionalAuth } from '../middleware/auth'

const router = express.Router()

// Публичные маршруты
router.get('/', optionalAuth, getTriggerPoints)
router.get('/:id', optionalAuth, getTriggerPointById)
router.get('/slug/:slug', optionalAuth, getTriggerPointBySlug)

// ADMIN маршруты
router.post('/', authenticateToken, authorizeRole('admin'), createTriggerPoint)
router.put('/:id', authenticateToken, authorizeRole('admin'), updateTriggerPoint)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteTriggerPoint)

export default router
