import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import WebApp from '@twa-dev/sdk'

interface TelegramContextType {
  webApp: typeof WebApp | null
  user: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    languageCode?: string
  } | null
  isInTelegram: boolean
  ready: boolean
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  } | null
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isInTelegram: false,
  ready: false,
  themeParams: null
})

export const useTelegram = () => useContext(TelegramContext)

interface TelegramProviderProps {
  children: ReactNode
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [ready, setReady] = useState(false)
  const [webApp, setWebApp] = useState<typeof WebApp | null>(null)
  const [user, setUser] = useState<TelegramContextType['user']>(null)
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [themeParams, setThemeParams] = useState<TelegramContextType['themeParams']>(null)

  useEffect(() => {
    // Check if running inside Telegram
    const isTelegram = window.Telegram?.WebApp !== undefined

    if (isTelegram) {
      const tg = window.Telegram.WebApp

      // Initialize Telegram WebApp
      tg.ready()
      tg.expand()

      const applyThemeParams = () => {
        if (!tg.themeParams) return
        const nextParams = {
          bg_color: tg.themeParams.bg_color,
          text_color: tg.themeParams.text_color,
          hint_color: tg.themeParams.hint_color,
          link_color: tg.themeParams.link_color,
          button_color: tg.themeParams.button_color,
          button_text_color: tg.themeParams.button_text_color,
          secondary_bg_color: tg.themeParams.secondary_bg_color
        }
        setThemeParams(nextParams)

        if (nextParams.bg_color) {
          tg.setBackgroundColor(nextParams.bg_color)
        }
        if (nextParams.secondary_bg_color || nextParams.bg_color) {
          tg.setHeaderColor(nextParams.secondary_bg_color || nextParams.bg_color)
        }
      }

      // Get user data
      if (tg.initDataUnsafe?.user) {
        setUser({
          id: tg.initDataUnsafe.user.id,
          firstName: tg.initDataUnsafe.user.first_name,
          lastName: tg.initDataUnsafe.user.last_name,
          username: tg.initDataUnsafe.user.username,
          languageCode: tg.initDataUnsafe.user.language_code
        })
      }

      applyThemeParams()
      tg.onEvent('themeChanged', applyThemeParams)

      setWebApp(tg)
      setIsInTelegram(true)

      console.log('Telegram WebApp initialized', {
        platform: tg.platform,
        version: tg.version,
        user: tg.initDataUnsafe?.user
      })

      setReady(true)
      return () => {
        tg.offEvent('themeChanged', applyThemeParams)
      }
    } else {
      console.log('Running in regular browser')
    }

    setReady(true)
  }, [])

  return (
    <TelegramContext.Provider value={{ webApp, user, isInTelegram, ready, themeParams }}>
      {children}
    </TelegramContext.Provider>
  )
}
