import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getAllGroups,
  getTopics,
  getGroupSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  generateCourseSchedule,
} from '@/services/api'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import EventIcon from '@mui/icons-material/Event'
import type { Group } from '@/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const ScheduleManager = () => {
  const { token } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [groups, setGroups] = useState<Group[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [schedule, setSchedule] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)

  // Форма занятия
  const [lessonForm, setLessonForm] = useState({
    lessonNumber: 1,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 90,
    titleRu: '',
    titleRo: '',
    descriptionRu: '',
    descriptionRo: '',
    topic: '',
    location: 'Online',
    homeworkRu: '',
    homeworkRo: '',
    status: 'scheduled',
  })

  // Форма генерации расписания
  const [generateForm, setGenerateForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    lessonsCount: 12,
    lessonDuration: 90,
    startTime: '10:00',
    weekdays: {
      1: true, // Понедельник
      3: true, // Среда
      5: true, // Пятница
    },
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      loadSchedule()
    }
  }, [selectedGroup])

  const loadData = async () => {
    if (!token) return
    try {
      const [groupsData, topicsData] = await Promise.all([
        getAllGroups(token),
        getTopics(),
      ])
      setGroups(groupsData)
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading data:', error)
      showSnackbar('Ошибка загрузки данных', 'error')
    }
  }

  const loadSchedule = async () => {
    if (!token || !selectedGroup) return
    try {
      const scheduleData = await getGroupSchedule(selectedGroup, token)
      setSchedule(scheduleData)
    } catch (error) {
      console.error('Error loading schedule:', error)
      showSnackbar('Ошибка загрузки расписания', 'error')
    }
  }

  const handleOpenDialog = (lesson?: any) => {
    if (lesson) {
      setEditingLesson(lesson)
      const lessonDate = new Date(lesson.date)
      setLessonForm({
        lessonNumber: lesson.lessonNumber,
        date: lessonDate.toISOString().split('T')[0],
        time: lessonDate.toTimeString().slice(0, 5),
        duration: lesson.duration,
        titleRu: lesson.title.ru,
        titleRo: lesson.title.ro,
        descriptionRu: lesson.description?.ru || '',
        descriptionRo: lesson.description?.ro || '',
        topic: lesson.topic?._id || '',
        location: lesson.location,
        homeworkRu: lesson.homework?.ru || '',
        homeworkRo: lesson.homework?.ro || '',
        status: lesson.status,
      })
    } else {
      setEditingLesson(null)
      const nextLessonNumber = schedule.length > 0
        ? Math.max(...schedule.map((s: any) => s.lessonNumber)) + 1
        : 1
      setLessonForm({
        lessonNumber: nextLessonNumber,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 90,
        titleRu: `Занятие ${nextLessonNumber}`,
        titleRo: `Lecția ${nextLessonNumber}`,
        descriptionRu: '',
        descriptionRo: '',
        topic: '',
        location: 'Online',
        homeworkRu: '',
        homeworkRo: '',
        status: 'scheduled',
      })
    }
    setOpenDialog(true)
  }

  const handleSaveLesson = async () => {
    if (!token || !selectedGroup) return

    try {
      const [hours, minutes] = lessonForm.time.split(':').map(Number)
      const lessonDate = new Date(lessonForm.date)
      lessonDate.setHours(hours, minutes, 0, 0)

      const lessonData = {
        group: selectedGroup,
        lessonNumber: lessonForm.lessonNumber,
        date: lessonDate.toISOString(),
        duration: lessonForm.duration,
        title: {
          ru: lessonForm.titleRu,
          ro: lessonForm.titleRo,
        },
        description: lessonForm.descriptionRu || lessonForm.descriptionRo ? {
          ru: lessonForm.descriptionRu,
          ro: lessonForm.descriptionRo,
        } : undefined,
        topic: lessonForm.topic || undefined,
        location: lessonForm.location,
        homework: lessonForm.homeworkRu || lessonForm.homeworkRo ? {
          ru: lessonForm.homeworkRu,
          ro: lessonForm.homeworkRo,
        } : undefined,
        status: lessonForm.status,
      }

      if (editingLesson) {
        await updateSchedule(editingLesson._id, lessonData, token)
        showSnackbar('Занятие обновлено', 'success')
      } else {
        await createSchedule(lessonData, token)
        showSnackbar('Занятие создано', 'success')
      }

      setOpenDialog(false)
      loadSchedule()
    } catch (error: any) {
      console.error('Error saving lesson:', error)
      showSnackbar(
        error.response?.data?.error?.message || 'Ошибка сохранения',
        'error'
      )
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (!token || !confirm('Удалить занятие?')) return

    try {
      await deleteSchedule(id, token)
      showSnackbar('Занятие удалено', 'success')
      loadSchedule()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      showSnackbar('Ошибка удаления', 'error')
    }
  }

  const handleGenerateSchedule = async () => {
    if (!token || !selectedGroup) return

    try {
      const weekdaysArray = Object.entries(generateForm.weekdays)
        .filter(([_, checked]) => checked)
        .map(([day, _]) => parseInt(day))

      const courseData = {
        groupId: selectedGroup,
        startDate: generateForm.startDate,
        lessonsCount: generateForm.lessonsCount,
        lessonDuration: generateForm.lessonDuration,
        weekdays: weekdaysArray,
        startTime: generateForm.startTime,
      }

      await generateCourseSchedule(courseData, token)
      showSnackbar(
        `Создано ${generateForm.lessonsCount} занятий`,
        'success'
      )
      setOpenGenerateDialog(false)
      loadSchedule()
    } catch (error: any) {
      console.error('Error generating schedule:', error)
      showSnackbar(
        error.response?.data?.error?.message || 'Ошибка генерации',
        'error'
      )
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Запланировано'
      case 'completed': return 'Проведено'
      case 'cancelled': return 'Отменено'
      default: return status
    }
  }

  const selectedGroupData = groups.find((g) => g._id === selectedGroup)
  const weekdayNames: { [key: number]: string } = {
    1: 'Пн',
    2: 'Вт',
    3: 'Ср',
    4: 'Чт',
    5: 'Пт',
    6: 'Сб',
    0: 'Вс',
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Управление расписанием
      </Typography>

      {/* Выбор группы */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Группа</InputLabel>
        <Select
          value={selectedGroup}
          onChange={(e: SelectChangeEvent) => setSelectedGroup(e.target.value)}
          label="Группа"
        >
          <MenuItem value="">
            <em>Выберите группу</em>
          </MenuItem>
          {groups.map((group) => (
            <MenuItem key={group._id} value={group._id}>
              {group.name.ru}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedGroup && (
        <Alert severity="info">Выберите группу для управления расписанием</Alert>
      )}

      {selectedGroup && (
        <>
          {/* Действия */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить занятие
            </Button>
            <Button
              variant="outlined"
              startIcon={<AutorenewIcon />}
              onClick={() => setOpenGenerateDialog(true)}
            >
              Сгенерировать расписание
            </Button>
          </Box>

          {/* Расписание */}
          {schedule.length === 0 && (
            <Alert severity="info">
              Расписание пусто. Добавьте занятия вручную или сгенерируйте автоматически.
            </Alert>
          )}

          {schedule.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Дата и время</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Тема</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.map((lesson) => (
                    <TableRow key={lesson._id}>
                      <TableCell>{lesson.lessonNumber}</TableCell>
                      <TableCell>
                        {new Date(lesson.date).toLocaleString('ru-RU', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {lesson.duration} мин
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {lesson.title.ru}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {lesson.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {lesson.topic?.name?.ru || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(lesson.status)}
                          color={getStatusColor(lesson.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleOpenDialog(lesson)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteLesson(lesson._id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Диалог создания/редактирования занятия */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLesson ? 'Редактировать занятие' : 'Новое занятие'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Номер занятия"
                value={lessonForm.lessonNumber}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, lessonNumber: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Дата"
                value={lessonForm.date}
                onChange={(e) => setLessonForm({ ...lessonForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="time"
                label="Время"
                value={lessonForm.time}
                onChange={(e) => setLessonForm({ ...lessonForm, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Длительность (мин)"
                value={lessonForm.duration}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={lessonForm.status}
                  onChange={(e: SelectChangeEvent) =>
                    setLessonForm({ ...lessonForm, status: e.target.value })
                  }
                  label="Статус"
                >
                  <MenuItem value="scheduled">Запланировано</MenuItem>
                  <MenuItem value="completed">Проведено</MenuItem>
                  <MenuItem value="cancelled">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Название (RU)"
                value={lessonForm.titleRu}
                onChange={(e) => setLessonForm({ ...lessonForm, titleRu: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Название (RO)"
                value={lessonForm.titleRo}
                onChange={(e) => setLessonForm({ ...lessonForm, titleRo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Тема (опционально)</InputLabel>
                <Select
                  value={lessonForm.topic}
                  onChange={(e: SelectChangeEvent) =>
                    setLessonForm({ ...lessonForm, topic: e.target.value })
                  }
                  label="Тема (опционально)"
                >
                  <MenuItem value="">
                    <em>Нет</em>
                  </MenuItem>
                  {topics.map((topic) => (
                    <MenuItem key={topic._id} value={topic._id}>
                      {topic.name.ru}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Место проведения"
                value={lessonForm.location}
                onChange={(e) => setLessonForm({ ...lessonForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Описание (RU)"
                value={lessonForm.descriptionRu}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, descriptionRu: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Описание (RO)"
                value={lessonForm.descriptionRo}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, descriptionRo: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Домашнее задание (RU)"
                value={lessonForm.homeworkRu}
                onChange={(e) => setLessonForm({ ...lessonForm, homeworkRu: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Домашнее задание (RO)"
                value={lessonForm.homeworkRo}
                onChange={(e) => setLessonForm({ ...lessonForm, homeworkRo: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleSaveLesson} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог генерации расписания */}
      <Dialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Генерация расписания курса</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Это удалит существующее расписание и создаст новое!
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Дата начала курса"
                value={generateForm.startDate}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Количество занятий"
                value={generateForm.lessonsCount}
                onChange={(e) =>
                  setGenerateForm({
                    ...generateForm,
                    lessonsCount: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Длительность (мин)"
                value={generateForm.lessonDuration}
                onChange={(e) =>
                  setGenerateForm({
                    ...generateForm,
                    lessonDuration: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="time"
                label="Время начала занятий"
                value={generateForm.startTime}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, startTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Дни недели:
              </Typography>
              {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={generateForm.weekdays[day as keyof typeof generateForm.weekdays] || false}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          weekdays: {
                            ...generateForm.weekdays,
                            [day]: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label={weekdayNames[day]}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>Отмена</Button>
          <Button onClick={handleGenerateSchedule} variant="contained" color="primary">
            Сгенерировать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default ScheduleManager
