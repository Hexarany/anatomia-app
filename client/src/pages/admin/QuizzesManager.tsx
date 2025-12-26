import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Typography,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete' // Корректный импорт
import AddIcon from '@mui/icons-material/Add'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CloseIcon from '@mui/icons-material/Close'
import type { Quiz, Topic, QuizQuestion } from '@/types'
import { createQuiz, updateQuiz, deleteQuiz, getTopics } from '@/services/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

// Тип для формы (включая вопросы)
interface QuizFormData {
  title: { ru: string; ro: string }
  description: { ru: string; ro: string }
  topicId: string
  questions: QuizQuestion[]
  categoryId: string 
}

// Базовый объект для нового вопроса
const newQuestionBase: QuizQuestion = {
  _id: '', // Mongoose создаст _id
  question: { ru: '', ro: '' },
  options: [
    { ru: '', ro: '' },
    { ru: '', ro: '' },
  ],
  correctAnswer: 0,
  explanation: { ru: '', ro: '' },
}

// ИСПРАВЛЕНИЕ TS2590: Разбиваем сложное свойство border и используем as const
const answerOptionsBoxStyle = {
  display: 'flex', 
  flexDirection: 'column', 
  gap: 1, 
  borderWidth: '1px', 
  borderStyle: 'solid', 
  borderColor: '#ccc', 
  p: 2, 
  borderRadius: 1
};


