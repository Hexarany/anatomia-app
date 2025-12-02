import { Request, Response } from 'express'
import User from '../models/User'
import mongoose from 'mongoose'

interface CustomRequest extends Request {
  userId?: string
  userRole?: string
}

// GET /api/users-management - Get all users with filtering
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, accessLevel, search, page = 1, limit = 20 } = req.query

    const filter: any = {}

    // Filter by role
    if (role && role !== 'all') {
      filter.role = role
    }

    // Filter by access level
    if (accessLevel && accessLevel !== 'all') {
      filter.accessLevel = accessLevel
    }

    // Search by name or email
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const users = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)

    const total = await User.countDocuments(filter)

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      message: 'Ошибка при получении пользователей',
      error: error.message
    })
  }
}

// GET /api/users-management/:id - Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Недопустимый ID пользователя' })
    }

    const user = await User.findById(id).select('-password -__v')

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.json(user)
  } catch (error: any) {
    console.error('Error fetching user:', error)
    res.status(500).json({
      message: 'Ошибка при получении пользователя',
      error: error.message
    })
  }
}

// PUT /api/users-management/:id - Update user (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { firstName, lastName, role, accessLevel, paymentAmount, paymentDate } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Недопустимый ID пользователя' })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName
    if (lastName !== undefined) user.lastName = lastName
    if (role !== undefined) user.role = role
    if (accessLevel !== undefined) user.accessLevel = accessLevel
    if (paymentAmount !== undefined) user.paymentAmount = paymentAmount
    if (paymentDate !== undefined) user.paymentDate = paymentDate

    await user.save({ validateBeforeSave: true })

    // Return user without password
    const updatedUser = await User.findById(id).select('-password -__v')

    res.json({
      message: 'Пользователь успешно обновлен',
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('Error updating user:', error)

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return res.status(400).json({
        message: 'Ошибка валидации',
        errors: messages
      })
    }

    res.status(500).json({
      message: 'Ошибка при обновлении пользователя',
      error: error.message
    })
  }
}

// DELETE /api/users-management/:id - Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const customReq = req as CustomRequest

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Недопустимый ID пользователя' })
    }

    // Prevent self-deletion
    if (customReq.userId === id) {
      return res.status(400).json({ message: 'Нельзя удалить свой собственный аккаунт' })
    }

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    res.json({ message: 'Пользователь успешно удален' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Ошибка при удалении пользователя' })
  }
}

// GET /api/users-management/stats - Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments()

    // Count by role
    const studentCount = await User.countDocuments({ role: 'student' })
    const teacherCount = await User.countDocuments({ role: 'teacher' })
    const adminCount = await User.countDocuments({ role: 'admin' })

    // Count by access level
    const freeCount = await User.countDocuments({ accessLevel: 'free' })
    const basicCount = await User.countDocuments({ accessLevel: 'basic' })
    const premiumCount = await User.countDocuments({ accessLevel: 'premium' })

    // Calculate total revenue
    const revenueResult = await User.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$paymentAmount' } } },
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })

    // Get recent payments (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentPayments = await User.countDocuments({
      paymentDate: { $gte: thirtyDaysAgo },
      accessLevel: { $in: ['basic', 'premium'] },
    })

    res.json({
      totalUsers,
      byRole: {
        student: studentCount,
        teacher: teacherCount,
        admin: adminCount,
      },
      byAccessLevel: {
        free: freeCount,
        basic: basicCount,
        premium: premiumCount,
      },
      revenue: {
        total: totalRevenue,
        recentPayments,
      },
      recentActivity: {
        newUsersLast7Days: recentUsers,
      },
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ message: 'Ошибка при получении статистики' })
  }
}
