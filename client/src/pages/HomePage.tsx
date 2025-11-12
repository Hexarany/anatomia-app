import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import View3DIcon from '@mui/icons-material/ViewInAr'
import ImageIcon from '@mui/icons-material/Image'
import QuizIcon from '@mui/icons-material/Quiz'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import { getCategories } from '@/services/api'
import type { Category } from '@/types'

const HomePage = () => {
  const { t, i18n } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language as 'ru' | 'ro'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from API...')
        const data = await getCategories()
        console.log('Categories received:', data)
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        if (error instanceof Error) {
          console.error('Error message:', error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const features = [
    {
      icon: <View3DIcon sx={{ fontSize: 60 }} color="primary" />,
      title: t('home.features.3d.title'),
      description: t('home.features.3d.description'),
    },
    {
      icon: <ImageIcon sx={{ fontSize: 60 }} color="primary" />,
      title: t('home.features.atlas.title'),
      description: t('home.features.atlas.description'),
    },
    {
      icon: <QuizIcon sx={{ fontSize: 60 }} color="primary" />,
      title: t('home.features.quiz.title'),
      description: t('home.features.quiz.description'),
    },
    {
      icon: <VideoLibraryIcon sx={{ fontSize: 60 }} color="primary" />,
      title: t('home.features.video.title'),
      description: t('home.features.video.description'),
    },
  ]

  const categoryColors = ['#e3f2fd', '#fce4ec', '#f3e5f5', '#e8f5e9', '#fff3e0']

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            {t('home.welcome')}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            {t('home.description')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            component={RouterLink}
            to="#categories"
            sx={{ px: 4, py: 1.5 }}
          >
            {t('home.getStarted')}
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          {t('home.features.title')}
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box id="categories" sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            {t('nav.categories')}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {categories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={category._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: categoryColors[index % categoryColors.length],
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {category.name[lang]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description[lang]}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/category/${category._id}`}
                      >
                        {t('home.getStarted')}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
