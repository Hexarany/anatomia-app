import { Request, Response } from 'express'
import { getTierPlanById } from '../config/tier-plans'
import { createPayPalOrder, capturePayPalPayment } from '../services/paypalService'
import User from '../models/User'
import PromoCode, { IPromoCode } from '../models/PromoCode'

// POST /api/tier-payment/create-order - Create PayPal order for tier purchase
export const createTierOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { tierId, promoCode } = req.body // 'basic' or 'premium', optional promo code

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
    let originalPrice = plan.price
    let isUpgrade = false
    const currentTier = user.accessLevel || 'free'
    const planTierLevel = plan.tierLevel // 'basic' or 'premium'

    // Check if upgrade from basic to premium
    if (planTierLevel === 'premium' && currentTier === 'basic') {
      // Upgrade from basic to premium
      originalPrice = plan.upgradeFromBasic || plan.price
      isUpgrade = true
    } else if (currentTier === 'premium' && planTierLevel === 'premium') {
      // Already premium, can extend/renew but not upgrade
      isUpgrade = false
    } else if (currentTier === planTierLevel && currentTier !== 'free') {
      // Same tier, this is renewal/extension
      isUpgrade = false
    }

    // Handle promo code if provided
    let discount = 0
    let appliedPromoCode = null
    let finalPrice = originalPrice

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() }) as IPromoCode | null

      if (promo) {
        const validation = promo.isValid(userId, tierId)

        if (validation.valid) {
          discount = promo.calculateDiscount(originalPrice)
          finalPrice = originalPrice - discount
          appliedPromoCode = {
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            _id: (promo._id as any).toString(),
          }
        } else {
          // Promo code invalid, but continue without it
          console.log(`Invalid promo code: ${validation.message}`)
        }
      }
    }

    // Create PayPal order with final price
    const description = isUpgrade ? `Обновление до ${plan.name.ru}` : plan.name.ru

    const order = await createPayPalOrder(finalPrice, plan.currency, description, tierId)

    res.json({
      orderId: order.id,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
      order,
      originalPrice,
      discount,
      finalPrice,
      isUpgrade,
      appliedPromoCode,
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
    const { orderId, tierId, promoCodeId } = req.body

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

    // Apply promo code if provided
    if (promoCodeId) {
      try {
        const promoCode = await PromoCode.findById(promoCodeId) as IPromoCode | null
        if (promoCode) {
          await promoCode.apply(userId)
          console.log(`Applied promo code ${promoCode.code} for user ${userId}`)
        }
      } catch (error) {
        console.error('Error applying promo code:', error)
        // Continue with payment completion even if promo code application fails
      }
    }

    // Calculate subscription end date based on plan duration
    const now = new Date()
    const subscriptionEndsAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000)

    // Record payment in history
    const fromTier = user.accessLevel || 'free'
    if (!user.paymentHistory) {
      user.paymentHistory = []
    }

    user.paymentHistory.push({
      amount: paidAmount,
      fromTier: fromTier,
      toTier: plan.tierLevel, // Use tierLevel (basic/premium) not plan ID
      paymentMethod: 'paypal',
      paypalOrderId: orderId,
      paypalPayerId: payerId,
      date: new Date(),
    } as any)

    // Update user tier and subscription end date
    user.accessLevel = plan.tierLevel // Set to 'basic' or 'premium'
    user.subscriptionEndsAt = subscriptionEndsAt
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
        subscriptionEndsAt: user.subscriptionEndsAt,
        paymentAmount: user.paymentAmount,
      },
      paymentDetails: {
        orderId: captureData.id,
        paymentId: paymentDetails.id,
        amount: paymentDetails.amount.value,
        currency: paymentDetails.amount.currency_code,
        status: captureData.status,
      },
      subscription: {
        tier: plan.tierLevel,
        duration: plan.duration,
        endsAt: subscriptionEndsAt,
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
