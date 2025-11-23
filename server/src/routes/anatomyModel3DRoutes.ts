import express from 'express'
import { getAllModels, getModelById, getModelBySlug, createModel, updateModel, deleteModel } from '../controllers/anatomyModel3DController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

router.get('/', getAllModels)
router.get('/:id', getModelById)
router.get('/slug/:slug', getModelBySlug)
router.post('/', authenticateToken, authorizeRole('admin', 'teacher'), createModel)
router.put('/:id', authenticateToken, authorizeRole('admin', 'teacher'), updateModel)
router.delete('/:id', authenticateToken, authorizeRole('admin', 'teacher'), deleteModel)

export default router
