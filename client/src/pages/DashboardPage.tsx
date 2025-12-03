import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import SchoolIcon from '@mui/icons-material/School'
import QuizIcon from '@mui/icons-material/Quiz'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAuth } from '@/contexts/AuthContext'
import { useProgress } from '@/contexts/ProgressContext'
import { getUserCertificates, getAvailableCertificates, type Certificate, type AvailableCertificate } from '@/services/api'

const DashboardPage = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { progress, loading } = useProgress()
  const lang = i18n.language as 'ru' | 'ro'
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [availableCerts, setAvailableCerts] = useState<AvailableCertificate[]>([])
  const [certsLoading, setCertsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadCertificates()
  }, [isAuthenticated, navigate])

  const loadCertificates = async () => {
    try {
      setCertsLoading(true)
      const [earnedResponse, availableResponse] = await Promise.all([
        getUserCertificates(),
        getAvailableCertificates(),
      ])
      setCertificates(earnedResponse.certificates)
      setAvailableCerts(availableResponse.certificates)
    } catch (err) {
      console.error('Error loading certificates:', err)
    } finally {
      setCertsLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!progress) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">
          {lang === 'ru' ? 'Прогресс не найден' : 'Progres nu a fost găsit'}
        </Typography>
      </Container>
    )
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return lang === 'ru' ? `${hours}ч ${minutes}м` : `${hours}h ${minutes}m`
    }
    return lang === 'ru' ? `${minutes} минут` : `${minutes} minute`
  }

  const stats = [
    {
      icon: <LocalFireDepartmentIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      title: lang === 'ru' ? 'Серия дней' : 'Serie de zile',
      value: progress.stats.streak,
      subtitle: lang === 'ru'
        ? `Рекорд: ${progress.stats.longestStreak} дней`
        : `Record: ${progress.stats.longestStreak} zile`,
      color: 'error.light',
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: lang === 'ru' ? 'Изучено тем' : 'Teme studiate',
      value: progress.stats.totalTopicsCompleted,
      subtitle: lang === 'ru' ? 'Завершено' : 'Finalizate',
      color: 'primary.light',
    },
    {
      icon: <QuizIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: lang === 'ru' ? 'Тесты пройдены' : 'Teste trecute',
      value: progress.stats.totalQuizzesPassed,
      subtitle: lang === 'ru'
        ? `Средний балл: ${progress.stats.averageQuizScore}%`
        : `Medie: ${progress.stats.averageQuizScore}%`,
      color: 'success.light',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      title: lang === 'ru' ? 'Время обучения' : 'Timp de studiu',
      value: formatTime(progress.stats.totalStudyTime),
      subtitle: lang === 'ru' ? 'Всего' : 'Total',
      color: 'info.light',
    },
  ]

  const protocolsViewedCount = progress.viewedProtocols.length
  const guidelinesViewedCount = progress.viewedGuidelines.length
  const models3DViewedCount = progress.viewed3DModels.length
  const triggerPointsViewedCount = progress.viewedTriggerPoints.length

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          <TrendingUpIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
          {lang === 'ru' ? 'Мой прогресс' : 'Progresul meu'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru'
            ? 'Отслеживайте свои достижения и статистику обучения'
            : 'Urmăriți realizările și statisticile dvs. de învățare'}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 2,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Content Progress */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          {lang === 'ru' ? 'Просмотрено контента' : 'Conținut vizualizat'}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {lang === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj'}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {protocolsViewedCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((protocolsViewedCount / 20) * 100, 100)}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {lang === 'ru' ? '3D Модели' : 'Modele 3D'}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {models3DViewedCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((models3DViewedCount / 10) * 100, 100)}
                sx={{ height: 8, borderRadius: 1 }}
                color="secondary"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {lang === 'ru' ? 'Триггерные точки' : 'Puncte Trigger'}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {triggerPointsViewedCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((triggerPointsViewedCount / 15) * 100, 100)}
                sx={{ height: 8, borderRadius: 1 }}
                color="success"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {lang === 'ru' ? 'Гигиена и стандарты' : 'Igienă și standarde'}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {guidelinesViewedCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((guidelinesViewedCount / 5) * 100, 100)}
                sx={{ height: 8, borderRadius: 1 }}
                color="warning"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Achievements */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          <EmojiEventsIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
          {lang === 'ru' ? 'Достижения' : 'Realizări'}
          <Chip
            label={`${progress.achievements.length}/9`}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        </Typography>

        {progress.achievements.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {lang === 'ru'
                ? 'Начните обучение, чтобы разблокировать достижения!'
                : 'Începeți să învățați pentru a debloca realizări!'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {progress.achievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement.achievementId}>
                <Card
                  elevation={0}
                  sx={{
                    border: '2px solid',
                    borderColor: 'warning.light',
                    bgcolor: 'warning.50',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" component="div" sx={{ mb: 1 }}>
                        {achievement.icon}
                      </Typography>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {achievement.title[lang]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description[lang]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(achievement.unlockedAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'ro-RO')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Certificates Section */}
      <Paper elevation={0} sx={{ p: 3, mt: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            <WorkspacePremiumIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            {lang === 'ru' ? 'Сертификаты' : 'Certificate'}
            {certificates.length > 0 && (
              <Chip
                label={certificates.length}
                size="small"
                color="success"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/certificates')}
          >
            {lang === 'ru' ? 'Все сертификаты' : 'Toate certificatele'}
          </Button>
        </Box>

        {certsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : certificates.length === 0 && availableCerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <WorkspacePremiumIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {lang === 'ru'
                ? 'Продолжайте обучение, чтобы получить сертификаты!'
                : 'Continuați să învățați pentru a obține certificate!'}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Earned Certificates */}
            {certificates.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                  {lang === 'ru' ? 'Полученные сертификаты' : 'Certificate obținute'}
                </Typography>
                <Grid container spacing={2}>
                  {certificates.slice(0, 3).map((cert) => (
                    <Grid item xs={12} sm={4} key={cert._id}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '2px solid',
                          borderColor: 'success.light',
                          bgcolor: 'success.50',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                        }}
                        onClick={() => navigate('/certificates')}
                      >
                        <CardContent>
                          <Box sx={{ textAlign: 'center' }}>
                            <WorkspacePremiumIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                              {cert.title[lang]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {new Date(cert.issuedAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'ro-RO')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {certificates.length > 3 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                    {lang === 'ru' ? `+ ещё ${certificates.length - 3}` : `+ încă ${certificates.length - 3}`}
                  </Typography>
                )}
              </Box>
            )}

            {/* Available Certificates Preview */}
            {availableCerts.some(cert => cert.eligible) && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, color: 'success.main' }}>
                  {lang === 'ru' ? 'Доступны для получения' : 'Disponibile pentru obținere'}
                </Typography>
                <Grid container spacing={2}>
                  {availableCerts
                    .filter(cert => cert.eligible && !certificates.some(ec => ec.certificateType === cert.type))
                    .slice(0, 3)
                    .map((cert) => (
                      <Grid item xs={12} sm={4} key={cert.type}>
                        <Card
                          elevation={0}
                          sx={{
                            border: '2px solid',
                            borderColor: 'primary.light',
                            bgcolor: 'primary.50',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'scale(1.02)',
                            },
                          }}
                          onClick={() => navigate('/certificates')}
                        >
                          <CardContent>
                            <Box sx={{ textAlign: 'center' }}>
                              <WorkspacePremiumIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                              <Typography variant="body2" fontWeight="bold" gutterBottom>
                                {cert.title[lang]}
                              </Typography>
                              <Chip
                                label={lang === 'ru' ? 'Получить' : 'Obține'}
                                size="small"
                                color="primary"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  )
}

export default DashboardPage
