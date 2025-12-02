import express from 'express'
import { getAllModels, getModelById, getModelBySlug, createModel, updateModel, deleteModel } from '../controllers/anatomyModel3DController'
import { authenticateToken, authorizeRole, optionalAuth } from '../middleware/auth'

const router = express.Router()

router.get('/', optionalAuth, getAllModels)
router.get('/:id', optionalAuth, getModelById)
router.get('/slug/:slug', optionalAuth, getModelBySlug)
router.post('/', authenticateToken, authorizeRole('admin', 'teacher'), createModel)
router.put('/:id', authenticateToken, authorizeRole('admin', 'teacher'), updateModel)
router.delete('/:id', authenticateToken, authorizeRole('admin', 'teacher'), deleteModel)

export default router
