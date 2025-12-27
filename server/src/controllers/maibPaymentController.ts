import { Request, Response } from 'express'
import { getTierPlanById } from '../config/tier-plans'
import { registerSMSTransaction, getTransactionResult, getPaymentPageURL } from '../services/maibService'
import User from '../models/User'
import PromoCode, { IPromoCode } from '../models/PromoCode'

// POST /api/maib-payment/create-transaction - Create MAIB transaction for tier purchase
export const createMAIBTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { tierId, promoCode } = req.body
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1'

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
    const planTierLevel = plan.tierLevel

    // Check if upgrade from basic to premium
    if (planTierLevel === 'premium' && currentTier === 'basic') {
      originalPrice = plan.upgradeFromBasic || plan.price
      isUpgrade = true
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
        }
      }
    }

    // Create MAIB transaction
    const description = isUpgrade
      ? `Upgrade to ${plan.name.ru}`
      : `${plan.name.ru} subscription`

    const transaction = await registerSMSTransaction(
      finalPrice,
      plan.currency,
      description,
      clientIp
    )

    if (!transaction.TRANSACTION_ID) {
      throw new Error('Failed to create MAIB transaction')
    }

    // Get payment page URL
    const paymentUrl = getPaymentPageURL(transaction.TRANSACTION_ID)

    res.json({
      transactionId: transaction.TRANSACTION_ID,
      paymentUrl,
      originalPrice,
      discount,
      finalPrice,
      isUpgrade,
      appliedPromoCode,
      tierId,
    })
  } catch (error: any) {
    console.error('❌ Error creating MAIB transaction:', error)

    res.status(500).json({
      message: 'Ошибка при создании транзакции MAIB',
      error: error.message,
    })
  }
}

// POST /api/maib-payment/complete-transaction - Complete MAIB payment
export const completeMAIBTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { transactionId, tierId, promoCodeId } = req.body
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1'

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

    // Get transaction result
    const transactionResult = await getTransactionResult(transactionId, clientIp)

    // Check if payment was successful
    // RESULT: OK means successful
    // RESULT_CODE: 000 means approved
    if (transactionResult.RESULT !== 'OK' || transactionResult.RESULT_CODE !== '000') {
      return res.status(400).json({
        message: 'Платеж не завершен',
        result: transactionResult.RESULT,
        resultCode: transactionResult.RESULT_CODE,
      })
    }

    // Get paid amount from transaction
    const paidAmount = parseFloat(transactionResult.AMOUNT || '0') / 100 // Convert from cents

    // Apply promo code if provided
    if (promoCodeId) {
      try {
        const promoCode = await PromoCode.findById(promoCodeId) as IPromoCode | null
        if (promoCode) {
          await promoCode.apply(userId)
          console.log(`✅ Applied promo code ${promoCode.code} for user ${userId}`)
        }
      } catch (error) {
        console.error('❌ Error applying promo code:', error)
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
      toTier: plan.tierLevel,
      paymentMethod: 'maib',
      date: new Date(),
    } as any)

    // Update user tier and subscription end date
    user.accessLevel = plan.tierLevel
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
        transactionId: transactionResult.TRANSACTION_ID,
        amount: paidAmount,
        currency: plan.currency,
        result: transactionResult.RESULT,
        resultCode: transactionResult.RESULT_CODE,
      },
      subscription: {
        tier: plan.tierLevel,
        duration: plan.duration,
        endsAt: subscriptionEndsAt,
      },
    })
  } catch (error: any) {
    console.error('❌ Error completing MAIB transaction:', error)
    res.status(500).json({
      message: 'Ошибка при завершении платежа MAIB',
      error: error.message,
    })
  }
}

// GET /api/maib-payment/check-transaction/:transactionId - Check transaction status
export const checkMAIBTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1'

    const transactionResult = await getTransactionResult(transactionId, clientIp)

    res.json({
      transactionId,
      result: transactionResult.RESULT,
      resultCode: transactionResult.RESULT_CODE,
      amount: parseFloat(transactionResult.AMOUNT || '0') / 100,
      currency: transactionResult.CURRENCY,
      details: transactionResult,
    })
  } catch (error: any) {
    console.error('❌ Error checking MAIB transaction:', error)
    res.status(500).json({
      message: 'Ошибка при проверке транзакции MAIB',
      error: error.message,
    })
  }
}
