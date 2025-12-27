import express from 'express'
import {
  createMAIBTransaction,
  completeMAIBTransaction,
  checkMAIBTransaction,
} from '../controllers/maibPaymentController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Create MAIB transaction for tier purchase
router.post('/create-transaction', authenticateToken, createMAIBTransaction)

// Complete MAIB payment after user pays
router.post('/complete-transaction', authenticateToken, completeMAIBTransaction)

// Check transaction status
router.get('/check-transaction/:transactionId', authenticateToken, checkMAIBTransaction)

export default router
