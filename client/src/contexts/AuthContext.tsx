import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

// Use relative URL in production, localhost in development
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'admin'
  accessLevel: 'free' | 'basic' | 'premium'
  paymentAmount?: number
  paymentDate?: string
  paymentHistory?: Array<{
    amount: number
    fromTier: 'free' | 'basic' | 'premium'
    toTier: 'free' | 'basic' | 'premium'
    paymentMethod: string
    paypalOrderId?: string
    paypalPayerId?: string
    date: string
  }>
  subscriptionStatus?: 'none' | 'active' | 'trial' | 'expired' | 'cancelled'
  subscriptionEndDate?: string
  telegramId?: string
  telegramUsername?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  telegramLogin: (initData: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
  updateUser: (updatedUser: User) => void
  hasAccess: (requiredTier: 'free' | 'basic' | 'premium') => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [telegramAuthAttempted, setTelegramAuthAttempted] = useState(false)

  // Загрузка токена из localStorage при инициализации
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      loadUserProfile(storedToken)
    } else {
      // Try Telegram auth if in Telegram and not already attempted
      if (window.Telegram?.WebApp && !telegramAuthAttempted) {
        const initData = window.Telegram.WebApp.initData
        if (initData) {
          setTelegramAuthAttempted(true)
          telegramLogin(initData).catch(() => {
            console.log('Telegram auth failed, continuing as guest')
            setLoading(false)
          })
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
  }, [telegramAuthAttempted])

  // Загрузка профиля пользователя
  const loadUserProfile = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to load user profile:', error)
      // Если токен невалидный, удаляем его
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Вход
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Ошибка входа')
    }
  }

  // Вход через Telegram
  const telegramLogin = async (initData: string) => {
    try {
      console.log('🔐 Attempting Telegram authentication...')
      const response = await axios.post(`${API_URL}/auth/telegram`, {
        initData,
      })

      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      console.log('✅ Telegram authentication successful')
    } catch (error: any) {
      console.error('Telegram login error:', error)
      throw new Error(error.response?.data?.message || 'Ошибка авторизации через Telegram')
    } finally {
      setLoading(false)
    }
  }

  // Регистрация
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
      })

      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.response?.data?.message || 'Ошибка регистрации')
    }
  }

  // Обновление данных пользователя (например, после покупки тарифа)
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  // Проверка доступа к контенту по тарифу
  const hasAccess = (requiredTier: 'free' | 'basic' | 'premium'): boolean => {
    if (!user) return false

    // Админы и учителя имеют полный доступ
    if (user.role === 'admin' || user.role === 'teacher') {
      return true
    }

    const tierHierarchy = { free: 0, basic: 1, premium: 2 }
    const userLevel = tierHierarchy[user.accessLevel]
    const requiredLevel = tierHierarchy[requiredTier]

    return userLevel >= requiredLevel
  }

  // Выход
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    telegramLogin,
    register,
    logout,
    updateUser,
    hasAccess,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
