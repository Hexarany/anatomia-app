import express from 'express'
import { activateTrial, getTrialStatus } from '../controllers/trialController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Activate trial (requires authentication)
router.post('/activate', authenticateToken, activateTrial)

// Get trial status (requires authentication)
router.get('/status', authenticateToken, getTrialStatus)

export default router
