import express from 'express'
import { body } from 'express-validator'
import {
  createTierOrder,
  captureTierOrder,
  getTierPlans,
} from '../controllers/tierPaymentController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// GET /api/tier-payment/plans - Get available tier plans (public)
router.get('/plans', getTierPlans)

// POST /api/tier-payment/create-order - Create PayPal order for tier purchase (requires auth)
router.post(
  '/create-order',
  [
    authenticateToken,
    body('tierId')
      .isIn(['basic', 'premium'])
      .withMessage('Недопустимый тариф. Доступны: basic, premium'),
  ],
  createTierOrder
)

// POST /api/tier-payment/capture-order - Complete tier purchase (requires auth)
router.post(
  '/capture-order',
  [
    authenticateToken,
    body('orderId').notEmpty().withMessage('Order ID обязателен'),
    body('tierId')
      .isIn(['basic', 'premium'])
      .withMessage('Недопустимый тариф. Доступны: basic, premium'),
  ],
  captureTierOrder
)

export default router
