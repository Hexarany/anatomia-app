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
  Chip,
  Stack,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import QuizIcon from '@mui/icons-material/Quiz'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Model3DViewer from '@/components/Model3DViewer'
import EnhancedMarkdown from '@/components/EnhancedMarkdown'
import ContentLock from '@/components/ContentLock'
import { getTopicById, getQuizzesByTopic } from '@/services/api' // <-- Добавлен getQuizzesByTopic
import type { Topic, Quiz } from '@/types' // <-- Добавлен Quiz type
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'

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
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const lang = i18n.language as 'ru' | 'ro'

  const [topic, setTopic] = useState<Topic | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([]) // <-- НОВЫЙ СТЕЙТ
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const fetchTopicData = async () => { // <-- ИМЕНУЕМ ФУНКЦИЮ, ЧТОБЫ ЗАГРУЖАТЬ ВСЕ
      if (!topicId) return

      try {
        setLoading(true)
        // Загрузка темы и связанных тестов параллельно
        const [topicData, quizzesData] = await Promise.all([
          getTopicById(topicId),
          getQuizzesByTopic(topicId), // <-- ЗАГРУЗКА ТЕСТОВ
        ])
        setTopic(topicData)
        setQuizzes(quizzesData) // <-- СОХРАНЯЕМ ТЕСТЫ
      } catch (error) {
        console.error('Failed to fetch topic data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopicData()
  }, [topicId])

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
        <Typography variant="h4">Тема не найдена / Subiectul nu a fost găsit</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          {t('quiz.backToHome')}
        </Button>
      </Container>
    )
  }

  const hasImages = topic.images && topic.images.length > 0
  const hasVideos = topic.videos && topic.videos.length > 0
  const has3DModel = topic.model3D // <-- Используем model3D
  const hasQuiz = quizzes.length > 0 // <-- Проверяем наличие связанного теста
  
  // Получаем текст превью (используя новую логику)
  // NOTE: Если бэкенд возвращает topic.content.ru с троеточием '...', это уже превью
  const isContentLocked = !isAuthenticated // Используем простую логику аутентификации

  const getPreviewText = (content: string) => {
    // В идеале, бэкенд должен возвращать точное превью, но здесь мы делаем fallback
    const plainText = content.replace(/[#*`>\[\]()]/g, '').substring(0, 300)
    return plainText + '...'
  }

  // --- Динамическое определение индексов вкладок ---
  // 0: Описание
  // 1: 3D Модель (если есть)
  // 2: Изображения (если есть)
  // 3: Видео (если есть)

  let tabIndex = 1;
  const modelTabIndex = has3DModel ? tabIndex++ : -1;
  const imagesTabIndex = hasImages ? tabIndex++ : -1;
  const videosTabIndex = hasVideos ? tabIndex++ : -1;
  // ------------------------------------------------

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        // Возвращаемся на страницу категории, используя categoryId
        component={RouterLink}
        to={`/category/${topic.categoryId}`} 
        sx={{ mb: 2 }}
        variant="outlined"
      >
        {lang === 'ru' ? 'Назад к списку' : 'Înapoi la listă'}
      </Button>

      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          {t('nav.home')}
        </Link>
        <Link component={RouterLink} to={`/category/${topic.categoryId}`} color="inherit">
          {/* NOTE: В идеале здесь должно быть имя категории, но используем t('nav.categories') */}
          {t('nav.categories')} 
        </Link>
        <Typography color="text.primary">{topic.name[lang]}</Typography>
      </Breadcrumbs>

      {/* Topic Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <FitnessCenterIcon
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mr: 2,
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {topic.name[lang]}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 2 }}>
              {topic.description[lang]}
            </Typography>

            {/* Content Badges */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} alignItems="center">
              {has3DModel && (
                <Chip
                  icon={<ViewInArIcon />}
                  label={t('topic.3dModel')}
                  color="primary"
                  size="small"
                />
              )}
              {hasImages && (
                <Chip
                  icon={<ImageIcon />}
                  label={`${topic.images.length} ${t('topic.images')}`}
                  color="success"
                  size="small"
                />
              )}
              {hasVideos && (
                <Chip
                  icon={<VideoLibraryIcon />}
                  label={`${topic.videos.length} ${t('topic.videos')}`}
                  color="error"
                  size="small"
                />
              )}
              
              {/* Quiz Button (НОВАЯ ФУНКЦИОНАЛЬНОСТЬ) */}
              {hasQuiz && (
                <Button
                    component={RouterLink}
                    to={`/quiz/${quizzes[0].slug}`} // Используем slug для маршрутизации
                    variant="contained"
                    startIcon={<QuizIcon />}
                    size="small"
                    color="secondary"
                    sx={{ ml: 2, fontWeight: 600 }}
                >
                    {t('topic.relatedQuiz')}
                </Button>
              )}

              {/* Favorite Button */}
              <Tooltip
                title={
                  isFavorite(topic._id)
                    ? lang === 'ru'
                      ? 'Удалить из избранного'
                      : 'Elimină din favorite'
                    : lang === 'ru'
                    ? 'Добавить в избранное'
                    : 'Adaugă la favorite'
                }
              >
                <IconButton
                  onClick={() => toggleFavorite(topic._id)}
                  sx={{
                    ml: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: isFavorite(topic._id) ? 'error.light' : 'action.hover',
                    },
                  }}
                  size="small"
                >
                  {isFavorite(topic._id) ? (
                    <FavoriteIcon sx={{ color: 'error.main' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '1rem',
              fontWeight: 600,
            },
          }}
        >
          <Tab
            label={t('topic.description')}
            icon={<FitnessCenterIcon />}
            iconPosition="start"
          />
          {has3DModel && (
            <Tab
              label={t('topic.3dModel')}
              icon={<ViewInArIcon />}
              iconPosition="start"
            />
          )}
          {hasImages && (
            <Tab
              label={`${t('topic.images')} (${topic.images.length})`}
              icon={<ImageIcon />}
              iconPosition="start"
            />
          )}
          {hasVideos && (
            <Tab
              label={`${t('topic.videos')} (${topic.videos.length})`}
              icon={<VideoLibraryIcon />}
              iconPosition="start"
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          {isAuthenticated ? (
            <EnhancedMarkdown>{topic.content[lang]}</EnhancedMarkdown>
          ) : (
            // NOTE: Предполагаем, что topic.content.ru уже содержит превью, если бэкенд настроен правильно.
            <ContentLock previewText={getPreviewText(topic.content[lang])} />
          )}
        </Paper>
      </TabPanel>

      {has3DModel && (
        <TabPanel value={activeTab} index={modelTabIndex}>
          {/* NOTE: Используем model3D, так как это поле есть в схеме */}
          <Model3DViewer modelUrl={topic.model3D} autoRotate={true} /> 
        </TabPanel>
      )}

      {hasImages && (
        <TabPanel value={activeTab} index={imagesTabIndex}>
          <Grid container spacing={3}>
            {topic.images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={image.url || index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={image.url}
                    alt={image.caption?.[lang] || topic.name[lang]}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  {image.caption && (
                    <CardContent>
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
            {topic.videos.map((video, index) => (
              <Grid item xs={12} md={6} key={video.url || index}>
                <Card
                  sx={{
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      backgroundColor: 'black',
                    }}
                  >
                    <video
                      controls
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                      src={video.url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                  {video.caption && (
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
    </Container>
  )
}

export default TopicPage