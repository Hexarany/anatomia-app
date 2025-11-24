import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Alert,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import WarningIcon from '@mui/icons-material/Warning'
import { getTriggerPointById } from '@/services/api'
import type { TriggerPoint } from '@/types'
import EnhancedMarkdown from '@/components/EnhancedMarkdown'

const TriggerPointDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const navigate = useNavigate()
  const [point, setPoint] = useState<TriggerPoint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPoint()
  }, [id])

  const loadPoint = async () => {
    if (!id) return
    try {
      const data = await getTriggerPointById(id)
      setPoint(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      beginner: { ru: 'Начальный уровень', ro: 'Nivel începător' },
      intermediate: { ru: 'Средний уровень', ro: 'Nivel intermediar' },
      advanced: { ru: 'Продвинутый уровень', ro: 'Nivel avansat' },
    }
    return labels[difficulty as keyof typeof labels]?.[lang] || difficulty
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = { beginner: 'success', intermediate: 'warning', advanced: 'error' }
    return colors[difficulty as keyof typeof colors] || 'default'
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!point) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">
          {lang === 'ru' ? 'Триггерная точка не найдена' : 'Punctul trigger nu a fost găsit'}
        </Typography>
        <Button onClick={() => navigate('/trigger-points')} sx={{ mt: 2 }}>
          {lang === 'ru' ? 'Назад' : 'Înapoi'}
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/trigger-points')}
        sx={{ mb: 2 }}
      >
        {lang === 'ru' ? 'Назад к списку' : 'Înapoi la listă'}
      </Button>

      <Typography variant="h4" gutterBottom fontWeight={700}>
        {point.name[lang]}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          label={getDifficultyLabel(point.difficulty)}
          color={getDifficultyColor(point.difficulty) as any}
          variant="outlined"
        />
        <Chip label={point.muscle} variant="outlined" />
      </Box>

      {point.difficulty === 'advanced' && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          {lang === 'ru'
            ? 'Внимание! Работа с этой точкой требует продвинутых навыков. Рекомендуется консультация специалиста.'
            : 'Atenție! Lucrul cu acest punct necesită abilități avansate. Se recomandă consultarea unui specialist.'}
        </Alert>
      )}

      {/* Локализация */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {lang === 'ru' ? 'Локализация' : 'Localizare'}
        </Typography>
        <Typography variant="body1">{point.location[lang]}</Typography>
      </Paper>

      {/* Симптомы */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {lang === 'ru' ? 'Симптомы' : 'Simptome'}
        </Typography>
        <Typography variant="body1">{point.symptoms[lang]}</Typography>
      </Paper>

      {/* Паттерн иррадиации */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {lang === 'ru' ? 'Паттерн иррадиации боли' : 'Modelul de iradiere a durerii'}
        </Typography>
        <Typography variant="body1">{point.referralPattern[lang]}</Typography>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Техника массажа */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          {lang === 'ru' ? 'Техника массажа' : 'Tehnica de masaj'}
        </Typography>
        <EnhancedMarkdown>{point.technique[lang]}</EnhancedMarkdown>
      </Paper>

      {/* Противопоказания */}
      {point.contraindications && (point.contraindications.ru || point.contraindications.ro) && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'error.50', borderLeft: 4, borderColor: 'error.main' }}>
          <Typography variant="h6" gutterBottom fontWeight={600} color="error">
            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {lang === 'ru' ? 'Противопоказания' : 'Contraindicații'}
          </Typography>
          <Typography variant="body1">{point.contraindications[lang]}</Typography>
        </Paper>
      )}

      {/* Изображения */}
      {point.images && point.images.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {lang === 'ru' ? 'Иллюстрации' : 'Ilustrații'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {point.images.map((img, index) => (
              <Box key={index} sx={{ maxWidth: '100%' }}>
                <img
                  src={img.url}
                  alt={img.caption?.[lang] || point.name[lang]}
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                />
                {img.caption && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {img.caption[lang]}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Видео */}
      {point.videos && point.videos.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {lang === 'ru' ? 'Видео' : 'Video'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            {point.videos.map((video, index) => (
              <Box key={index}>
                <video
                  controls
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                  src={video.url}
                >
                  {lang === 'ru' ? 'Ваш браузер не поддерживает видео' : 'Browser-ul dvs. nu acceptă video'}
                </video>
                {video.caption && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {video.caption[lang]}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 4, p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {lang === 'ru'
            ? 'Информация предоставлена в образовательных целях. Перед применением любых техник проконсультируйтесь со специалистом.'
            : 'Informațiile sunt furnizate în scopuri educaționale. Înainte de a aplica orice tehnici, consultați un specialist.'}
        </Typography>
      </Box>
    </Container>
  )
}

export default TriggerPointDetailPage
