import express from 'express'
import {
  getAllQuizzes,
  getQuizById,
  getQuizzesByTopic,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '../controllers/quizController'

const router = express.Router()

router.get('/', getAllQuizzes)
router.get('/:id', getQuizById)
router.get('/topic/:topicId', getQuizzesByTopic)
router.post('/', createQuiz)
router.put('/:id', updateQuiz)
router.delete('/:id', deleteQuiz)

export default router
