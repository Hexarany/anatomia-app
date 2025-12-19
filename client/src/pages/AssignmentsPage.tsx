import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getMySubmissions,
  submitAssignment,
  updateSubmission,
  uploadMedia,
} from '@/services/api'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  LinearProgress,
  Paper,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WarningIcon from '@mui/icons-material/Warning'
import DeleteIcon from '@mui/icons-material/Delete'
import AttachFileIcon from '@mui/icons-material/AttachFile'

const AssignmentsPage = () => {
  const { token } = useAuth()
  const { language } = useLanguage()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const [openSubmitDialog, setOpenSubmitDialog] = useState(false)
  const [currentAssignment, setCurrentAssignment] = useState<any>(null)
  const [submissionForm, setSubmissionForm] = useState({
    textAnswer: '',
    files: [] as string[],
    comment: '',
  })

  useEffect(() => {
    loadMySubmissions()
  }, [])

  const loadMySubmissions = async () => {
    try {
      if (!token) return
      setLoading(true)
      const data = await getMySubmissions(token)
      setSubmissions(data)
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка загрузки', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!token || !currentAssignment) return
      setLoading(true)

      const data = {
        textAnswer: submissionForm.textAnswer || undefined,
        files: submissionForm.files.length > 0 ? submissionForm.files : undefined,
      }

      // Если уже сдавал - пересдача
      if (currentAssignment.mySubmission) {
        await updateSubmission(
          currentAssignment.mySubmission._id,
          { ...data, comment: submissionForm.comment },
          token
        )
        showSnackbar('Работа пересдана', 'success')
      } else {
        await submitAssignment(currentAssignment._id, data, token)
        showSnackbar('Работа сдана', 'success')
      }

      setOpenSubmitDialog(false)
      resetForm()
      loadMySubmissions()
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка сдачи', 'error')
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

      setSubmissionForm(prev => ({
        ...prev,
        files: [...prev.files, fileUrl]
      }))

      showSnackbar('Файл загружен', 'success')
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Ошибка загрузки файла', 'error')
    } finally {
      setUploadingFile(false)
    }
  }

  const resetForm = () => {
    setSubmissionForm({
      textAnswer: '',
      files: [],
      comment: '',
    })
  }

  const openSubmitDialogHandler = (submission: any) => {
    setCurrentAssignment(submission.assignment)

    // Если уже есть сдача - заполняем форму предыдущими данными
    if (submission.textAnswer || submission.files) {
      setSubmissionForm({
        textAnswer: submission.textAnswer || '',
        files: submission.files || [],
        comment: '',
      })
    } else {
      resetForm()
    }

    setOpenSubmitDialog(true)
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
      case 'submitted': return language === 'ru' ? 'Сдано' : 'Predat'
      case 'late': return language === 'ru' ? 'Опоздание' : 'Întârziere'
      case 'graded': return language === 'ru' ? 'Проверено' : 'Verificat'
      case 'revision': return language === 'ru' ? 'На доработку' : 'La revizuire'
      default: return status
    }
  }

  const isOverdue = (deadline: string) => new Date() > new Date(deadline)
  const canSubmitLate = (assignment: any) => {
    if (!assignment.allowLateSubmission) return false
    if (!assignment.lateSubmissionDeadline) return true
    return new Date() <= new Date(assignment.lateSubmissionDeadline)
  }

  const canSubmit = (submission: any) => {
    const assignment = submission.assignment
    if (!assignment) return false

    // Если уже сдавал и проверено - можно пересдать
    if (submission.status === 'graded' || submission.status === 'revision') {
      return true
    }

    // Если не сдавал
    if (!submission.submittedAt) {
      // Проверяем дедлайн
      if (isOverdue(assignment.deadline)) {
        return canSubmitLate(assignment)
      }
      return true
    }

    return false
  }

  // Группируем задания: активные (не сданы или на доработку) и завершенные (проверены)
  const activeAssignments = submissions.filter(s =>
    !s.status || s.status === 'submitted' || s.status === 'late' || s.status === 'revision'
  )
  const completedAssignments = submissions.filter(s => s.status === 'graded')

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {language === 'ru' ? 'Мои домашние задания' : 'Temele mele de casă'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {language === 'ru'
            ? 'Здесь вы можете просмотреть и сдать домашние задания'
            : 'Aici puteți vedea și trimite temele de casă'}
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Активные задания */}
      {activeAssignments.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {language === 'ru' ? 'Активные задания' : 'Sarcini active'}
          </Typography>
          <Grid container spacing={2}>
            {activeAssignments.map((submission) => {
              const assignment = submission.assignment
              if (!assignment) return null

              const deadline = new Date(assignment.deadline)
              const overdueStatus = isOverdue(assignment.deadline)

              return (
                <Grid item xs={12} key={submission._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" gutterBottom>
                            {assignment.title[language]}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {assignment.description[language]}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<AccessTimeIcon />}
                              label={`До: ${deadline.toLocaleString(language === 'ru' ? 'ru-RU' : 'ro-RO')}`}
                              size="small"
                              color={overdueStatus ? 'error' : 'default'}
                            />
                            <Chip
                              label={`Макс. балл: ${assignment.maxScore}`}
                              size="small"
                              variant="outlined"
                            />
                            {submission.status && (
                              <Chip
                                label={getStatusLabel(submission.status)}
                                size="small"
                                color={getStatusColor(submission.status)}
                              />
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          {submission.grade !== undefined ? (
                            <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                              <Typography variant="h5" align="center">
                                {submission.grade} / {assignment.maxScore}
                              </Typography>
                              <Typography variant="body2" align="center" color="textSecondary">
                                {language === 'ru' ? 'Ваша оценка' : 'Nota dvs.'}
                              </Typography>
                              {submission.feedback && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  <strong>{language === 'ru' ? 'Комментарий:' : 'Comentariu:'}</strong>{' '}
                                  {submission.feedback}
                                </Typography>
                              )}
                            </Paper>
                          ) : submission.submittedAt ? (
                            <Alert severity="info">
                              {language === 'ru' ? 'Сдано' : 'Predat'}:{' '}
                              {new Date(submission.submittedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'ro-RO')}
                              <br />
                              {language === 'ru' ? 'Ожидает проверки' : 'Așteaptă verificare'}
                            </Alert>
                          ) : (
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => openSubmitDialogHandler(submission)}
                              disabled={!canSubmit(submission)}
                              startIcon={<AssignmentIcon />}
                            >
                              {overdueStatus && !canSubmitLate(assignment)
                                ? (language === 'ru' ? 'Дедлайн прошёл' : 'Termenul a expirat')
                                : (language === 'ru' ? 'Сдать работу' : 'Trimite lucrarea')}
                            </Button>
                          )}

                          {canSubmit(submission) && submission.submittedAt && (
                            <Button
                              variant="outlined"
                              fullWidth
                              sx={{ mt: 1 }}
                              onClick={() => openSubmitDialogHandler(submission)}
                            >
                              {language === 'ru' ? 'Пересдать' : 'Retrimite'}
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* Завершенные задания */}
      {completedAssignments.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {language === 'ru' ? 'Завершенные задания' : 'Sarcini finalizate'}
          </Typography>
          <Grid container spacing={2}>
            {completedAssignments.map((submission) => {
              const assignment = submission.assignment
              if (!assignment) return null

              return (
                <Grid item xs={12} sm={6} md={4} key={submission._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {submission.grade} / {assignment.maxScore}
                        </Typography>
                      </Box>
                      <Typography variant="body2" gutterBottom>
                        {assignment.title[language]}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {language === 'ru' ? 'Сдано' : 'Predat'}:{' '}
                        {new Date(submission.submittedAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'ro-RO')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {submissions.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {language === 'ru' ? 'Нет заданий' : 'Nu există sarcini'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {language === 'ru'
              ? 'Когда преподаватель создаст задания, они появятся здесь'
              : 'Când profesorul va crea sarcini, acestea vor apărea aici'}
          </Typography>
        </Paper>
      )}

      {/* Диалог сдачи работы */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentAssignment?.mySubmission
            ? (language === 'ru' ? 'Пересдать работу' : 'Retrimite lucrarea')
            : (language === 'ru' ? 'Сдать работу' : 'Trimite lucrarea')}
        </DialogTitle>
        <DialogContent>
          {currentAssignment && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {currentAssignment.title[language]}
              </Typography>
              <Typography variant="body2" paragraph>
                {currentAssignment.description[language]}
              </Typography>

              {currentAssignment.instructions && currentAssignment.instructions[language] && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>{language === 'ru' ? 'Инструкции:' : 'Instrucțiuni:'}</strong>
                  <br />
                  {currentAssignment.instructions[language]}
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                multiline
                rows={6}
                label={language === 'ru' ? 'Текстовый ответ' : 'Răspuns text'}
                value={submissionForm.textAnswer}
                onChange={(e) => setSubmissionForm({ ...submissionForm, textAnswer: e.target.value })}
                sx={{ mb: 2 }}
                helperText={
                  !currentAssignment.requiresFile
                    ? (language === 'ru' ? 'Можно ответить текстом без файла' : 'Puteți răspunde cu text fără fișier')
                    : ''
                }
              />

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={uploadingFile}
                fullWidth
                sx={{ mb: 1 }}
              >
                {uploadingFile
                  ? (language === 'ru' ? 'Загрузка...' : 'Se încarcă...')
                  : (language === 'ru' ? 'Прикрепить файл' : 'Atașează fișier')}
                <input type="file" hidden onChange={handleFileUpload} />
              </Button>

              {currentAssignment.requiresFile && submissionForm.files.length === 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {language === 'ru'
                    ? 'Для этого задания требуется прикрепить файл'
                    : 'Pentru această sarcină este necesar să atașați un fișier'}
                </Alert>
              )}

              {submissionForm.files.length > 0 && (
                <List dense>
                  {submissionForm.files.map((url, index) => (
                    <ListItem key={index}>
                      <AttachFileIcon sx={{ mr: 1 }} />
                      <ListItemText
                        primary={`${language === 'ru' ? 'Файл' : 'Fișier'} ${index + 1}`}
                        secondary={url.substring(url.lastIndexOf('/') + 1, url.length).substring(0, 30)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setSubmissionForm(prev => ({
                              ...prev,
                              files: prev.files.filter((_, i) => i !== index)
                            }))
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {currentAssignment.mySubmission && (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={language === 'ru' ? 'Комментарий к пересдаче' : 'Comentariu la retransmitere'}
                  value={submissionForm.comment}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, comment: e.target.value })}
                  sx={{ mt: 2 }}
                  placeholder={
                    language === 'ru'
                      ? 'Что вы исправили или изменили?'
                      : 'Ce ați corectat sau schimbat?'
                  }
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>
            {language === 'ru' ? 'Отмена' : 'Anulare'}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              (currentAssignment?.requiresFile && submissionForm.files.length === 0 && !submissionForm.textAnswer)
            }
          >
            {currentAssignment?.mySubmission
              ? (language === 'ru' ? 'Пересдать' : 'Retrimite')
              : (language === 'ru' ? 'Сдать' : 'Trimite')}
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
    </Container>
  )
}

export default AssignmentsPage
