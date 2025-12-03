import { Response } from 'express'
import Progress from '../models/Progress'
import { CustomRequest } from '../middleware/auth'

// Получить прогресс пользователя
export const getProgress = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId

    let progress = await Progress.findOne({ userId })

    // Если прогресса нет - создаем новый
    if (!progress) {
      progress = new Progress({
        userId,
        completedTopics: [],
        viewedProtocols: [],
        viewedGuidelines: [],
        viewed3DModels: [],
        viewedTriggerPoints: [],
        completedQuizzes: [],
        achievements: [],
        stats: {
          totalStudyTime: 0,
          streak: 0,
          lastActivityDate: new Date(),
          longestStreak: 0,
          totalTopicsCompleted: 0,
          totalQuizzesPassed: 0,
          averageQuizScore: 0,
        },
      })
      await progress.save()
    }

    res.json(progress)
  } catch (error) {
    console.error('Error getting progress:', error)
    res.status(500).json({ error: { message: 'Ошибка получения прогресса' } })
  }
}

// Отметить тему как завершенную
export const markTopicComplete = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { topicId, timeSpent } = req.body

    let progress = await Progress.findOne({ userId })
    if (!progress) {
      progress = new Progress({ userId })
    }

    // Проверяем, не была ли тема уже завершена
    const alreadyCompleted = progress.completedTopics.some(
      (t) => t.topicId.toString() === topicId
    )

    if (!alreadyCompleted) {
      progress.completedTopics.push({
        topicId,
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
      })
      progress.stats.totalTopicsCompleted += 1
    }

    // Обновляем статистику
    progress.stats.totalStudyTime += timeSpent || 0
    progress.stats.lastActivityDate = new Date()

    // Обновляем streak
    updateStreak(progress)

    await progress.save()

    // Проверяем достижения
    await checkAchievements(progress)

    res.json({ message: 'Тема отмечена как завершенная', progress })
  } catch (error) {
    console.error('Error marking topic complete:', error)
    res.status(500).json({ error: { message: 'Ошибка отметки темы' } })
  }
}

// Отметить протокол как просмотренный
export const markProtocolViewed = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { protocolId, timeSpent } = req.body

    let progress = await Progress.findOne({ userId })
    if (!progress) {
      progress = new Progress({ userId })
    }

    // Проверяем, не был ли протокол уже просмотрен
    const alreadyViewed = progress.viewedProtocols.some(
      (p) => p.protocolId.toString() === protocolId
    )

    if (!alreadyViewed) {
      progress.viewedProtocols.push({
        protocolId,
        viewedAt: new Date(),
        timeSpent: timeSpent || 0,
      })
    }

    progress.stats.totalStudyTime += timeSpent || 0
    progress.stats.lastActivityDate = new Date()
    updateStreak(progress)

    await progress.save()
    await checkAchievements(progress)

    res.json({ message: 'Протокол отмечен как просмотренный', progress })
  } catch (error) {
    console.error('Error marking protocol viewed:', error)
    res.status(500).json({ error: { message: 'Ошибка отметки протокола' } })
  }
}

// Отметить гайдлайн как просмотренный
export const markGuidelineViewed = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { guidelineId } = req.body

    let progress = await Progress.findOne({ userId })
    if (!progress) {
      progress = new Progress({ userId })
    }

    const alreadyViewed = progress.viewedGuidelines.some(
      (g) => g.guidelineId.toString() === guidelineId
    )

    if (!alreadyViewed) {
      progress.viewedGuidelines.push({
        guidelineId,
        viewedAt: new Date(),
      })
    }

    progress.stats.lastActivityDate = new Date()
    updateStreak(progress)

    await progress.save()
    await checkAchievements(progress)

    res.json({ message: 'Гайдлайн отмечен как просмотренный', progress })
  } catch (error) {
    console.error('Error marking guideline viewed:', error)
    res.status(500).json({ error: { message: 'Ошибка отметки гайдлайна' } })
  }
}

// Отметить 3D модель как просмотренную
export const mark3DModelViewed = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { modelId } = req.body

    let progress = await Progress.findOne({ userId })
    if (!progress) {
      progress = new Progress({ userId })
    }

    const alreadyViewed = progress.viewed3DModels.some(
      (m) => m.modelId.toString() === modelId
    )

    if (!alreadyViewed) {
      progress.viewed3DModels.push({
        modelId,
        viewedAt: new Date(),
      })
    }

    progress.stats.lastActivityDate = new Date()
    updateStreak(progress)

    await progress.save()
    await checkAchievements(progress)

    res.json({ message: '3D модель отмечена как просмотренная', progress })
  } catch (error) {
    console.error('Error marking 3D model viewed:', error)
    res.status(500).json({ error: { message: 'Ошибка отметки 3D модели' } })
  }
}

// Отметить триггерную точку как просмотренную
export const markTriggerPointViewed = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { triggerPointId } = req.body

    let progress = await Progress.findOne({ userId })
    if (!progress) {
      progress = new Progress({ userId })
    }

    const alreadyViewed = progress.viewedTriggerPoints.some(
      (tp) => tp.triggerPointId.toString() === triggerPointId
    )

    if (!alreadyViewed) {
      progress.viewedTriggerPoints.push({
        triggerPointId,
        viewedAt: new Date(),
      })
    }

    progress.stats.lastActivityDate = new Date()
    updateStreak(progress)

    await progress.save()
    await checkAchievements(progress)

    res.json({ message: 'Триггерная точка отмечена как просмотренная', progress })
  } catch (error) {
    console.error('Error marking trigger point viewed:', error)
    res.status(500).json({ error: { message: 'Ошибка отметки триггерной точки' } })
  }
}

