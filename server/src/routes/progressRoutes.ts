import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { requireTier } from '../middleware/tierAccess'
import {
  getProgress,
  markTopicComplete,
  markProtocolViewed,
  markGuidelineViewed,
  mark3DModelViewed,
  markTriggerPointViewed,
  saveQuizResult,
} from '../controllers/progressController'

const router = express.Router()

// Все роуты требуют авторизации
router.get('/progress', authenticateToken, getProgress)
router.post('/progress/topic/complete', authenticateToken, markTopicComplete)
router.post('/progress/protocol/viewed', authenticateToken, markProtocolViewed)
router.post('/progress/guideline/viewed', authenticateToken, markGuidelineViewed)
router.post('/progress/3d-model/viewed', authenticateToken, mark3DModelViewed)
router.post('/progress/trigger-point/viewed', authenticateToken, markTriggerPointViewed)
router.post('/progress/quiz/result', authenticateToken, requireTier('premium'), saveQuizResult)

export default router
