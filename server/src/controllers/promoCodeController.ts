import { Response } from 'express'
import PromoCode from '../models/PromoCode'
import { CustomRequest } from '../middleware/auth'

// Получить все промокоды (только для админов)
export const getAllPromoCodes = async (req: CustomRequest, res: Response) => {
  try {
    const { active, expired } = req.query

    const query: any = {}

    if (active === 'true') {
      query.isActive = true
      query.validUntil = { $gte: new Date() }
    }

    if (expired === 'true') {
      query.validUntil = { $lt: new Date() }
    }

    const promoCodes = await PromoCode.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })

    res.json(promoCodes)
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    res.status(500).json({ error: { message: 'Error fetching promo codes' } })
  }
}

// Создать новый промокод (только для админов)
export const createPromoCode = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const {
      code,
      discountType,
      discountValue,
      maxUses,
      validFrom,
      validUntil,
      applicableTo,
      metadata,
    } = req.body

    // Валидация
    if (!code || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({
        error: { message: 'Missing required fields: code, discountType, discountValue, validUntil' },
      })
    }

    // Проверка типа скидки
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        error: { message: 'Percentage discount must be between 0 and 100' },
      })
    }

    // Проверка существования промокода
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() })
    if (existingCode) {
      return res.status(400).json({
        error: { message: 'Promo code already exists' },
      })
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses: maxUses || 1,
      validFrom: validFrom || new Date(),
      validUntil: new Date(validUntil),
      applicableTo: applicableTo || {},
      metadata: metadata || {},
      createdBy: userId,
    })

    const savedPromoCode = await promoCode.save()

    res.status(201).json({
      message: 'Promo code created successfully',
      promoCode: savedPromoCode,
    })
  } catch (error: any) {
    console.error('Error creating promo code:', error)
    res.status(500).json({ error: { message: 'Error creating promo code', details: error.message } })
  }
}

// Проверить валидность промокода
export const validatePromoCode = async (req: CustomRequest, res: Response) => {
  try {
    const { code } = req.params
    const { tier } = req.query
    const userId = req.userId

    if (!code) {
      return res.status(400).json({ error: { message: 'Promo code is required' } })
    }

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() })

    if (!promoCode) {
      return res.status(404).json({ error: { message: 'Promo code not found' } })
    }

    const validation = promoCode.isValid(userId, tier as string)

    if (!validation.valid) {
      return res.status(400).json({
        valid: false,
        error: { message: validation.message },
      })
    }

    res.json({
      valid: true,
      promoCode: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        validUntil: promoCode.validUntil,
        metadata: promoCode.metadata,
      },
    })
  } catch (error) {
    console.error('Error validating promo code:', error)
    res.status(500).json({ error: { message: 'Error validating promo code' } })
  }
}

// Применить промокод (используется при оплате)
export const applyPromoCode = async (req: CustomRequest, res: Response) => {
  try {
    const { code, originalPrice, tier } = req.body
    const userId = req.userId

    if (!code || !originalPrice) {
      return res.status(400).json({
        error: { message: 'Missing required fields: code, originalPrice' },
      })
    }

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() })

    if (!promoCode) {
      return res.status(404).json({ error: { message: 'Promo code not found' } })
    }

    const validation = promoCode.isValid(userId, tier)

    if (!validation.valid) {
      return res.status(400).json({
        error: { message: validation.message },
      })
    }

    // Рассчитываем скидку
    const discount = promoCode.calculateDiscount(originalPrice)
    const finalPrice = originalPrice - discount

    // Применяем промокод (увеличиваем счетчик использований)
    await promoCode.apply(userId!)

    res.json({
      success: true,
      originalPrice,
      discount,
      finalPrice,
      promoCode: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
      },
    })
  } catch (error: any) {
    console.error('Error applying promo code:', error)
    res.status(500).json({ error: { message: 'Error applying promo code', details: error.message } })
  }
}

// Обновить промокод (только для админов)
export const updatePromoCode = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Запретить изменение некоторых полей
    delete updates.currentUses
    delete updates.usedBy
    delete updates.createdBy

    const promoCode = await PromoCode.findByIdAndUpdate(id, updates, { new: true })

    if (!promoCode) {
      return res.status(404).json({ error: { message: 'Promo code not found' } })
    }

    res.json({
      message: 'Promo code updated successfully',
      promoCode,
    })
  } catch (error) {
    console.error('Error updating promo code:', error)
    res.status(500).json({ error: { message: 'Error updating promo code' } })
  }
}

// Удалить промокод (только для админов)
export const deletePromoCode = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params

    const promoCode = await PromoCode.findByIdAndDelete(id)

    if (!promoCode) {
      return res.status(404).json({ error: { message: 'Promo code not found' } })
    }

    res.json({ message: 'Promo code deleted successfully' })
  } catch (error) {
    console.error('Error deleting promo code:', error)
    res.status(500).json({ error: { message: 'Error deleting promo code' } })
  }
}

// Получить статистику использования промокода
export const getPromoCodeStats = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params

    const promoCode = await PromoCode.findById(id).populate('usedBy.userId', 'firstName lastName email')

    if (!promoCode) {
      return res.status(404).json({ error: { message: 'Promo code not found' } })
    }

    const stats = {
      code: promoCode.code,
      totalUses: promoCode.currentUses,
      maxUses: promoCode.maxUses,
      remainingUses: promoCode.maxUses - promoCode.currentUses,
      usageRate: (promoCode.currentUses / promoCode.maxUses) * 100,
      isActive: promoCode.isActive,
      validFrom: promoCode.validFrom,
      validUntil: promoCode.validUntil,
      usageHistory: promoCode.usedBy,
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching promo code stats:', error)
    res.status(500).json({ error: { message: 'Error fetching promo code stats' } })
  }
}
