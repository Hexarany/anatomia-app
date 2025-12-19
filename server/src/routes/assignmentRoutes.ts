import express from 'express'
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentById,
  getGroupAssignments,
  getScheduleAssignment,
  submitAssignment,
  updateSubmission,
  gradeSubmission,
  getMySubmissions,
  getAssignmentSubmissions,
  deleteSubmission,
} from '../controllers/assignmentController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// Все роуты требуют авторизации
router.use(authenticateToken)

// ============================================
// ASSIGNMENTS (Домашние задания)
// ============================================

/**
 * POST /api/assignments
 * Создать домашнее задание (teacher, admin)
 */
router.post('/', authorizeRole('teacher', 'admin'), createAssignment)

/**
 * GET /api/assignments/:id
 * Получить конкретное задание
 */
router.get('/:id', getAssignmentById)

/**
 * PUT /api/assignments/:id
 * Обновить задание (teacher, admin)
 */
router.put('/:id', authorizeRole('teacher', 'admin'), updateAssignment)

/**
 * DELETE /api/assignments/:id
 * Удалить задание (teacher, admin)
 */
router.delete('/:id', authorizeRole('teacher', 'admin'), deleteAssignment)

/**
 * GET /api/assignments/group/:groupId
 * Получить все задания группы
 */
router.get('/group/:groupId', getGroupAssignments)

/**
 * GET /api/assignments/schedule/:scheduleId
 * Получить задание для конкретного занятия
 */
router.get('/schedule/:scheduleId', getScheduleAssignment)

/**
 * GET /api/assignments/:id/submissions
 * Получить все сдачи задания (teacher, admin)
 */
router.get(
  '/:id/submissions',
  authorizeRole('teacher', 'admin'),
  getAssignmentSubmissions
)

// ============================================
// SUBMISSIONS (Сдача работ)
// ============================================

/**
 * POST /api/assignments/:id/submit
 * Сдать домашнее задание (student)
 */
router.post('/:id/submit', submitAssignment)

/**
 * GET /api/assignments/my/submissions
 * Получить все мои сданные работы (student)
 */
router.get('/my/submissions', getMySubmissions)

/**
 * PUT /api/assignments/submissions/:submissionId
 * Обновить/пересдать работу (student)
 */
router.put('/submissions/:submissionId', updateSubmission)

/**
 * POST /api/assignments/submissions/:submissionId/grade
 * Выставить оценку (teacher, admin)
 */
router.post(
  '/submissions/:submissionId/grade',
  authorizeRole('teacher', 'admin'),
  gradeSubmission
)

/**
 * DELETE /api/assignments/submissions/:submissionId
 * Удалить сдачу (teacher, admin, own student)
 */
router.delete('/submissions/:submissionId', deleteSubmission)

export default router
