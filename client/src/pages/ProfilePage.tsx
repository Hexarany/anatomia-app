import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import PaymentIcon from '@mui/icons-material/Payment'
import TelegramSettings from '@/components/TelegramSettings'
import EmailNotificationSettings from '@/components/EmailNotificationSettings'

const ProfilePage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [subscriptionTimeLeft, setSubscriptionTimeLeft] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!user?.subscriptionEndDate) {
      setSubscriptionTimeLeft(null)
      return
    }

    const endDate = new Date(user.subscriptionEndDate)
    if (Number.isNaN(endDate.getTime())) {
      setSubscriptionTimeLeft(null)
      return
    }

    const updateTimeLeft = () => {
      const diffMs = endDate.getTime() - Date.now()
      if (diffMs <= 0) {
        setSubscriptionTimeLeft(null)
        return
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60))
      const days = Math.floor(totalMinutes / (60 * 24))
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
      const minutes = totalMinutes % 60

      if (lang === 'ru') {
        const dayLabel = days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'
        const hourLabel = hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'
        const minuteLabel = minutes === 1 ? 'минута' : minutes < 5 ? 'минуты' : 'минут'
        setSubscriptionTimeLeft(`${days} ${dayLabel} • ${hours} ${hourLabel} • ${minutes} ${minuteLabel}`)
      } else {
        setSubscriptionTimeLeft(`${days} zile • ${hours} ore • ${minutes} min`)
      }
    }

    updateTimeLeft()
    const intervalId = window.setInterval(updateTimeLeft, 60 * 1000)
    return () => window.clearInterval(intervalId)
  }, [user?.subscriptionEndDate, lang])

  const getAccessLevelColor = (level: string): 'default' | 'primary' | 'success' => {
    switch (level) {
      case 'premium':
        return 'success'
      case 'basic':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getAccessLevelText = (level: string): string => {
    const levelMap: Record<string, { ru: string; ro: string }> = {
      free: { ru: 'Free (Бесплатный)', ro: 'Free (Gratuit)' },
      basic: { ru: 'Basic', ro: 'De bază' },
      premium: { ru: 'Premium', ro: 'Premium' },
    }
    return levelMap[level]?.[lang] || level
  }

  const getRoleText = (role: string): string => {
    const roleMap: Record<string, { ru: string; ro: string }> = {
      student: { ru: 'Студент', ro: 'Student' },
      teacher: { ru: 'Преподаватель', ro: 'Profesor' },
      admin: { ru: 'Администратор', ro: 'Administrator' },
    }
    return roleMap[role]?.[lang] || role
  }

  const shouldShowSubscriptionTimer = useMemo(() => {
    return !!user?.subscriptionEndDate && user.role === 'student'
  }, [user?.role, user?.subscriptionEndDate])

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        {lang === 'ru' ? 'Мой профиль' : 'Profilul meu'}
      </Typography>

      <Grid container spacing={3}>
        {/* Личная информация */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={600}>
                  {lang === 'ru' ? 'Личная информация' : 'Informații personale'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List>
                <ListItem sx={{ px: 0 }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={lang === 'ru' ? 'Имя' : 'Nume'}
                    secondary={`${user.firstName} ${user.lastName}`.trim()}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary="Email" secondary={user.email} />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={lang === 'ru' ? 'Роль' : 'Rol'}
                    secondary={getRoleText(user.role)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Уровень доступа */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkspacePremiumIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={600}>
                  {lang === 'ru' ? 'Уровень доступа' : 'Nivel de acces'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {lang === 'ru' ? 'Текущий тариф' : 'Tarif curent'}
                </Typography>
                <Chip
                  icon={<WorkspacePremiumIcon />}
                  label={getAccessLevelText(user.accessLevel)}
                  color={getAccessLevelColor(user.accessLevel)}
                  sx={{ fontWeight: 600, fontSize: '1rem', py: 2.5 }}
                />
              </Box>

              {user.paymentAmount && user.paymentAmount > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {lang === 'ru' ? 'Оплачено' : 'Plătit'}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ${user.paymentAmount}
                  </Typography>
                </Box>
              )}

              {user.paymentDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {lang === 'ru' ? 'Дата оплаты' : 'Data plății'}
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.paymentDate).toLocaleDateString(
                      lang === 'ru' ? 'ru-RU' : 'ro-RO',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </Typography>
                </Box>
              )}

              {shouldShowSubscriptionTimer && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {lang === 'ru' ? 'До окончания подписки' : 'Până la expirare'}
                  </Typography>
                  {subscriptionTimeLeft ? (
                    <Typography variant="body1" fontWeight={600}>
                      {subscriptionTimeLeft}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      {lang === 'ru' ? 'Подписка истекла' : 'Abonamentul a expirat'}
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                {user.accessLevel === 'free' && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate('/pricing')}
                  >
                    {lang === 'ru' ? 'Выбрать тариф' : 'Alege tariful'}
                  </Button>
                )}

                {user.accessLevel === 'basic' && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => navigate('/pricing')}
                  >
                    {lang === 'ru' ? 'Перейти на Premium ($30)' : 'Upgrade la Premium ($30)'}
                  </Button>
                )}

                {user.accessLevel === 'premium' && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'success.50',
                      borderRadius: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      {lang === 'ru'
                        ? '✨ У вас полный доступ ко всему контенту!'
                        : '✨ Ai acces complet la tot conținutul!'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* История платежей */}
        {user.paymentHistory && user.paymentHistory.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" fontWeight={600}>
                    {lang === 'ru' ? 'История платежей' : 'Istoric plăți'}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ overflowX: 'auto' }}>
                  {user.paymentHistory
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((payment: any, index: number) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{ p: 2, mb: 2, '&:last-child': { mb: 0 } }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              {lang === 'ru' ? 'Тариф' : 'Tarif'}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {payment.fromTier.toUpperCase()} → {payment.toTier.toUpperCase()}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              {lang === 'ru' ? 'Дата' : 'Dată'}
                            </Typography>
                            <Typography variant="body1">
                              {new Date(payment.date).toLocaleDateString(
                                lang === 'ru' ? 'ru-RU' : 'ro-RO'
                              )}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary">
                              {lang === 'ru' ? 'Сумма' : 'Sumă'}
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="success.main">
                              ${payment.amount}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary">
                              {lang === 'ru' ? 'Метод' : 'Metodă'}
                            </Typography>
                            <Typography variant="body1">
                              {payment.paymentMethod.toUpperCase()}
                            </Typography>
                          </Grid>

                          {payment.paypalOrderId && (
                            <Grid item xs={12} sm={2}>
                              <Typography variant="body2" color="text.secondary">
                                Order ID
                              </Typography>
                              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                {payment.paypalOrderId.substring(0, 16)}...
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Telegram Integration */}
        <Grid item xs={12}>
          <TelegramSettings />
        </Grid>

        {/* Email Notifications */}
        <Grid item xs={12}>
          <EmailNotificationSettings />
        </Grid>
      </Grid>
    </Container>
  )
}

export default ProfilePage
