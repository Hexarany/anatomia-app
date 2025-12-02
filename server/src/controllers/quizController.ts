import { Request, Response } from 'express'
import Quiz from '../models/Quiz'
import User from '../models/User'

interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean
}

// Helper: Check if user has access to quizzes (Premium tier only)
const hasAccessToQuiz = async (
  userId: string | undefined,
  userRole: string | undefined
): Promise<{ hasAccess: boolean; userAccessLevel: string }> => {
  // Admins and teachers have full access
  if (userRole === 'admin' || userRole === 'teacher') {
    return { hasAccess: true, userAccessLevel: 'premium' }
  }

  // Get user access level
  let userAccessLevel: 'free' | 'basic' | 'premium' = 'free'
  if (userId) {
    const user = await User.findById(userId)
    userAccessLevel = user?.accessLevel || 'free'
  }

  // Only Premium users have full access to quizzes
  const hasAccess = userAccessLevel === 'premium'

  return { hasAccess, userAccessLevel }
}

// Helper: Apply content lock
const createSafeQuiz = (quiz: any, hasAccess: boolean, userAccessLevel: string) => {
  return {
    ...quiz.toObject(),
    questions: hasAccess ? quiz.questions : [], // Hide questions for non-premium users
    hasFullContentAccess: hasAccess,
    accessInfo: {
      hasFullAccess: hasAccess,
      userAccessLevel,
      requiredTier: 'premium', // Quizzes require premium tier
    },
  }
}

// =======================================================
// READ Functions (Assumed existing)
// =======================================================

export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find().populate('topicId').populate('categoryId')
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch quizzes' } })
  }
}

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('topicId').populate('categoryId')
    if (!quiz) {
      return res.status(404).json({ error: { message: 'Quiz not found' } })
    }

    // Apply tier-based access control
    const customReq = req as CustomRequest
    const accessInfo = await hasAccessToQuiz(customReq.userId, customReq.userRole)

    const safeQuiz = createSafeQuiz(quiz, accessInfo.hasAccess, accessInfo.userAccessLevel)

    res.json(safeQuiz)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch quiz' } })
  }
}

export const getQuizzesByTopic = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find({ topicId: req.params.topicId }).populate('topicId').populate('categoryId')
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch quizzes by topic' } })
  }
}

// =======================================================
// CRUD Functions (New Implementation)
// =======================================================

// НОВЫЙ: Создание викторины
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = new Quiz(req.body)
    await quiz.save()
    res.status(201).json(quiz)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create quiz' } })
  }
}

// НОВЫЙ: Обновление викторины
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('topicId').populate('categoryId') // Populate для возврата полных объектов

    if (!quiz) {
      return res.status(404).json({ error: { message: 'Quiz not found' } })
    }
    res.json(quiz)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update quiz' } })
  }
}

// НОВЫЙ: Удаление викторины
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id)
    if (!quiz) {
      return res.status(404).json({ error: { message: 'Quiz not found' } })
    }
    res.json({ message: 'Quiz deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete quiz' } })
  }
}