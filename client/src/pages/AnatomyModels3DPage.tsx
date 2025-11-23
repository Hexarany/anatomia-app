import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Box, Chip, CircularProgress } from '@mui/material'
import View3DIcon from '@mui/icons-material/ViewInAr'
import { getAnatomyModels3D } from '@/services/api'
import type { AnatomyModel3D } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

const AnatomyModels3DPage = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const navigate = useNavigate()
  const [models, setModels] = useState<AnatomyModel3D[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getAnatomyModels3D()
        setModels(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchModels()
  }, [])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  const categoryNames = {
    bones: { ru: 'Кости', ro: 'Oase' },
    muscles: { ru: 'Мышцы', ro: 'Mușchi' },
    organs: { ru: 'Органы', ro: 'Organe' },
    nervous_system: { ru: 'Нервная система', ro: 'Sistemul nervos' },
    cardiovascular_system: { ru: 'Сердечно-сосудистая', ro: 'Cardiovascular' },
    other: { ru: 'Другое', ro: 'Altele' },
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
          {lang === 'ru' ? 'Интерактивные 3D модели' : 'Modele 3D interactive'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {lang === 'ru' ? 'Изучайте анатомию с помощью интерактивных 3D моделей' : 'Studiați anatomia cu ajutorul modelelor 3D interactive'}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {models.map((model) => (
          <Grid item xs={12} sm={6} md={4} key={model._id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {model.previewImage && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`${API_BASE_URL}${model.previewImage}`}
                  alt={model.name[lang]}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {model.name[lang]}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {model.description[lang]}
                </Typography>
                <Chip
                  label={categoryNames[model.category][lang]}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<View3DIcon />}
                  onClick={() => navigate(`/anatomy-models-3d/${model._id}`)}
                  fullWidth
                  variant="contained"
                >
                  {lang === 'ru' ? 'Открыть модель' : 'Deschide modelul'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default AnatomyModels3DPage
