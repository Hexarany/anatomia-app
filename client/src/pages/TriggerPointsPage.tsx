import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { getTriggerPoints } from '@/services/api'
import type { TriggerPoint } from '@/types'

const categories = [
  { value: 'all', labelRu: 'Все', labelRo: 'Toate' },
  { value: 'head_neck', labelRu: 'Голова/Шея', labelRo: 'Cap/Gât' },
  { value: 'shoulder_arm', labelRu: 'Плечо/Рука', labelRo: 'Umăr/Braț' },
  { value: 'back', labelRu: 'Спина', labelRo: 'Spate' },
  { value: 'chest', labelRu: 'Грудь', labelRo: 'Piept' },
  { value: 'hip_leg', labelRu: 'Бедро/Нога', labelRo: 'Șold/Picior' },
  { value: 'other', labelRu: 'Другое', labelRo: 'Altele' },
]

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
} as const

const TriggerPointsPage = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const navigate = useNavigate()
  const [points, setPoints] = useState<TriggerPoint[]>([])
  const [filteredPoints, setFilteredPoints] = useState<TriggerPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    loadPoints()
  }, [])

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredPoints(points)
    } else {
      setFilteredPoints(points.filter(p => p.category === activeCategory))
    }
  }, [activeCategory, points])

  const loadPoints = async () => {
    try {
      const data = await getTriggerPoints()
      setPoints(data)
      setFilteredPoints(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      beginner: { ru: 'Начальный', ro: 'Începător' },
      intermediate: { ru: 'Средний', ro: 'Intermediar' },
      advanced: { ru: 'Продвинутый', ro: 'Avansat' },
    }
    return labels[difficulty as keyof typeof labels]?.[lang] || difficulty
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          fontWeight={700}
          sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
        >
          {lang === 'ru' ? 'Триггерные точки' : 'Puncte Trigger'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {lang === 'ru'
            ? 'Изучите локализацию, симптомы и техники работы с триггерными точками'
            : 'Studiați localizarea, simptomele și tehnicile de lucru cu punctele trigger'}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeCategory}
          onChange={(_, newValue) => setActiveCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab
              key={cat.value}
              value={cat.value}
              label={lang === 'ru' ? cat.labelRu : cat.labelRo}
            />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {filteredPoints.map((point) => (
          <Grid item xs={12} sm={6} md={4} key={point._id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {point.name[lang]}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>{lang === 'ru' ? 'Мышца:' : 'Mușchi:'}</strong> {point.muscle}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {point.symptoms[lang].substring(0, 100)}...
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Chip
                    label={getDifficultyLabel(point.difficulty)}
                    size="small"
                    color={difficultyColors[point.difficulty]}
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => navigate(`/trigger-points/${point._id}`)}
                  fullWidth
                  variant="contained"
                >
                  {lang === 'ru' ? 'Подробнее' : 'Detalii'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPoints.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            {lang === 'ru' ? 'Нет триггерных точек в этой категории' : 'Nu există puncte trigger în această categorie'}
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default TriggerPointsPage
