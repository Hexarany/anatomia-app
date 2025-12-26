import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { TelegramProvider } from './contexts/TelegramContext'
import './i18n'
import './index.css'

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TelegramProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ProgressProvider>
                <ThemeContextProvider>
                  <App />
                </ThemeContextProvider>
              </ProgressProvider>
            </FavoritesProvider>
          </AuthProvider>
        </TelegramProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
