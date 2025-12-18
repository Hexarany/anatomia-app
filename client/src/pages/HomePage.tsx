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
  alpha,
  useTheme,
  Fade,
  Grow,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import View3DIcon from '@mui/icons-material/ViewInAr'
import ImageIcon from '@mui/icons-material/Image'
import QuizIcon from '@mui/icons-material/Quiz'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getCategories } from '@/services/api'
import type { Category } from '@/types'

const HomePage = () => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language as 'ru' | 'ro'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const features = [
    {
      icon: <View3DIcon sx={{ fontSize: 60 }} />,
      title: t('home.features.3d.title'),
      description: t('home.features.3d.description'),
      color: theme.palette.mode === 'dark' ? '#4fc3f7' : '#0288d1',
    },
    {
      icon: <ImageIcon sx={{ fontSize: 60 }} />,
      title: t('home.features.atlas.title'),
      description: t('home.features.atlas.description'),
      color: theme.palette.mode === 'dark' ? '#f06292' : '#c2185b',
    },
    {
      icon: <QuizIcon sx={{ fontSize: 60 }} />,
      title: t('home.features.quiz.title'),
      description: t('home.features.quiz.description'),
      color: theme.palette.mode === 'dark' ? '#ba68c8' : '#7b1fa2',
    },
    {
      icon: <VideoLibraryIcon sx={{ fontSize: 60 }} />,
      title: t('home.features.video.title'),
      description: t('home.features.video.description'),
      color: theme.palette.mode === 'dark' ? '#81c784' : '#388e3c',
    },
  ]

  // Theme-aware colors for categories
  const getCategoryColor = (index: number) => {
    const colors = theme.palette.mode === 'dark'
      ? [
          { bg: alpha(theme.palette.primary.main, 0.15), border: theme.palette.primary.main },
          { bg: alpha(theme.palette.secondary.main, 0.15), border: theme.palette.secondary.main },
          { bg: alpha('#ba68c8', 0.15), border: '#ba68c8' },
          { bg: alpha('#81c784', 0.15), border: '#81c784' },
          { bg: alpha('#ffb74d', 0.15), border: '#ffb74d' },
        ]
      : [
          { bg: '#e3f2fd', border: '#1976d2' },
          { bg: '#fce4ec', border: '#c2185b' },
          { bg: '#f3e5f5', border: '#7b1fa2' },
          { bg: '#e8f5e9', border: '#388e3c' },
          { bg: '#fff3e0', border: '#f57c00' },
        ]

    return colors[index % colors.length]
  }

  return (
    <Box>
      {/* Hero Section with Gradient */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: 'white',
          py: { xs: 8, sm: 10, md: 15 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                fontWeight: 700,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {t('home.welcome')}
            </Typography>
          </Fade>
          <Fade in timeout={1000}>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.95,
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                fontWeight: 400,
              }}
            >
              {t('home.description')}
            </Typography>
          </Fade>
          <Fade in timeout={1200}>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              component={RouterLink}
              to="#categories"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: { xs: 4, md: 5 },
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.35)',
                },
              }}
            >
              {t('home.getStarted')}
            </Button>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: { xs: 4, md: 6 },
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
          }}
        >
          {t('home.features.title')}
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={500 + index * 150}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    border: `2px solid transparent`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 12px 24px rgba(0,0,0,0.5)'
                        : '0 12px 24px rgba(0,0,0,0.15)',
                      borderColor: feature.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(feature.color, 0.2),
                        transform: 'rotate(360deg)',
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box
        id="categories"
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.4)
            : 'background.default',
          py: { xs: 6, sm: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: { xs: 4, md: 6 },
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
            }}
          >
            {t('nav.categories')}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {categories.map((category, index) => {
                const colorScheme = getCategoryColor(index)
                return (
                  <Grid item xs={12} sm={6} md={4} key={category._id}>
                    <Grow in timeout={300 + index * 100}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          bgcolor: colorScheme.bg,
                          borderRadius: 3,
                          border: `2px solid transparent`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? `0 8px 24px ${alpha(colorScheme.border, 0.3)}`
                              : '0 8px 24px rgba(0,0,0,0.12)',
                            borderColor: colorScheme.border,
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography
                            variant="h5"
                            component="h3"
                            gutterBottom
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.mode === 'dark'
                                ? theme.palette.text.primary
                                : 'text.primary',
                            }}
                          >
                            {category.name[lang]}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.6,
                            }}
                          >
                            {category.description[lang]}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            size="medium"
                            component={RouterLink}
                            to={`/category/${category._id}`}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                              color: colorScheme.border,
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: alpha(colorScheme.border, 0.08),
                              },
                            }}
                          >
                            {t('home.getStarted')}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grow>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
