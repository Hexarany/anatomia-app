import express from 'express'
import { body } from 'express-validator'
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getUsersByRole,
  sendEmailToUser,
  sendBulkEmail,
} from '../controllers/usersManagementController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// GET /api/users-management/by-role/:role - Get users by role (admin and teacher)
// This route is before the admin-only middleware so teachers can access it
router.get('/by-role/:role', authenticateToken, authorizeRole('admin', 'teacher'), getUsersByRole)

// All routes below require authentication and admin role
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
    body('paymentDate')
      .optional({ checkFalsy: true, nullable: true })
      .isISO8601()
      .withMessage('Некорректная дата'),
    body('subscriptionStatus')
      .optional()
      .isIn(['none', 'active', 'trial', 'expired', 'cancelled'])
      .withMessage('Некорректный статус'),
    body('subscriptionEndDate')
      .optional({ checkFalsy: true, nullable: true })
      .isISO8601()
      .withMessage('Некорректная дата'),
  ],
  updateUser
)

// DELETE /api/users-management/:id - Delete user
router.delete('/:id', deleteUser)

// POST /api/users-management/send-email - Send email to single user
router.post(
  '/send-email',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('language').optional().isIn(['ru', 'ro']).withMessage('Language must be ru or ro'),
  ],
  sendEmailToUser
)

// POST /api/users-management/send-bulk-email - Send email to multiple users
router.post(
  '/send-bulk-email',
  [
    body('userIds').isArray({ min: 1 }).withMessage('userIds must be a non-empty array'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('language').optional().isIn(['ru', 'ro']).withMessage('Language must be ru or ro'),
  ],
  sendBulkEmail
)

export default router
