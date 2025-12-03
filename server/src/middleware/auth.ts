import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

interface JwtPayload {
  userId: string
  email: string
  role: string
}

// Расширенный Request с данными пользователя
export interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  user?: {
    userId: string
    email: string
    role: string
  }
}

// Middleware для проверки JWT токена
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получение токена из заголовка Authorization
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Формат: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' })
    }

    // Проверка токена
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Недействительный токен' })
      }

      // Добавление данных пользователя в запрос
      const payload = decoded as JwtPayload
      ;(req as any).userId = payload.userId
      ;(req as any).userEmail = payload.email
      ;(req as any).userRole = payload.role

      next()
    })
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ message: 'Ошибка сервера при проверке токена' })
  }
}

// Опциональный middleware - устанавливает userRole если токен есть, но НЕ требует его
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      // Токена нет - продолжаем без аутентификации
      return next()
    }

    // Токен есть - проверяем и устанавливаем userRole
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        const payload = decoded as JwtPayload
        ;(req as any).userId = payload.userId
        ;(req as any).userEmail = payload.email
        ;(req as any).userRole = payload.role
      }
      next()
    })
  } catch (error) {
    // Ошибка - продолжаем без аутентификации
    next()
  }
}

// Middleware для проверки роли пользователя
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole

    if (!userRole) {
      return res.status(401).json({ message: 'Необходима авторизация' })
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Недостаточно прав для выполнения этой операции' })
    }

    next()
  }
}
