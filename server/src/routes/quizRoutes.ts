// server/src/routes/quizRoutes.ts
import express from 'express'
import {
  getAllQuizzes,
  getQuizById,
  getQuizzesByTopic,
  createQuiz, // НОВЫЙ
  updateQuiz, // НОВЫЙ
  deleteQuiz, // НОВЫЙ
} from '../controllers/quizController'
import { authenticateToken, authorizeRole } from '../middleware/auth'
import { requireTier } from '../middleware/tierAccess'

const router = express.Router()

// PREMIUM ACCESS: Чтение викторин
router.get('/', authenticateToken, requireTier('premium'), getAllQuizzes)
router.get('/topic/:topicId', authenticateToken, requireTier('premium'), getQuizzesByTopic)
router.get('/:id', authenticateToken, requireTier('premium'), getQuizById)

// ADMIN ONLY: CRUD для викторин
router.post('/', authenticateToken, authorizeRole('admin'), createQuiz)
router.put('/:id', authenticateToken, authorizeRole('admin'), updateQuiz)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteQuiz)

export default router
