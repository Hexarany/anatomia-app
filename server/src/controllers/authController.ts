import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
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
