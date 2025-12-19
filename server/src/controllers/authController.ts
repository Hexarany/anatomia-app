import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import crypto from 'crypto'
import User from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRES_IN = '7d' // Токен действителен 7 дней

// Регистрация нового пользователя
export const register = async (req: Request, res: Response) => {
  try {
    // Проверка валидации
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, firstName, lastName, role } = req.body

    // Проверка, существует ли уже пользователь с таким email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }

    // Хеширование пароля
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Создание нового пользователя
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'student', // По умолчанию роль студента
      accessLevel: 'free', // По умолчанию бесплатный доступ
    })

    await user.save()

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Отправка ответа (без пароля)
    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessLevel: user.accessLevel,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Ошибка сервера при регистрации' })
  }
}

// Вход пользователя
export const login = async (req: Request, res: Response) => {
  try {
    // Проверка валидации
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Поиск пользователя по email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Отправка ответа (без пароля)
    res.status(200).json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessLevel: user.accessLevel,
        paymentAmount: user.paymentAmount,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Ошибка сервера при входе' })
  }
}

// Получение профиля текущего пользователя (требует авторизации)
export const getProfile = async (req: Request, res: Response) => {
  try {
    // userId добавляется в req через auth middleware
    const userId = (req as any).userId

    const user = await User.findById(userId).select('-password') // Не возвращаем пароль

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessLevel: user.accessLevel,
        paymentAmount: user.paymentAmount,
        paymentDate: user.paymentDate,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Ошибка сервера при получении профиля' })
  }
}

// Обновление профиля пользователя
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { firstName, lastName } = req.body

    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.status(200).json({
      message: 'Профиль обновлен',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessLevel: user.accessLevel,
        paymentAmount: user.paymentAmount,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Ошибка сервера при обновлении профиля' })
  }
}

// Верификация Telegram WebApp initData
function verifyTelegramWebAppData(initData: string, botToken: string): any {
  try {
    // Parse initData
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')

    // Create data-check-string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Calculate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    // Verify hash
    if (calculatedHash !== hash) {
      return null
    }

    // Check auth_date (not older than 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0')
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - authDate > 86400) {
      return null
    }

    // Parse user data
    const userJson = params.get('user')
    if (!userJson) {
      return null
    }

    return JSON.parse(userJson)
  } catch (error) {
    console.error('Telegram verification error:', error)
    return null
  }
}

// Авторизация через Telegram
export const telegramAuth = async (req: Request, res: Response) => {
  try {
    const { initData } = req.body

    if (!initData) {
      return res.status(400).json({ message: 'initData is required' })
    }

    // Verify initData
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return res.status(500).json({ message: 'Bot token not configured' })
    }

    const telegramUser = verifyTelegramWebAppData(initData, botToken)
    if (!telegramUser) {
      return res.status(401).json({ message: 'Invalid Telegram data' })
    }

    // Find or create user
    let user = await User.findOne({ telegramId: telegramUser.id.toString() })

    if (!user) {
      // Create new user
      user = new User({
        telegramId: telegramUser.id.toString(),
        telegramUsername: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        email: `telegram_${telegramUser.id}@anatomia.md`, // Temporary email
        password: crypto.randomBytes(32).toString('hex'), // Random password
        role: 'student',
        accessLevel: 'free',
        telegramLinkedAt: new Date(),
        telegramNotifications: {
          enabled: true,
          newContent: true,
          homework: true,
          grades: true,
          dailyChallenge: true
        }
      })
      await user.save()
      console.log('✅ New user created from Telegram:', telegramUser.id)
    } else {
      // Update existing user info
      user.telegramUsername = telegramUser.username
      user.firstName = telegramUser.first_name
      user.lastName = telegramUser.last_name || user.lastName
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Send response
    res.status(200).json({
      message: 'Telegram authentication successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessLevel: user.accessLevel,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername
      },
    })
  } catch (error) {
    console.error('Telegram auth error:', error)
    res.status(500).json({ message: 'Server error during Telegram authentication' })
  }
}
