import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SpaIcon from '@mui/icons-material/Spa'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import BarChartIcon from '@mui/icons-material/BarChart'
import { getMassageProtocols } from '@/services/api'
import type { MassageProtocol } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

const MassageProtocolsPage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [protocols, setProtocols] = useState<MassageProtocol[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        setLoading(true)
        const data = await getMassageProtocols()
        setProtocols(data)
      } catch (error) {
        console.error('Failed to fetch massage protocols:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProtocols()
  }, [])

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      beginner: lang === 'ru' ? 'Начальный' : 'Începător',
      intermediate: lang === 'ru' ? 'Средний' : 'Intermediar',
      advanced: lang === 'ru' ? 'Продвинутый' : 'Avansat',
    }
    return labels[difficulty as keyof typeof labels] || difficulty
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error',
    }
    return colors[difficulty as keyof typeof colors] || 'default'
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          {t('nav.home')}
        </Link>
        <Typography color="text.primary">
          {lang === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <SpaIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {lang === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          {lang === 'ru'
            ? 'Изучите различные техники массажа с подробными описаниями, иллюстрациями и видео-уроками'
            : 'Învățați diferite tehnici de masaj cu descrieri detaliate, ilustrații și lecții video'}
        </Typography>
      </Box>

      {/* Protocols Grid */}
      <Grid container spacing={3}>
        {protocols.map((protocol) => (
          <Grid item xs={12} sm={6} md={4} key={protocol._id}>
            <Card
              component={RouterLink}
              to={`/massage-protocols/${protocol.slug}`}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              {protocol.images && protocol.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`${API_BASE_URL}${protocol.images[0].url}`}
                  alt={protocol.name[lang]}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  {protocol.name[lang]}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                  {protocol.description[lang]}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  <Chip
                    icon={<BarChartIcon />}
                    label={getDifficultyLabel(protocol.difficulty)}
                    size="small"
                    color={getDifficultyColor(protocol.difficulty) as any}
                  />
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={`${protocol.duration} ${lang === 'ru' ? 'мин' : 'min'}`}
                    size="small"
                    variant="outlined"
                  />
                  {protocol.videos && protocol.videos.length > 0 && (
                    <Chip
                      label={`${protocol.videos.length} ${lang === 'ru' ? 'видео' : 'video'}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {protocols.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {lang === 'ru' ? 'Протоколы массажа пока не добавлены' : 'Nu există protocoale de masaj încă'}
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default MassageProtocolsPage
