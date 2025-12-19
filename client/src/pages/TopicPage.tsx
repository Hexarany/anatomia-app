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
  Dialog,
  IconButton,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Model3DViewer from '@/components/Model3DViewer'
import EnhancedMarkdown from '@/components/EnhancedMarkdown'
import AccessGate from '@/components/AccessGate'
import BookmarkButton from '@/components/BookmarkButton'
import { getTopicById } from '@/services/api'
import type { Topic } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useProgress } from '@/contexts/ProgressContext'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useMainButton } from '@/contexts/MainButtonContext'
import { useTelegram } from '@/contexts/TelegramContext'

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

const TopicPage = () => {
  const { topicId } = useParams<{ topicId: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { hasAccess, isAuthenticated } = useAuth()
  const { markTopicComplete, isTopicCompleted } = useProgress()
  const { setMainButton, hideMainButton } = useMainButton()
  const { isInTelegram } = useTelegram()
  const lang = i18n.language as 'ru' | 'ro'

  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId) return

      try {
        setLoading(true)
        const data = await getTopicById(topicId)
        setTopic(data)
      } catch (error) {
        console.error('Failed to fetch topic:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopic()
  }, [topicId])

  // Telegram MainButton integration
  const isCompleted = topicId ? isTopicCompleted(topicId) : false

  useEffect(() => {
    if (!isInTelegram) return

    if (isAuthenticated && !isCompleted && !loading) {
      setMainButton({
        text: lang === 'ru' ? 'Завершить тему' : 'Finalizează tema',
        onClick: handleCompleteClick,
        disabled: completing,
        progress: completing
      })
    } else {
      hideMainButton()
    }

    return () => hideMainButton()
  }, [isInTelegram, isAuthenticated, isCompleted, completing, loading, lang, setMainButton, hideMainButton])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!topic) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Тема не найдена</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Назад
        </Button>
      </Container>
    )
  }

  const hasImages = topic.images && topic.images.length > 0
  const hasVideos = topic.videos && topic.videos.length > 0
  const has3DModel = !!topic.model3D

  let tabIndex = 1
  const modelTabIndex = has3DModel ? tabIndex++ : -1
  const imagesTabIndex = hasImages ? tabIndex++ : -1
  const videosTabIndex = hasVideos ? tabIndex++ : -1

  const getPreviewText = (content: string) => {
    if (!content) return ''
    return content.substring(0, 300) + '...'
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  const handleCloseLightbox = () => {
    setLightboxOpen(false)
  }

  const handlePrevImage = () => {
    if (!topic?.images) return
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : topic.images.length - 1))
  }

  const handleNextImage = () => {
    if (!topic?.images) return
    setSelectedImageIndex((prev) => (prev < topic.images.length - 1 ? prev + 1 : 0))
  }

  const handleCompleteClick = async () => {
    if (!topicId || !isAuthenticated) return
    try {
      setCompleting(true)
      await markTopicComplete(topicId, 0)
    } catch (error) {
      console.error('Error marking topic complete:', error)
    } finally {
      setCompleting(false)
    }
  }

  // Get category ID - handle both string and populated object
  const categoryId = typeof topic.categoryId === 'string'
    ? topic.categoryId
    : topic.categoryId._id

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        component={RouterLink}
        to={`/category/${categoryId}`}
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
        <Link component={RouterLink} to={`/category/${categoryId}`} color="inherit">
          {t('nav.categories')}
        </Link>
        <Typography color="text.primary">{topic.name[lang]}</Typography>
      </Breadcrumbs>

      {/* Topic Header */}
      <Paper elevation={0} sx={{ mb: 4, p: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <FitnessCenterIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                {topic.name[lang]}
              </Typography>
              <BookmarkButton contentType="topic" contentId={topicId || ''} />
              {isAuthenticated && (
                <Button
                  variant={isCompleted ? "outlined" : "contained"}
                  color={isCompleted ? "success" : "primary"}
                  startIcon={<CheckCircleIcon />}
                  onClick={handleCompleteClick}
                  disabled={completing || isCompleted}
                  sx={{ minWidth: '180px' }}
                >
                  {isCompleted
                    ? (lang === 'ru' ? 'Завершено' : 'Finalizat')
                    : (lang === 'ru' ? 'Завершить тему' : 'Finalizează tema')
                  }
                </Button>
              )}
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 1 }}>
              {topic.description[lang]}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label={t('topic.description')} icon={<FitnessCenterIcon />} iconPosition="start" />
          {has3DModel && <Tab label={t('topic.3dModel')} icon={<ViewInArIcon />} iconPosition="start" />}
          {hasImages && <Tab label={`${t('topic.images')} (${topic.images.length})`} icon={<ImageIcon />} iconPosition="start" />}
          {hasVideos && <Tab label={`${t('topic.videos')} (${topic.videos.length})`} icon={<VideoLibraryIcon />} iconPosition="start" />}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <AccessGate
          requiredTier="basic"
          preview={lang === 'ru' ? 'Для просмотра полного содержания темы требуется тариф Basic или Premium.' : 'Vizualizarea conținutului complet necesită acces Basic sau Premium.'}
          contentType={lang === 'ru' ? 'содержание темы' : 'conținut temă'}
        >
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <EnhancedMarkdown>{topic.content[lang]}</EnhancedMarkdown>
          </Paper>
        </AccessGate>
      </TabPanel>

      {has3DModel && (
        <TabPanel value={activeTab} index={modelTabIndex}>
          <AccessGate
            requiredTier="basic"
            preview={lang === 'ru' ? 'Для просмотра 3D модели требуется тариф Basic или Premium.' : 'Vizualizarea modelului 3D necesită acces Basic sau Premium.'}
            contentType={lang === 'ru' ? '3D модель' : 'model 3D'}
          >
            <Model3DViewer modelUrl={topic.model3D.startsWith('http') ? topic.model3D : `${API_BASE_URL}${topic.model3D}`} autoRotate={true} />
          </AccessGate>
        </TabPanel>
      )}

      {hasImages && (
        <TabPanel value={activeTab} index={imagesTabIndex}>
          <AccessGate
            requiredTier="basic"
            preview={lang === 'ru' ? 'Для просмотра иллюстраций требуется тариф Basic или Premium.' : 'Vizualizarea ilustrațiilor necesită acces Basic sau Premium.'}
            contentType={lang === 'ru' ? 'иллюстрации' : 'ilustrații'}
          >
            <Grid container spacing={3}>
              {topic.images.map((image, index) => (
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
                      image={image.url.startsWith('http') ? image.url : `${API_BASE_URL}${image.url}`}
                      alt={image.caption?.[lang] || topic.name[lang]}
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
          </AccessGate>
        </TabPanel>
      )}

      {hasVideos && (
        <TabPanel value={activeTab} index={videosTabIndex}>
          <AccessGate
            requiredTier="basic"
            preview={lang === 'ru' ? 'Для просмотра видео требуется тариф Basic или Premium.' : 'Vizualizarea videoclipurilor necesită acces Basic sau Premium.'}
            contentType={lang === 'ru' ? 'видео' : 'video'}
          >
            <Grid container spacing={3}>
              {topic.videos.map((video, index) => (
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
                        src={video.url.startsWith('http') ? video.url : `${API_BASE_URL}${video.url}`}
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
          </AccessGate>
        </TabPanel>
      )}

      {/* Lightbox для полноэкранного просмотра изображений */}
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
          {/* Кнопка закрытия */}
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

          {/* Кнопка "Предыдущее" */}
          {topic && topic.images.length > 1 && (
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

          {/* Изображение */}
          {topic && topic.images[selectedImageIndex] && (
            <Box sx={{ maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                component="img"
                src={topic.images[selectedImageIndex].url.startsWith('http') ? topic.images[selectedImageIndex].url : `${API_BASE_URL}${topic.images[selectedImageIndex].url}`}
                alt={topic.images[selectedImageIndex].caption?.[lang] || topic.name[lang]}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
              {topic.images[selectedImageIndex].caption?.[lang] && (
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
                  {topic.images[selectedImageIndex].caption[lang]}
                </Typography>
              )}
            </Box>
          )}

          {/* Кнопка "Следующее" */}
          {topic && topic.images.length > 1 && (
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

          {/* Индикатор позиции */}
          {topic && topic.images.length > 1 && (
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
              {selectedImageIndex + 1} / {topic.images.length}
            </Typography>
          )}
        </Box>
      </Dialog>
    </Container>
  )
}

export default TopicPage
