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
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import QuizIcon from '@mui/icons-material/Quiz'
import Model3DViewer from '@/components/Model3DViewer'
import EnhancedMarkdown from '@/components/EnhancedMarkdown'
import { getTopicById } from '@/services/api'
import type { Topic } from '@/types'

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
  const lang = i18n.language as 'ru' | 'ro'

  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

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
  const has3DModel = topic.model3D

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          {t('nav.categories')}
        </Link>
        <Typography color="text.primary">{topic.name[lang]}</Typography>
      </Breadcrumbs>

      {/* Topic Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {topic.name[lang]}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {topic.description[lang]}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={t('topic.description')} />
          {has3DModel && <Tab label={t('topic.3dModel')} />}
          {hasImages && <Tab label={t('topic.images')} />}
          {hasVideos && <Tab label={t('topic.videos')} />}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <EnhancedMarkdown>{topic.content[lang]}</EnhancedMarkdown>
      </TabPanel>

      {has3DModel && (
        <TabPanel value={activeTab} index={1}>
          <Model3DViewer modelUrl={topic.model3D} autoRotate={true} />
        </TabPanel>
      )}

      {hasImages && (
        <TabPanel value={activeTab} index={has3DModel ? 2 : 1}>
          <Grid container spacing={3}>
            {topic.images.map((image, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="300"
                    image={image.url}
                    alt={image.caption?.[lang] || topic.name[lang]}
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
        <TabPanel value={activeTab} index={has3DModel && hasImages ? 3 : has3DModel || hasImages ? 2 : 1}>
          <Grid container spacing={3}>
            {topic.videos.map((video, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card>
                  <video
                    controls
                    style={{ width: '100%', height: '300px' }}
                    src={video.url}
                  >
                    Your browser does not support the video tag.
                  </video>
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
