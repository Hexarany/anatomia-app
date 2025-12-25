import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
  FormGroup,
  Snackbar,
  CircularProgress,
  Chip
} from '@mui/material'
import TelegramIcon from '@mui/icons-material/Telegram'
import {
  generateTelegramLinkCode,
  getTelegramLinkStatus,
  unlinkTelegram,
  updateTelegramNotifications
} from '@/services/api'

const TelegramSettings = () => {
  const { token } = useAuth()
  const [status, setStatus] = useState<any>(null)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [botUsername, setBotUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    if (!token) return
    try {
      const data = await getTelegramLinkStatus(token)
      setStatus(data)
    } catch (error) {
      console.error('Error loading status:', error)
    }
  }

  const handleGenerateCode = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await generateTelegramLinkCode(token)
      setLinkCode(data.code)
      setBotUsername(data.botUsername || null)
      showSnackbar('Код сгенерирован! Действителен 15 минут.', 'success')
    } catch (error) {
      showSnackbar('Ошибка при генерации кода', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlink = async () => {
    if (!token || !confirm('Отвязать Telegram аккаунт?')) return
    setLoading(true)
    try {
      await unlinkTelegram(token)
      showSnackbar('Telegram аккаунт отвязан', 'success')
      loadStatus()
      setLinkCode(null)
      setBotUsername(null)
    } catch (error) {
      showSnackbar('Ошибка при отвязке', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!token || !status) return
    const newSettings = { ...status.notifications, [key]: value }
    try {
      await updateTelegramNotifications(newSettings, token)
      setStatus({ ...status, notifications: newSettings })
      showSnackbar('Настройки обновлены', 'success')
    } catch (error) {
      showSnackbar('Ошибка при обновлении', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  if (!status) return <CircularProgress />

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TelegramIcon sx={{ fontSize: 40, color: '#0088cc', mr: 2 }} />
            <Typography variant="h5">Telegram интеграция</Typography>
          </Box>

          {status.isLinked ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Аккаунт привязан: @{status.telegramUsername}
              </Alert>

              <Typography variant="h6" gutterBottom>
                Настройки уведомлений
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={status.notifications?.enabled}
                      onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
                    />
                  }
                  label="Включить уведомления"
                />
                {status.notifications?.enabled && (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={status.notifications?.newContent}
                          onChange={(e) => handleNotificationChange('newContent', e.target.checked)}
                        />
                      }
                      label="Новый контент"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={status.notifications?.homework}
                          onChange={(e) => handleNotificationChange('homework', e.target.checked)}
                        />
                      }
                      label="Домашние задания"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={status.notifications?.dailyChallenge}
                          onChange={(e) => handleNotificationChange('dailyChallenge', e.target.checked)}
                        />
                      }
                      label="Ежедневные задания"
                    />
                  </>
                )}
              </FormGroup>

              <Button
                variant="outlined"
                color="error"
                onClick={handleUnlink}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Отвязать Telegram
              </Button>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Привяжите Telegram для получения уведомлений и быстрого доступа к материалам
              </Alert>

              {!linkCode ? (
                <Button
                  variant="contained"
                  startIcon={<TelegramIcon />}
                  onClick={handleGenerateCode}
                  disabled={loading}
                >
                  Подключить Telegram
                </Button>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Код для привязки:
                  </Typography>
                  <Chip
                    label={linkCode}
                    color="primary"
                    sx={{ fontSize: '1.5rem', p: 2 }}
                  />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    1. Откройте Telegram
                    <br />
                    2. Найдите @{botUsername || 'AnatomiaBot'}
                    <br />
                    3. Отправьте команду: /start {linkCode}
                    <br />
                    <br />
                    Код действителен 15 минут
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TelegramSettings
