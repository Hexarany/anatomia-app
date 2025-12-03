import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { useAuth } from './AuthContext'
import {
  Progress,
  getProgress,
  markTopicComplete as apiMarkTopicComplete,
  markProtocolViewed as apiMarkProtocolViewed,
  markGuidelineViewed as apiMarkGuidelineViewed,
  mark3DModelViewed as apiMark3DModelViewed,
  markTriggerPointViewed as apiMarkTriggerPointViewed,
  saveQuizResult as apiSaveQuizResult,
} from '@/services/api'

interface ProgressContextType {
  progress: Progress | null
  loading: boolean
  refreshProgress: () => Promise<void>
  markTopicComplete: (topicId: string, timeSpent?: number) => Promise<void>
  markProtocolViewed: (protocolId: string, timeSpent?: number) => Promise<void>
  markGuidelineViewed: (guidelineId: string) => Promise<void>
  mark3DModelViewed: (modelId: string) => Promise<void>
  markTriggerPointViewed: (triggerPointId: string) => Promise<void>
  saveQuizResult: (data: {
    quizId: string
    score: number
    totalQuestions: number
    correctAnswers: number
    timeSpent: number
    mode: 'practice' | 'exam'
  }) => Promise<void>
  isTopicCompleted: (topicId: string) => boolean
  isProtocolViewed: (protocolId: string) => boolean
  isGuidelineViewed: (guidelineId: string) => boolean
  is3DModelViewed: (modelId: string) => boolean
  isTriggerPointViewed: (triggerPointId: string) => boolean
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return context
}

interface ProgressProviderProps {
  children: ReactNode
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [achievementNotification, setAchievementNotification] = useState<{
    show: boolean
    achievement: Progress['achievements'][0] | null
  }>({ show: false, achievement: null })

  const refreshProgress = async () => {
    if (!isAuthenticated) {
      setProgress(null)
      setLoading(false)
      return
    }

    try {
      const data = await getProgress()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshProgress()
  }, [isAuthenticated])

  const showNewAchievements = (newProgress: Progress) => {
    if (!progress) return

    // Находим новые достижения
    const newAchievements = newProgress.achievements.filter(
      (newAch) => !progress.achievements.some((oldAch) => oldAch.achievementId === newAch.achievementId)
    )

    // Показываем первое новое достижение
    if (newAchievements.length > 0) {
      setAchievementNotification({
        show: true,
        achievement: newAchievements[0],
      })
    }
  }

  const markTopicComplete = async (topicId: string, timeSpent: number = 0) => {
    try {
      const { progress: newProgress } = await apiMarkTopicComplete(topicId, timeSpent)
      showNewAchievements(newProgress)
      setProgress(newProgress)
    } catch (error) {
      console.error('Error marking topic complete:', error)
    }
  }

  const markProtocolViewed = async (protocolId: string, timeSpent: number = 0) => {
    try {
      const { progress: newProgress } = await apiMarkProtocolViewed(protocolId, timeSpent)
      showNewAchievements(newProgress)
      setProgress(newProgress)
    } catch (error) {
      console.error('Error marking protocol viewed:', error)
    }
  }

  const markGuidelineViewed = async (guidelineId: string) => {
    try {
      const { progress: newProgress } = await apiMarkGuidelineViewed(guidelineId)
      showNewAchievements(newProgress)
      setProgress(newProgress)
    } catch (error) {
      console.error('Error marking guideline viewed:', error)
    }
  }

  const mark3DModelViewed = async (modelId: string) => {
    try {
      const { progress: newProgress } = await apiMark3DModelViewed(modelId)
      showNewAchievements(newProgress)
      setProgress(newProgress)
    } catch (error) {
      console.error('Error marking 3D model viewed:', error)
    }
  }

  const markTriggerPointViewed = async (triggerPointId: string) => {
    try {
      const { progress: newProgress } = await apiMarkTriggerPointViewed(triggerPointId)
      showNewAchievements(newProgress)
      setProgress(newProgress)
    } catch (error) {
      console.error('Error marking trigger point viewed:', error)
    }
  }

  const saveQuizResult = async (data: {
    quizId: string
    score: number
    totalQuestions: number
    correctAnswers: number
    timeSpent: number
    mode: 'practice' | 'exam'
  }) => {
    try {
      const { progress: newProgress } = await apiSaveQuizResult(data)
      showNewAchievements(newProgress)
      setProgress(newProgress)
    } catch (error) {
      console.error('Error saving quiz result:', error)
    }
  }

  const isTopicCompleted = (topicId: string): boolean => {
    return progress?.completedTopics.some((t) => t.topicId === topicId) || false
  }

  const isProtocolViewed = (protocolId: string): boolean => {
    return progress?.viewedProtocols.some((p) => p.protocolId === protocolId) || false
  }

  const isGuidelineViewed = (guidelineId: string): boolean => {
    return progress?.viewedGuidelines.some((g) => g.guidelineId === guidelineId) || false
  }

  const is3DModelViewed = (modelId: string): boolean => {
    return progress?.viewed3DModels.some((m) => m.modelId === modelId) || false
  }

  const isTriggerPointViewed = (triggerPointId: string): boolean => {
    return progress?.viewedTriggerPoints.some((tp) => tp.triggerPointId === triggerPointId) || false
  }

  const handleCloseAchievement = () => {
    setAchievementNotification({ show: false, achievement: null })
  }

  const value: ProgressContextType = {
    progress,
    loading,
    refreshProgress,
    markTopicComplete,
    markProtocolViewed,
    markGuidelineViewed,
    mark3DModelViewed,
    markTriggerPointViewed,
    saveQuizResult,
    isTopicCompleted,
    isProtocolViewed,
    isGuidelineViewed,
    is3DModelViewed,
    isTriggerPointViewed,
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}

      {/* Achievement Notification */}
      <Snackbar
        open={achievementNotification.show}
        autoHideDuration={6000}
        onClose={handleCloseAchievement}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAchievement}
          severity="success"
          sx={{
            width: '100%',
            fontSize: '1.1rem',
            '& .MuiAlert-icon': {
              fontSize: '2rem',
            },
          }}
        >
          <strong>{achievementNotification.achievement?.icon} Новое достижение!</strong>
          <br />
          {achievementNotification.achievement?.title.ru}
        </Alert>
      </Snackbar>
    </ProgressContext.Provider>
  )
}
