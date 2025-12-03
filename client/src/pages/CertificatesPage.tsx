import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'
import VerifiedIcon from '@mui/icons-material/Verified'
import SchoolIcon from '@mui/icons-material/School'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useAuth } from '@/contexts/AuthContext'
import {
  getAvailableCertificates,
  getUserCertificates,
  generateCertificate,
  downloadCertificatePDF,
  type Certificate,
  type AvailableCertificate,
} from '@/services/api'

const CertificatesPage = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const lang = i18n.language as 'ru' | 'ro'

  const [loading, setLoading] = useState(true)
  const [availableCerts, setAvailableCerts] = useState<AvailableCertificate[]>([])
  const [earnedCerts, setEarnedCerts] = useState<Certificate[]>([])
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedCert, setSelectedCert] = useState<AvailableCertificate | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadCertificates()
  }, [isAuthenticated, navigate])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      setError(null)
      const [availableResponse, earnedResponse] = await Promise.all([
        getAvailableCertificates(),
        getUserCertificates(),
      ])
      setAvailableCerts(availableResponse.certificates)
      setEarnedCerts(earnedResponse.certificates)
    } catch (err: any) {
      console.error('Error loading certificates:', err)
      setError(err.response?.data?.message || 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async (certType: string) => {
    try {
      setGenerating(certType)
      setError(null)
      await generateCertificate(certType)
      await loadCertificates()
      setDetailsDialogOpen(false)
    } catch (err: any) {
      console.error('Error generating certificate:', err)
      setError(err.response?.data?.message || 'Failed to generate certificate')
    } finally {
      setGenerating(null)
    }
  }

  const handleDownloadCertificate = async (certificateId: string, certificateNumber: string) => {
    try {
      const blob = await downloadCertificatePDF(certificateId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `certificate-${certificateNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Error downloading certificate:', err)
      setError('Failed to download certificate')
    }
  }

  const handleViewDetails = (cert: AvailableCertificate) => {
    setSelectedCert(cert)
    setDetailsDialogOpen(true)
  }

  const getProgressPercentage = (cert: AvailableCertificate, metric: 'topics' | 'quizzes' | 'score') => {
    if (metric === 'topics') {
      return Math.min((cert.progress.topicsCompleted / cert.requirements.minTopicsCompleted) * 100, 100)
    } else if (metric === 'quizzes') {
      return Math.min((cert.progress.quizzesPassed / cert.requirements.minQuizzesPassed) * 100, 100)
    } else {
      return Math.min((cert.progress.averageScore / cert.requirements.minAverageScore) * 100, 100)
    }
  }

  const getCertificateIcon = (type: string) => {
    switch (type) {
      case 'course_completion':
        return <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
      case 'topic_mastery':
        return <VerifiedIcon sx={{ fontSize: 48, color: 'success.main' }} />
      case 'exam_excellence':
        return <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main' }} />
      case 'full_course':
        return <WorkspacePremiumIcon sx={{ fontSize: 48, color: 'error.main' }} />
      default:
        return <WorkspacePremiumIcon sx={{ fontSize: 48 }} />
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          <WorkspacePremiumIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
          {lang === 'ru' ? 'Сертификаты' : 'Certificate'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {lang === 'ru'
            ? 'Получайте сертификаты за достижения в обучении'
            : 'Obțineți certificate pentru realizări în învățare'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Earned Certificates */}
      {earnedCerts.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            {lang === 'ru' ? 'Мои сертификаты' : 'Certificatele mele'}
            <Chip
              label={earnedCerts.length}
              size="small"
              color="success"
              sx={{ ml: 2 }}
            />
          </Typography>
          <Grid container spacing={3}>
            {earnedCerts.map((cert) => (
              <Grid item xs={12} md={6} key={cert._id}>
                <Card
                  elevation={3}
                  sx={{
                    border: '2px solid',
                    borderColor: 'success.light',
                    bgcolor: 'success.50',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getCertificateIcon(cert.certificateType)}
                        <CheckCircleIcon
                          sx={{
                            ml: -1,
                            mt: -1,
                            fontSize: 24,
                            color: 'success.main',
                            bgcolor: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                      <Chip
                        label={lang === 'ru' ? 'Получен' : 'Obținut'}
                        size="small"
                        color="success"
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {cert.title[lang]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {cert.description[lang]}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {lang === 'ru' ? 'Номер' : 'Număr'}: {cert.certificateNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(cert.issuedAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'ro-RO')}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadCertificate(cert._id, cert.certificateNumber)}
                      sx={{ mt: 2 }}
                    >
                      {lang === 'ru' ? 'Скачать PDF' : 'Descarcă PDF'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Available Certificates */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          {lang === 'ru' ? 'Доступные сертификаты' : 'Certificate disponibile'}
        </Typography>
        <Grid container spacing={3}>
          {availableCerts.map((cert) => {
            const isEarned = earnedCerts.some((ec) => ec.certificateType === cert.type)
            const topicsProgress = getProgressPercentage(cert, 'topics')
            const quizzesProgress = getProgressPercentage(cert, 'quizzes')
            const scoreProgress = getProgressPercentage(cert, 'score')

            return (
              <Grid item xs={12} md={6} key={cert.type}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    opacity: isEarned ? 0.7 : 1,
                    transition: 'transform 0.2s',
                    '&:hover': !isEarned ? { transform: 'translateY(-4px)', boxShadow: 4 } : {},
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>{getCertificateIcon(cert.type)}</Box>
                      {cert.eligible ? (
                        <Chip
                          label={lang === 'ru' ? 'Доступен' : 'Disponibil'}
                          size="small"
                          color="success"
                          icon={<CheckCircleIcon />}
                        />
                      ) : (
                        <Chip
                          label={lang === 'ru' ? 'Заблокирован' : 'Blocat'}
                          size="small"
                          icon={<LockIcon />}
                        />
                      )}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {cert.title[lang]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {cert.description[lang]}
                    </Typography>

                    {/* Progress Bars */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">
                            {lang === 'ru' ? 'Темы' : 'Teme'}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {cert.progress.topicsCompleted} / {cert.requirements.minTopicsCompleted}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={topicsProgress}
                          sx={{ height: 6, borderRadius: 1 }}
                          color={topicsProgress >= 100 ? 'success' : 'primary'}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">
                            {lang === 'ru' ? 'Тесты' : 'Teste'}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {cert.progress.quizzesPassed} / {cert.requirements.minQuizzesPassed}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={quizzesProgress}
                          sx={{ height: 6, borderRadius: 1 }}
                          color={quizzesProgress >= 100 ? 'success' : 'primary'}
                        />
                      </Box>

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">
                            {lang === 'ru' ? 'Средний балл' : 'Medie'}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {cert.progress.averageScore}% / {cert.requirements.minAverageScore}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={scoreProgress}
                          sx={{ height: 6, borderRadius: 1 }}
                          color={scoreProgress >= 100 ? 'success' : 'primary'}
                        />
                      </Box>
                    </Box>

                    <Button
                      variant={cert.eligible ? 'contained' : 'outlined'}
                      fullWidth
                      disabled={!cert.eligible || isEarned}
                      onClick={() => handleViewDetails(cert)}
                      sx={{ mt: 2 }}
                    >
                      {isEarned
                        ? (lang === 'ru' ? 'Уже получен' : 'Deja obținut')
                        : cert.eligible
                        ? (lang === 'ru' ? 'Получить сертификат' : 'Obține certificat')
                        : (lang === 'ru' ? 'Требования' : 'Cerințe')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCert && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getCertificateIcon(selectedCert.type)}
                <Box>
                  <Typography variant="h6">{selectedCert.title[lang]}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedCert.description[lang]}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                {lang === 'ru' ? 'Требования:' : 'Cerințe:'}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {selectedCert.progress.topicsCompleted >= selectedCert.requirements.minTopicsCompleted ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <LockIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${lang === 'ru' ? 'Завершить' : 'Finalizează'} ${selectedCert.requirements.minTopicsCompleted} ${lang === 'ru' ? 'тем' : 'teme'}`}
                    secondary={`${lang === 'ru' ? 'Завершено' : 'Finalizat'}: ${selectedCert.progress.topicsCompleted}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {selectedCert.progress.quizzesPassed >= selectedCert.requirements.minQuizzesPassed ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <LockIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${lang === 'ru' ? 'Пройти' : 'Treci'} ${selectedCert.requirements.minQuizzesPassed} ${lang === 'ru' ? 'тестов' : 'teste'}`}
                    secondary={`${lang === 'ru' ? 'Пройдено' : 'Trecut'}: ${selectedCert.progress.quizzesPassed}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {selectedCert.progress.averageScore >= selectedCert.requirements.minAverageScore ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <LockIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${lang === 'ru' ? 'Средний балл' : 'Scor mediu'} ≥ ${selectedCert.requirements.minAverageScore}%`}
                    secondary={`${lang === 'ru' ? 'Текущий' : 'Actual'}: ${selectedCert.progress.averageScore}%`}
                  />
                </ListItem>
              </List>
              {selectedCert.eligible && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {lang === 'ru'
                    ? 'Вы выполнили все требования! Вы можете получить этот сертификат.'
                    : 'Ați îndeplinit toate cerințele! Puteți obține acest certificat.'}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                {lang === 'ru' ? 'Закрыть' : 'Închide'}
              </Button>
              {selectedCert.eligible && (
                <Button
                  variant="contained"
                  onClick={() => handleGenerateCertificate(selectedCert.type)}
                  disabled={generating === selectedCert.type}
                  startIcon={generating === selectedCert.type ? <CircularProgress size={20} /> : <WorkspacePremiumIcon />}
                >
                  {generating === selectedCert.type
                    ? (lang === 'ru' ? 'Генерация...' : 'Se generează...')
                    : (lang === 'ru' ? 'Получить сертификат' : 'Obține certificat')}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default CertificatesPage
