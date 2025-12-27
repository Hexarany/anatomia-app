import express from 'express'
import {
  getInstructorProfile,
  getInstructorProfileForAdmin,
  createOrUpdateInstructorProfile,
  deleteInstructorProfile,
} from '../controllers/instructorProfileController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// Public route - get active instructor profile
router.get('/', getInstructorProfile)

// Admin routes - require authentication and admin/teacher role
router.get('/admin', authenticateToken, requireRole(['admin', 'teacher']), getInstructorProfileForAdmin)
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), createOrUpdateInstructorProfile)
router.delete('/', authenticateToken, requireRole(['admin']), deleteInstructorProfile)

export default router
