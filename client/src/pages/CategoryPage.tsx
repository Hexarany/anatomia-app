import { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { getCategoryById, getTopicsByCategory } from '@/services/api'
import type { Category, Topic } from '@/types'

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [category, setCategory] = useState<Category | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return

      try {
        setLoading(true)
        const [categoryData, topicsData] = await Promise.all([
          getCategoryById(categoryId),
          getTopicsByCategory(categoryId),
        ])
        setCategory(categoryData)
        setTopics(topicsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categoryId])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Категория не найдена, в ближайшее время это будет исправлено / Categoria nu a fost găsită</Typography>
      </Container>
    )
  }

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
        <Typography color="text.primary">{category.name[lang]}</Typography>
      </Breadcrumbs>

      {/* Category Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {category.name[lang]}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {category.description[lang]}
        </Typography>
      </Box>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru' ? 'Темы скоро появятся...' : 'Subiectele vor apărea în curând...'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {topics.map((topic) => (
            <Grid item xs={12} sm={6} md={4} key={topic._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {topic.name[lang]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {topic.description[lang]}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/topic/${topic._id}`}
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
  )
}

export default CategoryPage
