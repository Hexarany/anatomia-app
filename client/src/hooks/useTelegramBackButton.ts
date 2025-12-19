import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTelegram } from '../contexts/TelegramContext'

/**
 * Hook to automatically show/hide Telegram BackButton based on current route
 * Shows BackButton on all pages except home ("/")
 * Navigates back using history when clicked
 */
export const useTelegramBackButton = () => {
  const { webApp, isInTelegram } = useTelegram()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isInTelegram || !webApp) return

    const backButton = webApp.BackButton
    const isHomePage = location.pathname === '/' || location.pathname === ''

    if (!isHomePage) {
      // Show back button on all pages except home
      const handleBackClick = () => {
        navigate(-1) // Go back in history
      }

      backButton.onClick(handleBackClick)
      backButton.show()

      return () => {
        backButton.offClick(handleBackClick)
        backButton.hide()
      }
    } else {
      // Hide back button on home page
      backButton.hide()
    }
  }, [location.pathname, isInTelegram, webApp, navigate])
}
