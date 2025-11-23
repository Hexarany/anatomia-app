import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  Paper,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CleanHandsIcon from '@mui/icons-material/CleanHands'
import SanitizerIcon from '@mui/icons-material/Sanitizer'
import AccessibleIcon from '@mui/icons-material/Accessible'
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import EnhancedMarkdown from '@/components/EnhancedMarkdown'
import { getHygieneGuidelines } from '@/services/api'
import type { HygieneGuideline } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

const categoryConfig = {
  sterilization: {
    icon: CleanHandsIcon,
    color: '#2196f3',
    nameRu: 'Методы стерилизации',
    nameRo: 'Metode de sterilizare',
  },
  disinfection: {
    icon: SanitizerIcon,
    color: '#4caf50',
    nameRu: 'Методы дезинфекции',
    nameRo: 'Metode de dezinfecție',
  },
  ergonomics: {
    icon: AccessibleIcon,
    color: '#ff9800',
    nameRu: 'Эргономика',
    nameRo: 'Ergonomie',
  },
  office_requirements: {
    icon: BusinessIcon,
    color: '#9c27b0',
    nameRu: 'Требования к кабинету',
    nameRo: 'Cerințe pentru cabinet',
  },
  therapist_requirements: {
    icon: PersonIcon,
    color: '#f44336',
    nameRu: 'Требования к массажисту',
    nameRo: 'Cerințe pentru terapeut',
  },
  dress_code: {
    icon: CheckroomIcon,
    color: '#00bcd4',
    nameRu: 'Форма одежды',
    nameRo: 'Cod vestimentar',
  },
}

const HygieneGuidelinesPage = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [guidelines, setGuidelines] = useState<HygieneGuideline[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<string | false>(false)

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        setLoading(true)
        const data = await getHygieneGuidelines()
        setGuidelines(data)
      } catch (error) {
        console.error('Failed to fetch hygiene guidelines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuidelines()
  }, [])

  const handleAccordionChange = (category: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCategory(isExpanded ? category : false)
  }

  const getCategoryGuidelines = (category: string) => {
    return guidelines.filter((g) => g.category === category)
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {lang === 'ru' ? 'Профессиональные стандарты и гигиена' : 'Standarde profesionale și igienă'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru'
            ? 'Важные рекомендации по гигиене, стерилизации и профессиональным стандартам для массажистов'
            : 'Recomandări importante privind igiena, sterilizarea și standardele profesionale pentru terapeuți'}
        </Typography>
      </Box>

      {/* Categories */}
      {Object.entries(categoryConfig).map(([category, config]) => {
        const categoryGuidelines = getCategoryGuidelines(category)
        const Icon = config.icon

        if (categoryGuidelines.length === 0) return null

        return (
          <Accordion
            key={category}
            expanded={expandedCategory === category}
            onChange={handleAccordionChange(category)}
            elevation={2}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: expandedCategory === category ? `${config.color}15` : 'background.paper',
                '&:hover': { bgcolor: `${config.color}10` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icon sx={{ color: config.color, fontSize: 32 }} />
                <Typography variant="h6" fontWeight={600}>
                  {lang === 'ru' ? config.nameRu : config.nameRo}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {categoryGuidelines.map((guideline) => (
                <Box key={guideline._id} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color={config.color}>
                    {guideline.title[lang]}
                  </Typography>

                  {/* Content */}
                  <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', mb: 2 }}>
                    <EnhancedMarkdown>{guideline.content[lang]}</EnhancedMarkdown>
                  </Paper>

                  {/* Images */}
                  {guideline.images && guideline.images.length > 0 && (
                    <Grid container spacing={2}>
                      {guideline.images.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} key={image._id || index}>
                          <Card elevation={1}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={`${API_BASE_URL}${image.url}`}
                              alt={image.caption?.[lang] || guideline.title[lang]}
                              sx={{ objectFit: 'cover' }}
                            />
                            {image.caption && image.caption[lang] && (
                              <Box sx={{ p: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {image.caption[lang]}
                                </Typography>
                              </Box>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )
      })}

      {/* Empty State */}
      {guidelines.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {lang === 'ru' ? 'Нет доступных рекомендаций' : 'Nu există recomandări disponibile'}
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default HygieneGuidelinesPage
