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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import TimerIcon from '@mui/icons-material/Timer'
import SchoolIcon from '@mui/icons-material/School'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AccessGate from '@/components/AccessGate'
import { useAuth } from '@/contexts/AuthContext'
import { useProgress } from '@/contexts/ProgressContext'

const EnhancedQuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'ro'
  const { hasAccess, isAuthenticated } = useAuth()
  const { saveQuizResult } = useProgress()

  const [mode, setMode] = useState<'practice' | 'exam' | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [showModeDialog, setShowModeDialog] = useState(true)
  const [savingProgress, setSavingProgress] = useState(false)

  // Mock quiz data
  const quiz = {
    _id: quizId || 'mock-quiz-1',
    title: {
      ru: 'Тест по остеологии: Череп',
      ro: 'Test de osteologie: Craniul',
    },
    questions: [
      {
        question: {
          ru: 'Сколько костей входит в состав черепа человека?',
          ro: 'Câte oase formează craniul uman?',
        },
        options: [
          { ru: '20', ro: '20' },
          { ru: '23', ro: '23' },
          { ru: '26', ro: '26' },
          { ru: '29', ro: '29' },
        ],
        correctAnswer: 1,
      },
      {
        question: {
          ru: 'Какая кость черепа является подвижной?',
          ro: 'Care os al craniului este mobil?',
        },
        options: [
          { ru: 'Лобная кость', ro: 'Osul frontal' },
          { ru: 'Нижняя челюсть', ro: 'Mandibula' },
          { ru: 'Затылочная кость', ro: 'Osul occipital' },
          { ru: 'Височная кость', ro: 'Osul temporal' },
        ],
        correctAnswer: 1,
      },
      {
        question: {
          ru: 'Из скольких частей состоит височная кость?',
          ro: 'Din câte părți constă osul temporal?',
        },
        options: [
          { ru: '2', ro: '2' },
          { ru: '3', ro: '3' },
          { ru: '4', ro: '4' },
          { ru: '5', ro: '5' },
        ],
        correctAnswer: 1,
      },
    ],
  }

  // Timer effect for exam mode
  useEffect(() => {
    if (mode === 'exam' && !showResults && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [mode, showResults, timeRemaining])

  const handleTimeUp = () => {
    if (!showResults) {
      // Auto-submit when time runs out
      const newAnswers = [...answers]
      // Fill remaining with -1 (unanswered)
      while (newAnswers.length < quiz.questions.length) {
        newAnswers.push(-1)
      }
      setAnswers(newAnswers)
      setShowResults(true)
    }
  }

  const handleModeSelect = (selectedMode: 'practice' | 'exam') => {
    setMode(selectedMode)
    setShowModeDialog(false)
    setStartTime(Date.now())
    if (selectedMode === 'exam') {
      setTimeRemaining(600) // 10 minutes for exam
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
      handleSubmit(newAnswers)
    }
  }

  const handleSubmit = async (finalAnswers: number[]) => {
    setShowResults(true)

    // Save to progress if authenticated
    if (isAuthenticated && mode) {
      try {
        setSavingProgress(true)
        const score = calculateScore(finalAnswers)
        const percentage = (score / quiz.questions.length) * 100
        const timeSpent = Math.floor((Date.now() - startTime) / 1000)

        await saveQuizResult({
          quizId: quiz._id,
          score: Math.round(percentage),
          totalQuestions: quiz.questions.length,
          correctAnswers: score,
          timeSpent,
          mode,
        })
      } catch (error) {
        console.error('Error saving quiz result:', error)
      } finally {
        setSavingProgress(false)
      }
    }
  }

  const calculateScore = (answersArray?: number[]) => {
    const finalAnswers = answersArray || answers
    return finalAnswers.reduce((score, answer, index) => {
      return score + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
    }, 0)
  }

  const getErrorAnalysis = () => {
    return answers.map((answer, index) => ({
      question: quiz.questions[index],
      userAnswer: answer,
      correctAnswer: quiz.questions[index].correctAnswer,
      isCorrect: answer === quiz.questions[index].correctAnswer,
    }))
  }

  // Mode Selection Dialog
  if (showModeDialog) {
    return (
      <Dialog open={showModeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" align="center">
            {lang === 'ru' ? 'Выберите режим тестирования' : 'Alegeți modul de testare'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s',
                }}
                onClick={() => handleModeSelect('practice')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {lang === 'ru' ? 'Практика' : 'Practică'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lang === 'ru'
                      ? '• Без ограничения времени\n• Можно пересдавать\n• Для обучения'
                      : '• Fără limită de timp\n• Se poate relua\n• Pentru învățare'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'warning.main',
                  '&:hover': {
                    bgcolor: 'warning.50',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s',
                }}
                onClick={() => handleModeSelect('exam')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <EmojiEventsIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {lang === 'ru' ? 'Экзамен' : 'Examen'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lang === 'ru'
                      ? '• 10 минут на тест\n• Финальная оценка\n• Для проверки знаний'
                      : '• 10 minute pentru test\n• Notă finală\n• Pentru verificare'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = (score / quiz.questions.length) * 100
    const errorAnalysis = getErrorAnalysis()
    const incorrectQuestions = errorAnalysis.filter((q) => !q.isCorrect)

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AccessGate
          requiredTier="premium"
          preview={
            lang === 'ru'
              ? 'Для прохождения тестов требуется Premium доступ.'
              : 'Pentru a realiza teste este necesar acces Premium.'
          }
          contentType={lang === 'ru' ? 'тест' : 'test'}
        >
          {/* Results Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Chip
                label={mode === 'exam' ? (lang === 'ru' ? 'ЭКЗАМЕН' : 'EXAMEN') : (lang === 'ru' ? 'ПРАКТИКА' : 'PRACTICĂ')}
                color={mode === 'exam' ? 'warning' : 'primary'}
                sx={{ mb: 2 }}
              />
              <Typography variant="h4" gutterBottom>
                {lang === 'ru' ? 'Результаты' : 'Rezultate'}
              </Typography>
              <Typography variant="h2" color="primary" sx={{ my: 3 }}>
                {score} / {quiz.questions.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {percentage.toFixed(0)}% {lang === 'ru' ? 'правильных ответов' : 'răspunsuri corecte'}
              </Typography>
              {percentage >= 80 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {lang === 'ru' ? '🎉 Отличный результат!' : '🎉 Rezultat excelent!'}
                </Alert>
              ) : percentage >= 60 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {lang === 'ru' ? '✅ Хороший результат!' : '✅ Rezultat bun!'}
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {lang === 'ru' ? '📚 Попробуйте еще раз!' : '📚 Încercați din nou!'}
                </Alert>
              )}
              {savingProgress && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  {lang === 'ru' ? 'Сохранение прогресса...' : 'Salvare progres...'}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Error Analysis */}
          {incorrectQuestions.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {lang === 'ru' ? 'Анализ ошибок' : 'Analiza erorilor'}
              </Typography>
              <List>
                {incorrectQuestions.map((item, index) => (
                  <ListItem key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                      <CancelIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {item.question.question[lang]}
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="error.main">
                        {lang === 'ru' ? 'Ваш ответ:' : 'Răspunsul dvs.:'}{' '}
                        {item.userAnswer >= 0 ? item.question.options[item.userAnswer][lang] : (lang === 'ru' ? 'Не отвечено' : 'Nicio alegere')}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {lang === 'ru' ? 'Правильный ответ:' : 'Răspuns corect:'}{' '}
                        {item.question.options[item.correctAnswer][lang]}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => {
                setCurrentQuestion(0)
                setAnswers([])
                setSelectedAnswer('')
                setShowResults(false)
                setShowModeDialog(true)
                setTimeRemaining(600)
                setStartTime(Date.now())
              }}
            >
              {lang === 'ru' ? 'Пройти снова' : 'Relua testul'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              {lang === 'ru' ? 'Мой прогресс' : 'Progresul meu'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              {lang === 'ru' ? 'На главную' : 'Pagina principală'}
            </Button>
          </Box>
        </AccessGate>
      </Container>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <AccessGate
        requiredTier="premium"
        preview={
          lang === 'ru'
            ? 'Для прохождения тестов требуется Premium доступ.'
            : 'Pentru a realiza teste este necesar acces Premium.'
        }
        contentType={lang === 'ru' ? 'тест' : 'test'}
      >
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {quiz.title[lang]}
            </Typography>
            <Chip
              label={mode === 'exam' ? (lang === 'ru' ? 'Режим экзамена' : 'Mod examen') : (lang === 'ru' ? 'Режим практики' : 'Mod practică')}
              color={mode === 'exam' ? 'warning' : 'primary'}
              size="small"
            />
          </Box>
          {mode === 'exam' && (
            <Chip
              icon={<TimerIcon />}
              label={formatTime(timeRemaining)}
              color={timeRemaining < 60 ? 'error' : 'default'}
              sx={{ fontSize: '1.2rem', py: 2.5 }}
            />
          )}
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {lang === 'ru' ? 'Вопрос' : 'Întrebare'} {currentQuestion + 1} / {quiz.questions.length}
            </Typography>
            <Typography variant="body2">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
        </Box>

        {/* Question Card */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {question.question[lang]}
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={<Radio />}
                    label={option[lang]}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      px: 2,
                      mx: 0,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1)
                    setSelectedAnswer(answers[currentQuestion - 1]?.toString() || '')
                  }
                }}
                disabled={currentQuestion === 0}
              >
                {lang === 'ru' ? 'Назад' : 'Înapoi'}
              </Button>
              <Button variant="contained" onClick={handleNext} disabled={!selectedAnswer}>
                {currentQuestion === quiz.questions.length - 1
                  ? (lang === 'ru' ? 'Завершить' : 'Finalizează')
                  : (lang === 'ru' ? 'Далее' : 'Următorul')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </AccessGate>
    </Container>
  )
}

export default EnhancedQuizPage
