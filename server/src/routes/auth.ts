import express from 'express'
import { body } from 'express-validator'
import { register, login, getProfile, updateProfile, telegramAuth } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// POST /api/auth/register - Регистрация нового пользователя
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Введите корректный email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Пароль должен быть минимум 6 символов'),
    body('firstName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Имя должно быть минимум 2 символа'),
    body('lastName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Фамилия должна быть минимум 2 символа'),
    body('role')
      .optional()
      .isIn(['student', 'teacher', 'admin'])
      .withMessage('Недопустимая роль'),
  ],
  register
)

// POST /api/auth/login - Вход пользователя
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Введите корректный email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Пароль обязателен'),
  ],
  login
)

// GET /api/auth/profile - Получение профиля текущего пользователя (требует авторизации)
router.get('/profile', authenticateToken, getProfile)

// PUT /api/auth/profile - Обновление профиля пользователя (требует авторизации)
router.put(
  '/profile',
  [
    authenticateToken,
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Имя должно быть минимум 2 символа'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Фамилия должна быть минимум 2 символа'),
  ],
  updateProfile
)

// POST /api/auth/telegram - Авторизация через Telegram WebApp
router.post(
  '/telegram',
  [
    body('initData')
      .notEmpty()
      .withMessage('initData is required'),
  ],
  telegramAuth
)

export default router
