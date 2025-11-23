import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container, Typography, Box, Button, CircularProgress, Paper, Chip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Model3DViewer from '@/components/Model3DViewer'
import { getAnatomyModel3DById } from '@/services/api'
import type { AnatomyModel3D } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

const AnatomyModel3DViewerPage = () => {
  const { id } = useParams<{ id: string }>()
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const navigate = useNavigate()
  const [model, setModel] = useState<AnatomyModel3D | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModel = async () => {
      if (!id) return
      try {
        const data = await getAnatomyModel3DById(id)
        setModel(data)
      } catch (error) {
        console.error('Error fetching model:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchModel()
  }, [id])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!model) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">{lang === 'ru' ? 'Модель не найдена' : 'Modelul nu a fost găsit'}</Typography>
        <Button onClick={() => navigate('/anatomy-models-3d')} sx={{ mt: 2 }}>{lang === 'ru' ? 'Назад' : 'Înapoi'}</Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/anatomy-models-3d')} sx={{ mb: 2 }}>
        {lang === 'ru' ? 'Назад к списку' : 'Înapoi la listă'}
      </Button>

      <Typography variant="h4" gutterBottom fontWeight={700}>
        {model.name[lang]}
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="body1" paragraph>
          {model.description[lang]}
        </Typography>
        {model.tags && model.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {model.tags.map((tag, index) => (
              <Chip key={index} label={tag[lang]} size="small" />
            ))}
          </Box>
        )}
      </Paper>

      <Model3DViewer
        modelUrl={model.modelUrl.startsWith('http') ? model.modelUrl : `${API_BASE_URL}${model.modelUrl}`}
        caption={model.name[lang]}
        autoRotate={true}
      />
    </Container>
  )
}

export default AnatomyModel3DViewerPage