const QuizzesManager = () => {
  const { token } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<QuizFormData>({
    title: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    topicId: '',
    questions: [],
    categoryId: '',
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const loadQuizzes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setQuizzes(response.data)
    } catch (error) {
      showSnackbar('Ошибка загрузки викторин', 'error')
    }
  }, [token])

  const loadTopics = useCallback(async () => {
    try {
      // getTopics был обновлен для возврата Topic[] с populating CategoryId
      const loadedTopics = await getTopics()
      setTopics(loadedTopics)
      if (loadedTopics.length > 0 && !formData.topicId) {
        setFormData(prev => ({
          ...prev,
          topicId: loadedTopics[0]._id,
          // categoryId теперь может быть объектом или строкой, здесь берем ID
          categoryId: loadedTopics[0].categoryId._id || loadedTopics[0].categoryId as string, 
        }));
      }
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }, [formData.topicId])

  useEffect(() => {
    loadQuizzes()
    loadTopics()
  }, [loadQuizzes, loadTopics])

  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz)
      // Extract topicId - it might be a string or a populated object
      const topicId = typeof quiz.topicId === 'string' ? quiz.topicId : (quiz.topicId as any)?._id || '';
      const categoryId = typeof quiz.categoryId === 'string' ? quiz.categoryId : (quiz.categoryId as any)?._id || '';

      setFormData({
        title: quiz.title,
        description: quiz.description,
        topicId: topicId,
        questions: quiz.questions.map(q => ({
             ...q,
             explanation: q.explanation || newQuestionBase.explanation // Обеспечиваем наличие explanation
        })),
        categoryId: categoryId,
      })
    } else {
      setEditingQuiz(null)
      setFormData({
        title: { ru: '', ro: '' },
        description: { ru: '', ro: '' },
        topicId: topics[0]?._id || '',
        questions: [{ ...newQuestionBase }],
        categoryId: topics[0]?.categoryId._id || topics[0]?.categoryId as string || '',
      })
    }
    setOpenDialog(true)
    setActiveTab(0)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingQuiz(null)
  }

  const handleSave = async () => {
    if (!token) return

    // Добавляем categoryId на основе выбранного topicId
    const selectedTopic = topics.find(t => t._id === formData.topicId);
    const dataToSend = {
        ...formData,
        categoryId: selectedTopic ? selectedTopic.categoryId._id || selectedTopic.categoryId : formData.categoryId 
    }

    try {
      if (editingQuiz) {
        await updateQuiz(editingQuiz._id, dataToSend, token)
        showSnackbar('Викторина обновлена', 'success')
      } else {
        await createQuiz(dataToSend, token)
        showSnackbar('Викторина создана', 'success')
      }
      loadQuizzes()
      handleCloseDialog()
    } catch (error) {
      showSnackbar('Ошибка сохранения викторины', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Вы уверены? / Sunteți sigur?')) return

    try {
      await deleteQuiz(id, token)
      showSnackbar('Викторина удалена', 'success')
      loadQuizzes()
    } catch (error) {
      showSnackbar('Ошибка удаления', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // --- ЛОГИКА УПРАВЛЕНИЯ ВОПРОСАМИ ---
  const handleQuestionChange = (index: number, field: keyof QuizQuestion['question'] | keyof QuizQuestion | 'explanation', value: string) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      const questionToEdit = newQuestions[index];

      if (field === 'question') {
        questionToEdit.question = { ...questionToEdit.question, [activeTab === 1 ? 'ru' : 'ro']: value };
      } else if (field === 'explanation') {
        questionToEdit.explanation = { ...(questionToEdit.explanation || {ru: '', ro: ''}), [activeTab === 1 ? 'ru' : 'ro']: value };
      } else if (field === 'correctAnswer') {
        questionToEdit[field] = parseInt(value, 10);
      }
      
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      const questionToEdit = newQuestions[qIndex];
      
      questionToEdit.options[oIndex] = { 
          ...(questionToEdit.options[oIndex] || {ru: '', ro: ''}), 
          [activeTab === 1 ? 'ru' : 'ro']: value 
      };

      return { ...prev, questions: newQuestions };
    });
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({ 
        ...prev, 
        questions: [...prev.questions, { ...newQuestionBase }] 
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({ 
        ...prev, 
        questions: prev.questions.filter((_, i) => i !== index) 
    }));
  };
  
  const handleAddOption = (qIndex: number) => {
    setFormData(prev => {
        const newQuestions = [...prev.questions];
        const questionToEdit = newQuestions[qIndex];
        
        if (questionToEdit.options.length < 5) {
             questionToEdit.options.push({ ru: '', ro: '' });
        }
        return { ...prev, questions: newQuestions };
    });
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    setFormData(prev => {
        const newQuestions = [...prev.questions];
        const questionToEdit = newQuestions[qIndex];
        
        questionToEdit.options = questionToEdit.options.filter((_, i) => i !== oIndex);
        
        // Сдвигаем правильный ответ, если удалили его или вариант перед ним
        if (questionToEdit.correctAnswer === oIndex) {
            questionToEdit.correctAnswer = 0; // Сбрасываем
        } else if (questionToEdit.correctAnswer > oIndex) {
            questionToEdit.correctAnswer -= 1;
        }

        return { ...prev, questions: newQuestions };
    });
  };
  
  const handleTopicChange = (topicId: string) => {
    const selectedTopic = topics.find(t => t._id === topicId);
    setFormData(prev => ({
        ...prev,
        topicId: topicId,
        // Автоматически устанавливаем categoryId при выборе темы
        categoryId: selectedTopic ? (selectedTopic.categoryId as string) : prev.categoryId
    }));
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление викторинами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить викторину
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          maxWidth: '100%',
          '& .MuiTable-root': {
            minWidth: { xs: 500, sm: 600, md: 'auto' },
          },
          '& .MuiTableCell-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 8px', sm: '12px 16px' },
          },
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: 'action.hover',
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Название (RU)</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Привязана к теме</TableCell>
              <TableCell>Вопросов</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.map((quiz) => {
                // Handle both cases: topicId as string or populated Topic object
                const quizTopicId = typeof quiz.topicId === 'string' ? quiz.topicId : (quiz.topicId as any)?._id;
                const topic = topics.find(t => t._id === quizTopicId);

                // If topicId is already populated, use it directly
                const topicName = (quiz.topicId as any)?.name?.ru || topic?.name?.ru;

                return (
                    <TableRow key={quiz._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {quiz.title.ru}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {topicName || '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {quiz.questions.length}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleOpenDialog(quiz)}
                          color="primary"
                          size="small"
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(quiz._id)}
                          color="error"
                          size="small"
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: { xs: '100vh', sm: 'calc(100vh - 64px)' },
            m: { xs: 0, sm: 2 },
          }
        }}
      >
        <DialogTitle sx={{ pb: { xs: 1, sm: 2 } }}>
          {editingQuiz ? 'Редактировать викторину' : 'Новая викторина'}
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 1, sm: 2 } }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 80, sm: 120 },
                  px: { xs: 1, sm: 2 },
                }
              }}
            >
              <Tab label="Основное" />
              <Tab label="Вопросы (RU)" />
              <Tab label="Вопросы (RO)" />
            </Tabs>
          </Box>

          {/* Основная информация */}
          {activeTab === 0 && (
              <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 1.5, sm: 2 }
              }}>
                <TextField
                  label="Название (RU)"
                  value={formData.title.ru}
                  onChange={(e) =>
                    setFormData({ ...formData, title: { ...formData.title, ru: e.target.value } })
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Название (RO)"
                  value={formData.title.ro}
                  onChange={(e) =>
                    setFormData({ ...formData, title: { ...formData.title, ro: e.target.value } })
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Описание (RU)"
                  value={formData.description.ru}
                  onChange={(e) =>
                    setFormData({ ...formData, description: { ...formData.description, ru: e.target.value } })
                  }
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Описание (RO)"
                  value={formData.description.ro}
                  onChange={(e) =>
                    setFormData({ ...formData, description: { ...formData.description, ro: e.target.value } })
                  }
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                />
                 <TextField
                  select
                  label="Привязать к теме"
                  value={formData.topicId}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  fullWidth
                  size="small"
                >
                  {topics.map((topic) => (
                    <MenuItem key={topic._id} value={topic._id}>
                      {topic.name.ru}
                    </MenuItem>
                  ))}
                </TextField>
                <Alert severity="info" sx={{ mt: { xs: 0.5, sm: 1 } }}>
                    Викторина будет автоматически привязана к категории выбранной темы.
                </Alert>
              </Box>
          )}
          
          {/* Вопросы */}
          {activeTab !== 0 && ( 
            <Box> 
              {formData.questions.map((question, qIndex) => (
                  <Paper key={question._id || qIndex} sx={{ p: 2, mb: 3, position: 'relative' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          Вопрос #{qIndex + 1}
                          <IconButton size="small" onClick={() => handleRemoveQuestion(qIndex)} color="error">
                              <CloseIcon fontSize="small" />
                          </IconButton>
                      </Typography>
                      
                      {/* Поле вопроса */}
                      <TextField
                          label={`Вопрос (${activeTab === 1 ? 'RU' : 'RO'})`}
                          value={(activeTab === 1 ? question.question.ru : question.question.ro) || ''}
                          onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          sx={{ mb: { xs: 1.5, sm: 2 } }}
                      />
                      
                      {/* Поле пояснения */}
                      <TextField
                          label={`Пояснение (${activeTab === 1 ? 'RU' : 'RO'}) (необязательно)`}
                          value={(activeTab === 1 ? question.explanation?.ru : question.explanation?.ro) || ''}
                          onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          sx={{ mb: 2 }}
                      />

                      {/* Варианты ответов */}
                      <Box sx={answerOptionsBoxStyle as any}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Варианты ответов:</Typography>
                          {question.options.map((option, oIndex) => (
                              <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton 
                                      size="small" 
                                      onClick={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex.toString())}
                                      color="success"
                                  >
                                      {question.correctAnswer === oIndex ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                                  </IconButton>
                                  <TextField
                                      label={`Вариант ${oIndex + 1}`}
                                      value={(activeTab === 1 ? option.ru : option.ro) || ''}
                                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                      fullWidth
                                  />
                                  {question.options.length > 2 && (
                                      <IconButton size="small" onClick={() => handleRemoveOption(qIndex, oIndex)} color="error">
                                          <DeleteIcon fontSize="small" />
                                      </IconButton>
                                  )}
                              </Box>
                          ))}
                           <Button 
                              onClick={() => handleAddOption(qIndex)} 
                              startIcon={<AddIcon />} 
                              size="small" 
                              disabled={question.options.length >= 5}
                              sx={{ mt: 1, alignSelf: 'flex-start' }}
                          >
                              Добавить вариант
                          </Button>
                      </Box>
                  </Paper>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
                fullWidth
                sx={{ mt: 2 }}
              >
                Добавить вопрос
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ minHeight: 40 }}>Отмена</Button>
          <Button onClick={handleSave} variant="contained" sx={{ minHeight: 40 }}>
            Сохранить викторину
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default QuizzesManager
