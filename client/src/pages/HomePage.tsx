import { useEffect, useState, memo } from 'react'
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
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import View3DIcon from '@mui/icons-material/ViewInAr'
import ImageIcon from '@mui/icons-material/Image'
import QuizIcon from '@mui/icons-material/Quiz'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SpaIcon from '@mui/icons-material/Spa'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TelegramIcon from '@mui/icons-material/Telegram'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ChatIcon from '@mui/icons-material/Chat'
import CheckIcon from '@mui/icons-material/Check'
import { getCategories } from '@/services/api'
import type { Category } from '@/types'

// Memoized CategoryCard component for better performance
interface CategoryCardProps {
  category: Category
  index: number
  colorScheme: { bg: string; border: string }
  lang: 'ru' | 'ro'
  themeMode: 'light' | 'dark'
  getStartedText: string
}

const CategoryCard = memo(({ category, index, colorScheme, lang, themeMode, getStartedText }: CategoryCardProps) => (
  <Grid item xs={12} sm={6} md={4}>
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
            boxShadow: themeMode === 'dark'
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
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            }}
          >
            {category.name[lang]}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
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
            {getStartedText}
          </Button>
        </CardActions>
      </Card>
    </Grow>
  </Grid>
))

CategoryCard.displayName = 'CategoryCard'

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

      {/* Quick Access Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: { xs: 3, md: 4 },
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            fontWeight: 700,
          }}
        >
          {i18n.language === 'ru' ? 'Быстрый доступ к обучению' : 'Acces rapid la învățare'}
        </Typography>
        <Grid container spacing={2}>
          {[
            {
              title: i18n.language === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj',
              description: i18n.language === 'ru' ? 'Полные инструкции по техникам массажа' : 'Instrucțiuni complete pentru tehnicile de masaj',
              icon: <SpaIcon sx={{ fontSize: 40 }} />,
              path: '/massage-protocols',
              color: theme.palette.mode === 'dark' ? '#81c784' : '#388e3c',
            },
            {
              title: i18n.language === 'ru' ? 'Триггерные точки' : 'Puncte Trigger',
              description: i18n.language === 'ru' ? 'Атлас триггерных точек для массажа' : 'Atlas de puncte trigger pentru masaj',
              icon: <GpsFixedIcon sx={{ fontSize: 40 }} />,
              path: '/trigger-points',
              color: theme.palette.mode === 'dark' ? '#f06292' : '#c2185b',
            },
            {
              title: i18n.language === 'ru' ? '3D Модели' : 'Modele 3D',
              description: i18n.language === 'ru' ? 'Интерактивные 3D модели анатомии' : 'Modele 3D interactive de anatomie',
              icon: <View3DIcon sx={{ fontSize: 40 }} />,
              path: '/anatomy-models-3d',
              color: theme.palette.mode === 'dark' ? '#4fc3f7' : '#0288d1',
            },
            {
              title: i18n.language === 'ru' ? 'Гигиена и стандарты' : 'Igienă și standarde',
              description: i18n.language === 'ru' ? 'Правила гигиены и безопасности' : 'Reguli de igienă și siguranță',
              icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
              path: '/hygiene-guidelines',
              color: theme.palette.mode === 'dark' ? '#ba68c8' : '#7b1fa2',
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                component={RouterLink}
                to={item.path}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  textDecoration: 'none',
                  border: `2px solid transparent`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 10px 30px rgba(0,0,0,0.5)'
                      : '0 10px 30px rgba(0,0,0,0.15)',
                    borderColor: item.color,
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: alpha(item.color, 0.1),
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {item.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Statistics Section */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.dark, 0.2)
            : alpha(theme.palette.primary.light, 0.1),
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              {
                icon: <SchoolIcon sx={{ fontSize: 50 }} />,
                value: '100+',
                label: i18n.language === 'ru' ? 'Уроков и тем' : 'Lecții și subiecte',
                color: theme.palette.primary.main,
              },
              {
                icon: <QuizIcon sx={{ fontSize: 50 }} />,
                value: '50+',
                label: i18n.language === 'ru' ? 'Тестов и викторин' : 'Teste și chestionare',
                color: theme.palette.secondary.main,
              },
              {
                icon: <PeopleIcon sx={{ fontSize: 50 }} />,
                value: '500+',
                label: i18n.language === 'ru' ? 'Студентов' : 'Studenți',
                color: theme.palette.mode === 'dark' ? '#81c784' : '#388e3c',
              },
              {
                icon: <EmojiEventsIcon sx={{ fontSize: 50 }} />,
                value: '300+',
                label: i18n.language === 'ru' ? 'Сертификатов выдано' : 'Certificate eliberate',
                color: theme.palette.mode === 'dark' ? '#ffb74d' : '#f57c00',
              },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      color: stat.color,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
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
              {categories.map((category, index) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  index={index}
                  colorScheme={getCategoryColor(index)}
                  lang={lang}
                  themeMode={theme.palette.mode}
                  getStartedText={t('home.getStarted')}
                />
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Pricing Overview Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
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
          {i18n.language === 'ru' ? 'Выберите свой тариф' : 'Alegeți planul'}
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {[
            {
              name: 'Free',
              price: '0',
              description: i18n.language === 'ru'
                ? 'Базовый доступ к материалам'
                : 'Acces de bază la materiale',
              features: i18n.language === 'ru'
                ? ['Превью всех материалов', 'Ознакомительный режим']
                : ['Previzualizare materiale', 'Mod demonstrativ'],
              color: theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
              highlighted: false,
            },
            {
              name: 'Basic',
              price: '20',
              description: i18n.language === 'ru'
                ? 'Полный доступ к основам'
                : 'Acces complet la bază',
              features: i18n.language === 'ru'
                ? ['Все уроки по анатомии', '4 протокола массажа', 'Гигиена и стандарты']
                : ['Toate lecțiile de anatomie', '4 protocoale masaj', 'Igienă și standarde'],
              color: theme.palette.primary.main,
              highlighted: true,
            },
            {
              name: 'Premium',
              price: '50',
              description: i18n.language === 'ru'
                ? 'Весь контент платформы'
                : 'Tot conținutul platformei',
              features: i18n.language === 'ru'
                ? ['Всё из Basic', 'Все протоколы массажа', 'Триггерные точки', '3D модели']
                : ['Tot din Basic', 'Toate protocoalele', 'Puncte trigger', 'Modele 3D'],
              color: theme.palette.mode === 'dark' ? '#ffb74d' : '#f57c00',
              highlighted: false,
            },
          ].map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: plan.highlighted ? `3px solid ${plan.color}` : '2px solid transparent',
                  transform: plan.highlighted ? 'scale(1.05)' : 'none',
                  boxShadow: plan.highlighted
                    ? theme.palette.mode === 'dark'
                      ? '0 8px 32px rgba(0,0,0,0.5)'
                      : '0 8px 32px rgba(0,0,0,0.15)'
                    : undefined,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 32px rgba(0,0,0,0.5)'
                      : '0 8px 32px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
                  {plan.highlighted && (
                    <Chip
                      label={i18n.language === 'ru' ? 'Популярный' : 'Popular'}
                      color="primary"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                    {plan.name}
                  </Typography>
                  <Box sx={{ my: 3 }}>
                    <Typography
                      variant="h3"
                      component="span"
                      fontWeight={700}
                      sx={{ color: plan.color }}
                    >
                      ${plan.price}
                    </Typography>
                    {plan.price !== '0' && (
                      <Typography variant="body2" color="text.secondary">
                        {i18n.language === 'ru' ? 'единоразово' : 'unică plată'}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {plan.description}
                  </Typography>
                  <List dense sx={{ textAlign: 'left' }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            component={RouterLink}
            to="/pricing"
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {i18n.language === 'ru' ? 'Посмотреть все тарифы' : 'Vezi toate planurile'}
          </Button>
        </Box>
      </Container>

      {/* Telegram Bot Promotion Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
        <Card
          sx={{
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, #0088cc 0%, #0066aa 100%)`
              : `linear-gradient(135deg, #0088cc 0%, #54a9eb 100%)`,
            color: 'white',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TelegramIcon sx={{ fontSize: 50, mr: 2 }} />
                  <Typography variant="h4" component="h2" fontWeight={700}>
                    {i18n.language === 'ru' ? 'Учитесь в Telegram!' : 'Învățați în Telegram!'}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.95, fontWeight: 400 }}>
                  {i18n.language === 'ru'
                    ? 'Получите полный доступ к платформе прямо в Telegram'
                    : 'Obțineți acces complet la platformă direct în Telegram'}
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      icon: <NotificationsActiveIcon />,
                      text: i18n.language === 'ru'
                        ? 'Уведомления о новых уроках и заданиях'
                        : 'Notificări despre lecții și teme noi',
                    },
                    {
                      icon: <ChatIcon />,
                      text: i18n.language === 'ru'
                        ? 'Быстрый доступ к материалам'
                        : 'Acces rapid la materiale',
                    },
                    {
                      icon: <QuizIcon />,
                      text: i18n.language === 'ru'
                        ? 'Ежедневные викторины и тесты'
                        : 'Chestionare și teste zilnice',
                    },
                  ].map((feature, index) => (
                    <Grid item xs={12} sm={6} md={12} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            p: 1,
                            display: 'flex',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {feature.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    textAlign: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    p: 4,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    {i18n.language === 'ru' ? 'Начните сейчас!' : 'Începeți acum!'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                    {i18n.language === 'ru'
                      ? 'Отсканируйте QR-код или нажмите кнопку ниже'
                      : 'Scanați codul QR sau apăsați butonul de mai jos'}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    href="https://t.me/AnatomiaBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<TelegramIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: '#0088cc',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    {i18n.language === 'ru' ? 'Открыть в Telegram' : 'Deschide în Telegram'}
                  </Button>
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.8 }}>
                    @AnatomiaBot
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default HomePage
