import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import { useTelegram } from './TelegramContext'

interface MainButtonConfig {
  text: string
  onClick: () => void
  disabled?: boolean
  progress?: boolean
  color?: string
  textColor?: string
}

interface MainButtonContextType {
  setMainButton: (config: MainButtonConfig) => void
  hideMainButton: () => void
  showProgress: () => void
  hideProgress: () => void
}

const MainButtonContext = createContext<MainButtonContextType>({
  setMainButton: () => {},
  hideMainButton: () => {},
  showProgress: () => {},
  hideProgress: () => {}
})

export const useMainButton = () => useContext(MainButtonContext)

interface MainButtonProviderProps {
  children: ReactNode
}

export const MainButtonProvider = ({ children }: MainButtonProviderProps) => {
  const { webApp, isInTelegram } = useTelegram()
  const [config, setConfig] = useState<MainButtonConfig | null>(null)
  const onClickRef = useRef<(() => void) | null>(null)

  // Sync state with Telegram WebApp API
  useEffect(() => {
    if (!isInTelegram || !webApp) return

    const mainButton = webApp.MainButton

    if (config) {
      // Set text
      mainButton.setText(config.text)

      // Set colors if provided
      if (config.color) {
        mainButton.setParams({ color: config.color })
      }
      if (config.textColor) {
        mainButton.setParams({ text_color: config.textColor })
      }

      // Set disabled state
      if (config.disabled) {
        mainButton.disable()
      } else {
        mainButton.enable()
      }

      // Set progress state
      if (config.progress) {
        mainButton.showProgress()
      } else {
        mainButton.hideProgress()
      }

      // Remove old click handler and add new one
      if (onClickRef.current) {
        mainButton.offClick(onClickRef.current)
      }

      const clickHandler = config.onClick
      onClickRef.current = clickHandler
      mainButton.onClick(clickHandler)

      // Show button
      mainButton.show()
    } else {
      // Hide button if no config
      if (onClickRef.current) {
        mainButton.offClick(onClickRef.current)
        onClickRef.current = null
      }
      mainButton.hide()
    }

    // Cleanup on unmount
    return () => {
      if (onClickRef.current) {
        mainButton.offClick(onClickRef.current)
      }
    }
  }, [config, isInTelegram, webApp])

  const setMainButton = useCallback((newConfig: MainButtonConfig) => {
    setConfig(newConfig)
  }, [])

  const hideMainButton = useCallback(() => {
    setConfig(null)
  }, [])

  const showProgress = useCallback(() => {
    if (!isInTelegram || !webApp) return
    webApp.MainButton.showProgress()
  }, [isInTelegram, webApp])

  const hideProgress = useCallback(() => {
    if (!isInTelegram || !webApp) return
    webApp.MainButton.hideProgress()
  }, [isInTelegram, webApp])

  return (
    <MainButtonContext.Provider value={{ setMainButton, hideMainButton, showProgress, hideProgress }}>
      {children}
    </MainButtonContext.Provider>
  )
}
