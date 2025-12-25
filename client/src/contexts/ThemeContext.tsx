import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useTelegram } from './TelegramContext'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
})

export const useThemeMode = () => useContext(ThemeContext)

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isInTelegram, themeParams } = useTelegram()

  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode | null
    if (savedTheme) {
      return savedTheme
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const [mode, setMode] = useState<ThemeMode>(getInitialTheme)
  const [manualOverride, setManualOverride] = useState(() => localStorage.getItem('themeModeOverride') === '1')

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode)
  }, [mode])

  useEffect(() => {
    if (manualOverride) {
      localStorage.setItem('themeModeOverride', '1')
    } else {
      localStorage.removeItem('themeModeOverride')
    }
  }, [manualOverride])

  useEffect(() => {
    if (!isInTelegram || !themeParams || manualOverride) {
      return
    }
    const isDark = themeParams.bg_color?.startsWith('#0') ||
      themeParams.bg_color?.startsWith('#1') ||
      themeParams.bg_color?.startsWith('#2')
    const nextMode: ThemeMode = isDark ? 'dark' : 'light'
    if (nextMode !== mode) {
      setMode(nextMode)
    }
  }, [isInTelegram, themeParams, manualOverride, mode])

  const toggleTheme = () => {
    setManualOverride(true)
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  const theme = useMemo(() => {
    // Use Telegram theme colors if running in Telegram
    if (isInTelegram && themeParams && !manualOverride) {
      // Determine if theme is dark based on background color
      const isDark = themeParams.bg_color?.startsWith('#0') ||
                     themeParams.bg_color?.startsWith('#1') ||
                     themeParams.bg_color?.startsWith('#2')

      return createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: {
            main: themeParams.button_color || '#2196f3',
          },
          background: {
            default: themeParams.bg_color || '#ffffff',
            paper: themeParams.secondary_bg_color || (isDark ? '#1e1e1e' : '#ffffff'),
          },
          text: {
            primary: themeParams.text_color || (isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'),
            secondary: themeParams.hint_color || (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'),
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 600,
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: isDark
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(0,0,0,0.4)'
                    : '0 4px 16px rgba(0,0,0,0.15)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      })
    }

    // Regular web theme
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'light' ? '#2196f3' : '#90caf9',
          light: mode === 'light' ? '#64b5f6' : '#e3f2fd',
          dark: mode === 'light' ? '#1976d2' : '#42a5f5',
        },
        secondary: {
          main: mode === 'light' ? '#f50057' : '#f48fb1',
          light: mode === 'light' ? '#ff4081' : '#ffc1e3',
          dark: mode === 'light' ? '#c51162' : '#f06292',
        },
        background: {
          default: mode === 'light' ? '#f5f5f5' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
          secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontSize: '2.5rem',
          fontWeight: 600,
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 600,
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 500,
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 500,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow:
                mode === 'light'
                  ? '0 2px 8px rgba(0,0,0,0.1)'
                  : '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow:
                  mode === 'light'
                    ? '0 4px 16px rgba(0,0,0,0.15)'
                    : '0 4px 16px rgba(0,0,0,0.4)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
      },
    })
  }, [mode, isInTelegram, themeParams, manualOverride])

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
