import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material'
import AccessGate from '@/components/AccessGate'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import type { Quiz } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'ro'
  const { hasAccess, token } = useAuth()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)

  // Load quiz from API
  useEffect(() => {
    console.log('🔄 useEffect triggered, loading quiz...')
    const loadQuiz = async () => {
      if (!quizId) {
        setError('Quiz ID not provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/quizzes/${quizId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        setQuiz(response.data)
        setError(null)
      } catch (err: any) {
        console.error('Error loading quiz:', err)
        setError(err.response?.data?.error?.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, token])

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error || !quiz) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Quiz not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          {t('quiz.backToHome')}
        </Button>
      </Container>
    )
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(event.target.value)
  }

  const handleNext = () => {
    const answerIndex = parseInt(selectedAnswer)
    const newAnswers = [...answers, answerIndex]
    setAnswers(newAnswers)

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer('')
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
    }, 0)
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = (score / quiz.questions.length) * 100

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AccessGate
          requiredTier="premium"
          preview={lang === 'ru' ? 'Для прохождения тестов требуется Premium доступ.' : 'Pentru a realiza teste este necesar acces Premium.'}
          contentType={lang === 'ru' ? 'тест' : 'test'}
        >
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h4" gutterBottom>
                {t('quiz.results')}
              </Typography>
              <Typography variant="h2" color="primary" sx={{ my: 3 }}>
                {score} / {quiz.questions.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {percentage.toFixed(0)}% {t('quiz.correct')}
              </Typography>
              {percentage >= 70 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Отличный результат! / Rezultat excelent!
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Попробуйте еще раз! / Încercați din nou!
                </Alert>
              )}
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setCurrentQuestion(0)
                    setAnswers([])
                    setSelectedAnswer('')
                    setShowResults(false)
                  }}
                >
                  {t('quiz.tryAgain')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/')}>
                  {t('quiz.backToHome')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </AccessGate>
      </Container>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <AccessGate
        requiredTier="premium"
        preview={lang === 'ru' ? 'Для прохождения тестов требуется Premium доступ.' : 'Pentru a realiza teste este necesar acces Premium.'}
        contentType={lang === 'ru' ? 'тест' : 'test'}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {quiz.title[lang]}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {t('quiz.question')} {currentQuestion + 1} {t('quiz.of')}{' '}
            {quiz.questions.length}
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {question.question[lang]}
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={<Radio />}
                    label={option[lang]}
                    sx={{
                      mb: 1,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedAnswer}
              >
                {currentQuestion < quiz.questions.length - 1
                  ? t('quiz.next')
                  : t('quiz.finish')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </AccessGate>
    </Container>
  )
}

export default QuizPage
