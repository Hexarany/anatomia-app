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
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isInTelegram: false,
  ready: false
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

  useEffect(() => {
    // Check if running inside Telegram
    const isTelegram = window.Telegram?.WebApp !== undefined

    if (isTelegram) {
      const tg = window.Telegram.WebApp

      // Initialize Telegram WebApp
      tg.ready()
      tg.expand()

      // Set theme
      tg.setHeaderColor('#1976d2')
      tg.setBackgroundColor('#ffffff')

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

      setWebApp(tg)
      setIsInTelegram(true)

      console.log('🤖 Telegram WebApp initialized', {
        platform: tg.platform,
        version: tg.version,
        user: tg.initDataUnsafe?.user
      })
    } else {
      console.log('🌐 Running in regular browser')
    }

    setReady(true)
  }, [])

  return (
    <TelegramContext.Provider value={{ webApp, user, isInTelegram, ready }}>
      {children}
    </TelegramContext.Provider>
  )
}