// Сохранить результат теста
export const saveQuizResult = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { quizId, score, totalQuestions, correctAnswers, timeSpent, mode } = req.body

    let progress = await Progress.findOne({ userId })
    if (!progress) {
      progress = new Progress({ userId })
    }

    progress.completedQuizzes.push({
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      completedAt: new Date(),
      timeSpent: timeSpent || 0,
      mode: mode || 'practice',
    })

    // Обновляем статистику
    const passedQuizzes = progress.completedQuizzes.filter((q) => q.score >= 60)
    progress.stats.totalQuizzesPassed = passedQuizzes.length

    const totalScore = progress.completedQuizzes.reduce((sum, q) => sum + q.score, 0)
    progress.stats.averageQuizScore = progress.completedQuizzes.length > 0
      ? Math.round(totalScore / progress.completedQuizzes.length)
      : 0

    progress.stats.totalStudyTime += timeSpent || 0
    progress.stats.lastActivityDate = new Date()
    updateStreak(progress)

    await progress.save()
    await checkAchievements(progress)

    res.json({ message: 'Результат теста сохранен', progress })
  } catch (error) {
    console.error('Error saving quiz result:', error)
    res.status(500).json({ error: { message: 'Ошибка сохранения результата теста' } })
  }
}

// Вспомогательная функция для обновления streak
function updateStreak(progress: any) {
  const now = new Date()
  const lastActivity = new Date(progress.stats.lastActivityDate)

  const daysDifference = Math.floor(
    (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysDifference === 0) {
    // Та же дата - ничего не делаем
    return
  } else if (daysDifference === 1) {
    // Следующий день - увеличиваем streak
    progress.stats.streak += 1
    if (progress.stats.streak > progress.stats.longestStreak) {
      progress.stats.longestStreak = progress.stats.streak
    }
  } else if (daysDifference > 1) {
    // Пропуск дней - сбрасываем streak
    progress.stats.streak = 1
  }
}

// Проверка и выдача достижений
async function checkAchievements(progress: any) {
  const achievements: any[] = []

  // Первая тема
  if (progress.stats.totalTopicsCompleted === 1) {
    achievements.push({
      achievementId: 'first-topic',
      title: { ru: 'Первые шаги', ro: 'Primii pași' },
      description: { ru: 'Изучена первая тема', ro: 'Prima temă studiată' },
      icon: '🎯',
    })
  }

  // 10 тем
  if (progress.stats.totalTopicsCompleted === 10) {
    achievements.push({
      achievementId: '10-topics',
      title: { ru: 'Прилежный ученик', ro: 'Elev silitor' },
      description: { ru: 'Изучено 10 тем', ro: '10 teme studiate' },
      icon: '📚',
    })
  }

  // 50 тем
  if (progress.stats.totalTopicsCompleted === 50) {
    achievements.push({
      achievementId: '50-topics',
      title: { ru: 'Эксперт', ro: 'Expert' },
      description: { ru: 'Изучено 50 тем', ro: '50 de teme studiate' },
      icon: '🏆',
    })
  }

  // Первый тест
  if (progress.stats.totalQuizzesPassed === 1) {
    achievements.push({
      achievementId: 'first-quiz',
      title: { ru: 'Первое испытание', ro: 'Prima probă' },
      description: { ru: 'Пройден первый тест', ro: 'Primul test trecut' },
      icon: '✅',
    })
  }

  // 10 тестов
  if (progress.stats.totalQuizzesPassed === 10) {
    achievements.push({
      achievementId: '10-quizzes',
      title: { ru: 'Тестовый гуру', ro: 'Guru testelor' },
      description: { ru: 'Пройдено 10 тестов', ro: '10 teste trecute' },
      icon: '💯',
    })
  }

  // 7 дней подряд
  if (progress.stats.streak === 7) {
    achievements.push({
      achievementId: '7-day-streak',
      title: { ru: 'Неделя обучения', ro: 'O săptămână de studiu' },
      description: { ru: '7 дней активности подряд', ro: '7 zile de activitate consecutivă' },
      icon: '🔥',
    })
  }

  // 30 дней подряд
  if (progress.stats.streak === 30) {
    achievements.push({
      achievementId: '30-day-streak',
      title: { ru: 'Железная воля', ro: 'Voință de fier' },
      description: { ru: '30 дней активности подряд', ro: '30 de zile de activitate consecutivă' },
      icon: '💪',
    })
  }

  // Отличник (средний балл 90+)
  if (progress.stats.averageQuizScore >= 90 && progress.stats.totalQuizzesPassed >= 5) {
    achievements.push({
      achievementId: 'excellent-student',
      title: { ru: 'Отличник', ro: 'Elev excelent' },
      description: { ru: 'Средний балл 90+', ro: 'Media 90+' },
      icon: '⭐',
    })
  }

  // 10 протоколов массажа
  if (progress.viewedProtocols.length === 10) {
    achievements.push({
      achievementId: '10-protocols',
      title: { ru: 'Мастер протоколов', ro: 'Maestru protocoale' },
      description: { ru: 'Изучено 10 протоколов массажа', ro: '10 protocoale de masaj studiate' },
      icon: '💆',
    })
  }

  // Добавляем только новые достижения
  for (const achievement of achievements) {
    const alreadyUnlocked = progress.achievements.some(
      (a: any) => a.achievementId === achievement.achievementId
    )
    if (!alreadyUnlocked) {
      progress.achievements.push(achievement)
    }
  }

  if (achievements.length > 0) {
    await progress.save()
  }
}
