import { Request, Response } from 'express'
import { getTierPlanById } from '../config/tier-plans'
import { createPayPalOrder, capturePayPalPayment } from '../services/paypalService'
import User from '../models/User'

// POST /api/tier-payment/create-order - Create PayPal order for tier purchase
export const createTierOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { tierId } = req.body // 'basic' or 'premium'

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Validate tier
    const plan = getTierPlanById(tierId)
    if (!plan) {
      return res.status(400).json({ message: 'Недопустимый тариф' })
    }

    // Check if user is trying to upgrade
    let price = plan.price
    let isUpgrade = false
    const currentTier = user.accessLevel || 'free'

    if (tierId === 'premium' && currentTier === 'basic') {
      // Upgrade from basic to premium
      price = plan.upgradeFromBasic || 30
      isUpgrade = true
    } else if (currentTier === 'premium') {
      return res.status(400).json({ message: 'У вас уже есть премиум доступ' })
    } else if (currentTier === tierId) {
      return res.status(400).json({ message: 'У вас уже есть этот уровень доступа' })
    }

    // Create PayPal order
    const description = isUpgrade ? `Обновление до ${plan.name.ru}` : plan.name.ru

    const order = await createPayPalOrder(price, plan.currency, description, tierId)

    res.json({
      orderId: order.id,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
      order,
      price,
      isUpgrade,
    })
  } catch (error: any) {
    console.error('Error creating tier order:', error)

    // Provide more detailed error message
    let errorMessage = 'Ошибка при создании заказа'
    if (error.message.includes('PayPal')) {
      errorMessage = 'Ошибка PayPal. Проверьте конфигурацию API.'
    }

    res.status(500).json({
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

// POST /api/tier-payment/capture-order - Complete tier purchase
export const captureTierOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { orderId, tierId } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    const plan = getTierPlanById(tierId)
    if (!plan) {
      return res.status(400).json({ message: 'Недопустимый тариф' })
    }

    // Capture PayPal payment
    const captureData = await capturePayPalPayment(orderId)

    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({
        message: 'Платеж не завершен',
        status: captureData.status,
      })
    }

    const paymentDetails = captureData.purchase_units[0].payments.captures[0]
    const payerId = captureData.payer.payer_id

    // Calculate actual amount paid
    const paidAmount = parseFloat(paymentDetails.amount.value)

    // Record payment in history
    const fromTier = user.accessLevel || 'free'
    if (!user.paymentHistory) {
      user.paymentHistory = []
    }

    user.paymentHistory.push({
      amount: paidAmount,
      fromTier: fromTier,
      toTier: tierId,
      paymentMethod: 'paypal',
      paypalOrderId: orderId,
      paypalPayerId: payerId,
      date: new Date(),
    } as any)

    // Update user tier
    user.accessLevel = tierId
    user.paymentAmount = (user.paymentAmount || 0) + paidAmount
    user.paymentDate = new Date()

    await user.save()

    res.json({
      message: 'Доступ успешно обновлен',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessLevel: user.accessLevel,
        paymentAmount: user.paymentAmount,
      },
      paymentDetails: {
        orderId: captureData.id,
        paymentId: paymentDetails.id,
        amount: paymentDetails.amount.value,
        currency: paymentDetails.amount.currency_code,
        status: captureData.status,
      },
    })
  } catch (error: any) {
    console.error('Error capturing tier payment:', error)
    res.status(500).json({
      message: 'Ошибка при завершении платежа',
      error: error.message,
    })
  }
}

// GET /api/tier-payment/plans - Get available tier plans
export const getTierPlans = async (req: Request, res: Response) => {
  try {
    const { TIER_PLANS } = await import('../config/tier-plans')

    res.json({ plans: TIER_PLANS })
  } catch (error) {
    console.error('Error fetching tier plans:', error)
    res.status(500).json({ message: 'Ошибка при получении тарифов' })
  }
}
