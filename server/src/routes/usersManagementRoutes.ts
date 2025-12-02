import express from 'express'
import { body } from 'express-validator'
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from '../controllers/usersManagementController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication and admin role
router.use(authenticateToken)
router.use(authorizeRole('admin'))

// GET /api/users-management/stats - Get user statistics
router.get('/stats', getUserStats)

// GET /api/users-management - Get all users with filtering
router.get('/', getAllUsers)

// GET /api/users-management/:id - Get single user by ID
router.get('/:id', getUserById)

// PUT /api/users-management/:id - Update user
router.put(
  '/:id',
  [
    body('firstName').optional().trim().isLength({ min: 2 }).withMessage('Имя слишком короткое'),
    body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Фамилия слишком короткая'),
    body('role')
      .optional()
      .isIn(['student', 'teacher', 'admin'])
      .withMessage('Недопустимая роль'),
    body('accessLevel')
      .optional()
      .isIn(['free', 'basic', 'premium'])
      .withMessage('Недопустимый уровень доступа'),
    body('paymentAmount').optional().isNumeric().withMessage('Сумма должна быть числом'),
  ],
  updateUser
)

// DELETE /api/users-management/:id - Delete user
router.delete('/:id', deleteUser)

export default router
