import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getAllGroups,
  getGroupSchedule,
  getGroupAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  uploadMedia,
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
  LinearProgress,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AssignmentIcon from '@mui/icons-material/Assignment'
import GradeIcon from '@mui/icons-material/Grade'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
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

const AssignmentsManager = () => {
  const { token } = useAuth()
  const { language } = useLanguage()
  const [tabValue, setTabValue] = useState(0)
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [schedule, setSchedule] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])

  const [openDialog, setOpenDialog] = useState(false)
  const [openSubmissionsDialog, setOpenSubmissionsDialog] = useState(false)
  const [openGradeDialog, setOpenGradeDialog] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)
  const [viewingSubmissions, setViewingSubmissions] = useState<any>(null)
  const [gradingSubmission, setGradingSubmission] = useState<any>(null)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Форма задания
  const [assignmentForm, setAssignmentForm] = useState({
    schedule: '',
    titleRu: '',
    titleRo: '',
    descriptionRu: '',
    descriptionRo: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 дней
    deadlineTime: '23:59',
    maxScore: 10,
    allowLateSubmission: false,
    lateDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lateDeadlineTime: '23:59',
    instructionsRu: '',
    instructionsRo: '',
    requiresFile: true,
    attachments: [] as string[],
  })

  // Форма оценки
  const [gradeForm, setGradeForm] = useState({
    grade: 10,
    feedback: '',
  })

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      loadGroupData()
    }
  }, [selectedGroup])

  const loadGroups = async () => {
    try {
      if (!token) return
      const data = await getAllGroups(token)
      setGroups(data)
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка загрузки групп', 'error')
    }
  }

  const loadGroupData = async () => {
    try {
      if (!token) return
      setLoading(true)
      const [scheduleData, assignmentsData] = await Promise.all([
        getGroupSchedule(selectedGroup, token),
        getGroupAssignments(selectedGroup, token),
      ])
      setSchedule(scheduleData)
      setAssignments(assignmentsData)
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка загрузки данных', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async () => {
    try {
      if (!token) return
      setLoading(true)

      const deadlineISO = `${assignmentForm.deadline}T${assignmentForm.deadlineTime}:00Z`
      const lateDeadlineISO = assignmentForm.allowLateSubmission
        ? `${assignmentForm.lateDeadline}T${assignmentForm.lateDeadlineTime}:00Z`
        : undefined

      const data = {
        schedule: assignmentForm.schedule,
        group: selectedGroup,
        title: {
          ru: assignmentForm.titleRu,
          ro: assignmentForm.titleRo,
        },
        description: {
          ru: assignmentForm.descriptionRu,
          ro: assignmentForm.descriptionRo,
        },
        deadline: deadlineISO,
        maxScore: assignmentForm.maxScore,
        allowLateSubmission: assignmentForm.allowLateSubmission,
        lateSubmissionDeadline: lateDeadlineISO,
        instructions: assignmentForm.instructionsRu || assignmentForm.instructionsRo ? {
          ru: assignmentForm.instructionsRu,
          ro: assignmentForm.instructionsRo,
        } : undefined,
        requiresFile: assignmentForm.requiresFile,
        attachments: assignmentForm.attachments,
      }

      if (editingAssignment) {
        await updateAssignment(editingAssignment._id, data, token)
        showSnackbar('Задание обновлено', 'success')
      } else {
        await createAssignment(data, token)
        showSnackbar('Задание создано', 'success')
      }

      setOpenDialog(false)
      resetForm()
      loadGroupData()
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка сохранения', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Удалить задание? Все сданные работы также будут удалены!')) return
    try {
      if (!token) return
      await deleteAssignment(id, token)
      showSnackbar('Задание удалено', 'success')
      loadGroupData()
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка удаления', 'error')
    }
  }

  const handleViewSubmissions = async (assignment: any) => {
    try {
      if (!token) return
      setLoading(true)
      const data = await getAssignmentSubmissions(assignment._id, token)
      setSubmissions(data)
      setViewingSubmissions(assignment)
      setOpenSubmissionsDialog(true)
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка загрузки', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = async () => {
    try {
      if (!token || !gradingSubmission) return
      setLoading(true)

      await gradeSubmission(gradingSubmission._id, gradeForm, token)
      showSnackbar('Оценка выставлена', 'success')

      setOpenGradeDialog(false)
      setGradingSubmission(null)

      // Обновляем список сдач
      if (viewingSubmissions) {
        const data = await getAssignmentSubmissions(viewingSubmissions._id, token)
        setSubmissions(data)
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка выставления оценки', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      if (!token) return
      setUploadingFile(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await uploadMedia(formData, token)
      const fileUrl = response.fileUrl

      setAssignmentForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, fileUrl]
      }))

      showSnackbar('Файл загружен', 'success')
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка загрузки файла', 'error')
    } finally {
      setUploadingFile(false)
    }
  }

  const resetForm = () => {
    setAssignmentForm({
      schedule: '',
      titleRu: '',
      titleRo: '',
      descriptionRu: '',
      descriptionRo: '',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deadlineTime: '23:59',
      maxScore: 10,
      allowLateSubmission: false,
      lateDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lateDeadlineTime: '23:59',
      instructionsRu: '',
      instructionsRo: '',
      requiresFile: true,
      attachments: [],
    })
    setEditingAssignment(null)
  }

  const openEditDialog = (assignment: any) => {
    setEditingAssignment(assignment)
    const deadline = new Date(assignment.deadline)
    const lateDeadline = assignment.lateSubmissionDeadline ? new Date(assignment.lateSubmissionDeadline) : new Date()

    setAssignmentForm({
      schedule: assignment.schedule?._id || assignment.schedule,
      titleRu: assignment.title.ru,
      titleRo: assignment.title.ro,
      descriptionRu: assignment.description.ru,
      descriptionRo: assignment.description.ro,
      deadline: deadline.toISOString().split('T')[0],
      deadlineTime: deadline.toISOString().split('T')[1].substring(0, 5),
      maxScore: assignment.maxScore,
      allowLateSubmission: assignment.allowLateSubmission,
      lateDeadline: lateDeadline.toISOString().split('T')[0],
      lateDeadlineTime: lateDeadline.toISOString().split('T')[1].substring(0, 5),
      instructionsRu: assignment.instructions?.ru || '',
      instructionsRo: assignment.instructions?.ro || '',
      requiresFile: assignment.requiresFile,
      attachments: assignment.attachments || [],
    })
    setOpenDialog(true)
  }

  const openGradeDialogHandler = (submission: any) => {
    setGradingSubmission(submission)
    setGradeForm({
      grade: submission.grade || viewingSubmissions?.maxScore || 10,
      feedback: submission.feedback || '',
    })
    setOpenGradeDialog(true)
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'info'
      case 'late': return 'warning'
      case 'graded': return 'success'
      case 'revision': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Сдано'
      case 'late': return 'Опоздание'
      case 'graded': return 'Проверено'
      case 'revision': return 'На доработку'
      default: return status
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Домашние задания
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Выберите группу</InputLabel>
                <Select
                  value={selectedGroup}
                  onChange={(e: SelectChangeEvent) => setSelectedGroup(e.target.value)}
                  label="Выберите группу"
                >
                  {groups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name[language]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetForm()
                  setOpenDialog(true)
                }}
                disabled={!selectedGroup}
                fullWidth
              >
                Создать задание
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {selectedGroup && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Урок</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Дедлайн</TableCell>
                <TableCell>Макс. балл</TableCell>
                <TableCell>Сдано работ</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">Нет заданий</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => {
                  const scheduleInfo = schedule.find(s => s._id === assignment.schedule)
                  const isOverdue = new Date() > new Date(assignment.deadline)

                  return (
                    <TableRow key={assignment._id}>
                      <TableCell>
                        {scheduleInfo ? `Урок ${scheduleInfo.lessonNumber}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{assignment.title[language]}</Typography>
                        {isOverdue && <Chip label="Просрочено" size="small" color="error" sx={{ mt: 0.5 }} />}
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.deadline).toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell>{assignment.maxScore}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewSubmissions(assignment)}
                        >
                          Смотреть
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(assignment)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAssignment(assignment._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог создания/редактирования задания */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Редактировать задание' : 'Создать задание'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Занятие</InputLabel>
                  <Select
                    value={assignmentForm.schedule}
                    onChange={(e: SelectChangeEvent) =>
                      setAssignmentForm({ ...assignmentForm, schedule: e.target.value })
                    }
                    label="Занятие"
                  >
                    {schedule.map((lesson) => (
                      <MenuItem key={lesson._id} value={lesson._id}>
                        Урок {lesson.lessonNumber}: {lesson.title[language]} ({new Date(lesson.date).toLocaleDateString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Название (RU)"
                  value={assignmentForm.titleRu}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, titleRu: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Название (RO)"
                  value={assignmentForm.titleRo}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, titleRo: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Описание (RU)"
                  value={assignmentForm.descriptionRu}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, descriptionRu: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Описание (RO)"
                  value={assignmentForm.descriptionRo}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, descriptionRo: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  type="date"
                  label="Дедлайн (дата)"
                  value={assignmentForm.deadline}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="time"
                  label="Время"
                  value={assignmentForm.deadlineTime}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, deadlineTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Максимальный балл"
                  value={assignmentForm.maxScore}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, maxScore: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assignmentForm.allowLateSubmission}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, allowLateSubmission: e.target.checked })}
                    />
                  }
                  label="Разрешить позднюю сдачу"
                />
              </Grid>

              {assignmentForm.allowLateSubmission && (
                <>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Крайний срок поздней сдачи (дата)"
                      value={assignmentForm.lateDeadline}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, lateDeadline: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Время"
                      value={assignmentForm.lateDeadlineTime}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, lateDeadlineTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Дополнительные инструкции (RU)"
                  value={assignmentForm.instructionsRu}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructionsRu: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Дополнительные инструкции (RO)"
                  value={assignmentForm.instructionsRo}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructionsRo: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assignmentForm.requiresFile}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, requiresFile: e.target.checked })}
                    />
                  }
                  label="Требуется прикрепление файла"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? 'Загрузка...' : 'Прикрепить файл'}
                  <input type="file" hidden onChange={handleFileUpload} />
                </Button>
                {assignmentForm.attachments.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {assignmentForm.attachments.map((url, index) => (
                      <Chip
                        key={index}
                        label={`Файл ${index + 1}`}
                        onDelete={() => {
                          setAssignmentForm(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index)
                          }))
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleCreateAssignment}
            disabled={loading || !assignmentForm.schedule || !assignmentForm.titleRu}
          >
            {editingAssignment ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра сдач */}
      <Dialog
        open={openSubmissionsDialog}
        onClose={() => setOpenSubmissionsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Сданные работы: {viewingSubmissions?.title[language]}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Студент</TableCell>
                  <TableCell>Дата сдачи</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Оценка</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">Никто не сдал</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>{submission.student?.name || 'Студент'}</TableCell>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(submission.status)}
                          color={getStatusColor(submission.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {submission.grade !== undefined
                          ? `${submission.grade}/${viewingSubmissions?.maxScore}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<GradeIcon />}
                          onClick={() => openGradeDialogHandler(submission)}
                        >
                          {submission.grade !== undefined ? 'Изменить' : 'Оценить'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmissionsDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог выставления оценки */}
      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Выставить оценку</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {gradingSubmission && (
              <>
                <Typography variant="body2" gutterBottom>
                  <strong>Студент:</strong> {gradingSubmission.student?.name}
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                  <strong>Дата сдачи:</strong> {new Date(gradingSubmission.submittedAt).toLocaleString('ru-RU')}
                </Typography>

                {gradingSubmission.textAnswer && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Текстовый ответ:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {gradingSubmission.textAnswer}
                    </Typography>
                  </Box>
                )}

                {gradingSubmission.files && gradingSubmission.files.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Прикрепленные файлы:</strong>
                    </Typography>
                    {gradingSubmission.files.map((fileUrl: string, index: number) => (
                      <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        href={fileUrl}
                        target="_blank"
                        sx={{ mr: 1, mb: 1 }}
                      >
                        Файл {index + 1}
                      </Button>
                    ))}
                  </Box>
                )}

                <TextField
                  fullWidth
                  type="number"
                  label={`Оценка (из ${viewingSubmissions?.maxScore || 10})`}
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: viewingSubmissions?.maxScore || 10 }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Комментарий / Feedback"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradeDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleGradeSubmission}
            disabled={loading}
          >
            Сохранить оценку
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AssignmentsManager
