import express from 'express'
import {
  getGroupSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  generateCourseSchedule,
} from '../controllers/scheduleController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Все роуты требуют авторизации
router.use(authenticateToken)

/**
 * GET /api/schedule/group/:groupId
 * Получить расписание группы (все пользователи группы)
 */
router.get('/group/:groupId', getGroupSchedule)

/**
 * GET /api/schedule/:id
 * Получить конкретное занятие
 */
router.get('/:id', getScheduleById)

/**
 * POST /api/schedule
 * Создать занятие (teacher, admin)
 */
router.post('/', authorizeRole('teacher', 'admin'), createSchedule)

/**
 * POST /api/schedule/generate
 * Автоматически создать расписание для курса (teacher, admin)
 */
router.post(
  '/generate',
  authorizeRole('teacher', 'admin'),
  generateCourseSchedule
)

/**
 * PUT /api/schedule/:id
 * Обновить занятие (teacher, admin)
 */
router.put('/:id', authorizeRole('teacher', 'admin'), updateSchedule)

/**
 * DELETE /api/schedule/:id
 * Удалить занятие (teacher, admin)
 */
router.delete('/:id', authorizeRole('teacher', 'admin'), deleteSchedule)

export default router
