import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { TelegramProvider } from './contexts/TelegramContext'
import './i18n'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>,
)
