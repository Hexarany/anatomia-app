import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Link,
  Button,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import QuizIcon from '@mui/icons-material/Quiz'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import axios from 'axios'
import type { Quiz } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const QuizzesPage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/quizzes`)
        setQuizzes(response.data)
      } catch (error) {
        console.error('Failed to fetch quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          {t('nav.home')}
        </Link>
        <Typography color="text.primary">
          {lang === 'ru' ? 'Тесты' : 'Teste'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <QuizIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {lang === 'ru' ? 'Тесты по анатомии' : 'Teste de anatomie'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          {lang === 'ru'
            ? 'Проверьте свои знания с помощью интерактивных тестов. Каждый тест связан с соответствующей темой для углубленного изучения.'
            : 'Verificați-vă cunoștințele cu teste interactive. Fiecare test este legat de subiectul corespunzător pentru studiu aprofundat.'}
        </Typography>
      </Box>

      {/* Quizzes Grid */}
      <Grid container spacing={3}>
        {quizzes.map((quiz) => {
          const topicId = typeof quiz.topicId === 'string' ? quiz.topicId : quiz.topicId?._id
          const hasTopicLink = !!topicId

          return (
            <Grid item xs={12} sm={6} md={4} key={quiz._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <QuizIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                      {quiz.title[lang]}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                    {quiz.description[lang]}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<QuestionAnswerIcon />}
                      label={`${quiz.questions?.length || 0} ${lang === 'ru' ? 'вопросов' : 'întrebări'}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {hasTopicLink && (
                      <Chip
                        label={lang === 'ru' ? 'С темой' : 'Cu subiect'}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {hasTopicLink && (
                      <Button
                        component={RouterLink}
                        to={`/topic/${topicId}`}
                        variant="outlined"
                        size="small"
                        fullWidth
                      >
                        {lang === 'ru' ? 'К теме' : 'La subiect'}
                      </Button>
                    )}
                    <Button
                      component={RouterLink}
                      to={`/quiz/${quiz._id}`}
                      variant="contained"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      fullWidth
                    >
                      {lang === 'ru' ? 'Пройти' : 'Începe'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {quizzes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {lang === 'ru' ? 'Тесты пока не добавлены' : 'Nu există teste încă'}
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default QuizzesPage
