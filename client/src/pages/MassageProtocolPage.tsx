import { useEffect, useState } from 'react'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Paper,
  Chip,
  Dialog,
  IconButton,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SpaIcon from '@mui/icons-material/Spa'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import InfoIcon from '@mui/icons-material/Info'
import FavoriteIcon from '@mui/icons-material/Favorite'
import WarningIcon from '@mui/icons-material/Warning'
import SchoolIcon from '@mui/icons-material/School'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import BarChartIcon from '@mui/icons-material/BarChart'
import EnhancedMarkdown from '@/components/EnhancedMarkdown'
import ContentLock from '@/components/ContentLock'
import { getMassageProtocolById } from '@/services/api'
import type { MassageProtocol } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const MassageProtocolPage = () => {
  const { protocolId } = useParams<{ protocolId: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const lang = i18n.language as 'ru' | 'ro'

  const [protocol, setProtocol] = useState<MassageProtocol | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchProtocol = async () => {
      if (!protocolId) return

      try {
        setLoading(true)
        const data = await getMassageProtocolById(protocolId)
        setProtocol(data)
      } catch (error) {
        console.error('Failed to fetch protocol:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProtocol()
  }, [protocolId, isAuthenticated])

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  const handleCloseLightbox = () => {
    setLightboxOpen(false)
  }

  const handlePrevImage = () => {
    if (!protocol?.images) return
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : protocol.images.length - 1))
  }

  const handleNextImage = () => {
    if (!protocol?.images) return
    setSelectedImageIndex((prev) => (prev < protocol.images.length - 1 ? prev + 1 : 0))
  }

  const getPreviewText = (content: string) => {
    if (!content) return ''
    return content.substring(0, 300) + '...'
  }

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

  if (!protocol) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">
          {lang === 'ru' ? 'Протокол не найден' : 'Protocolul nu a fost găsit'}
        </Typography>
        <Button onClick={() => navigate('/massage-protocols')} sx={{ mt: 2 }}>
          {lang === 'ru' ? 'Назад' : 'Înapoi'}
        </Button>
      </Container>
    )
  }

  const hasImages = protocol.images && protocol.images.length > 0
  const hasVideos = protocol.videos && protocol.videos.length > 0

  let tabIndex = 1
  const benefitsTabIndex = tabIndex++
  const contraindicationsTabIndex = tabIndex++
  const techniqueTabIndex = tabIndex++
  const imagesTabIndex = hasImages ? tabIndex++ : -1
  const videosTabIndex = hasVideos ? tabIndex++ : -1

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        component={RouterLink}
        to="/massage-protocols"
        sx={{ mb: 2 }}
        variant="outlined"
      >
        {lang === 'ru' ? 'Назад' : 'Înapoi'}
      </Button>

      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          {t('nav.home')}
        </Link>
        <Link component={RouterLink} to="/massage-protocols" color="inherit">
          {lang === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj'}
        </Link>
        <Typography color="text.primary">{protocol.name[lang]}</Typography>
      </Breadcrumbs>

      {/* Protocol Header */}
      <Paper elevation={0} sx={{ mb: 4, p: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <SpaIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {protocol.name[lang]}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {protocol.description[lang]}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Chip
                icon={<BarChartIcon />}
                label={getDifficultyLabel(protocol.difficulty)}
                color={getDifficultyColor(protocol.difficulty) as any}
              />
              <Chip
                icon={<AccessTimeIcon />}
                label={`${protocol.duration} ${lang === 'ru' ? 'минут' : 'minute'}`}
                variant="outlined"
              />
              {hasVideos && (
                <Chip
                  icon={<VideoLibraryIcon />}
                  label={`${protocol.videos.length} ${lang === 'ru' ? 'видео' : 'video'}`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label={lang === 'ru' ? 'Описание' : 'Descriere'} icon={<InfoIcon />} iconPosition="start" />
          <Tab label={lang === 'ru' ? 'Польза' : 'Beneficii'} icon={<FavoriteIcon />} iconPosition="start" />
          <Tab label={lang === 'ru' ? 'Противопоказания' : 'Contraindicații'} icon={<WarningIcon />} iconPosition="start" />
          <Tab label={lang === 'ru' ? 'Техника' : 'Tehnică'} icon={<SchoolIcon />} iconPosition="start" />
          {hasImages && <Tab label={`${lang === 'ru' ? 'Иллюстрации' : 'Ilustrații'} (${protocol.images.length})`} icon={<ImageIcon />} iconPosition="start" />}
          {hasVideos && <Tab label={`${lang === 'ru' ? 'Видео' : 'Video'} (${protocol.videos.length})`} icon={<VideoLibraryIcon />} iconPosition="start" />}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {isAuthenticated ? (
            <EnhancedMarkdown>{protocol.content[lang]}</EnhancedMarkdown>
          ) : (
            <ContentLock previewText={getPreviewText(protocol.content[lang])} />
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={benefitsTabIndex}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {isAuthenticated ? (
            <EnhancedMarkdown>{protocol.benefits[lang] || (lang === 'ru' ? 'Информация скоро появится' : 'Informațiile vor apărea în curând')}</EnhancedMarkdown>
          ) : (
            <ContentLock previewText={getPreviewText(protocol.benefits[lang] || '')} />
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={contraindicationsTabIndex}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {isAuthenticated ? (
            <EnhancedMarkdown>{protocol.contraindications[lang] || (lang === 'ru' ? 'Информация скоро появится' : 'Informațiile vor apărea în curând')}</EnhancedMarkdown>
          ) : (
            <ContentLock previewText={getPreviewText(protocol.contraindications[lang] || '')} />
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={techniqueTabIndex}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {isAuthenticated ? (
            <EnhancedMarkdown>{protocol.technique[lang] || (lang === 'ru' ? 'Информация скоро появится' : 'Informațiile vor apărea în curând')}</EnhancedMarkdown>
          ) : (
            <ContentLock previewText={getPreviewText(protocol.technique[lang] || '')} />
          )}
        </Paper>
      </TabPanel>

      {hasImages && (
        <TabPanel value={activeTab} index={imagesTabIndex}>
          <Grid container spacing={3}>
            {protocol.images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={image._id || index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 6,
                    }
                  }}
                  onClick={() => handleImageClick(index)}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={`${API_BASE_URL}${image.url}`}
                    alt={image.caption?.[lang] || protocol.name[lang]}
                    sx={{ objectFit: 'cover' }}
                  />
                  {image.caption && image.caption[lang] && (
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {image.caption[lang]}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      )}

      {hasVideos && (
        <TabPanel value={activeTab} index={videosTabIndex}>
          <Grid container spacing={3}>
            {protocol.videos.map((video, index) => (
              <Grid item xs={12} md={6} key={video._id || index}>
                <Card elevation={2}>
                  <Box sx={{ position: 'relative', paddingTop: '56.25%', backgroundColor: 'black' }}>
                    <video
                      controls
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                      src={`${API_BASE_URL}${video.url}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                  {video.caption && video.caption[lang] && (
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {video.caption[lang]}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      )}

      {/* Lightbox */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            boxShadow: 'none',
            m: 0,
            maxHeight: '100vh',
            maxWidth: '100vw',
          }
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>

          {protocol && protocol.images.length > 1 && (
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 16,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
          )}

          {protocol && protocol.images[selectedImageIndex] && (
            <Box sx={{ maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                component="img"
                src={`${API_BASE_URL}${protocol.images[selectedImageIndex].url}`}
                alt={protocol.images[selectedImageIndex].caption?.[lang] || protocol.name[lang]}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
              {protocol.images[selectedImageIndex].caption?.[lang] && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'white',
                    mt: 2,
                    textAlign: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    px: 3,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  {protocol.images[selectedImageIndex].caption[lang]}
                </Typography>
              )}
            </Box>
          )}

          {protocol && protocol.images.length > 1 && (
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 16,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          )}

          {protocol && protocol.images.length > 1 && (
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                bottom: 16,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              {selectedImageIndex + 1} / {protocol.images.length}
            </Typography>
          )}
        </Box>
      </Dialog>
    </Container>
  )
}

export default MassageProtocolPage
