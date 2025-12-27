import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface BilingualText {
  ru: string
  ro: string
}

interface EducationItem {
  title: BilingualText
  description: BilingualText
}

interface ExperienceItem {
  title: BilingualText
  description: BilingualText
}

interface Stats {
  students: number
  yearsOfExperience: number
  protocols: number
}

interface InstructorProfile {
  _id?: string | null
  photo?: string
  name: BilingualText
  title: BilingualText
  badges: BilingualText[]
  bio: BilingualText
  education: EducationItem[]
  experience: ExperienceItem[]
  philosophy: BilingualText
  stats: Stats
  whyPlatform: BilingualText
  promise: BilingualText
  isActive: boolean
}

const InstructorProfileManager = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState<InstructorProfile>({
    photo: '',
    name: { ru: '', ro: '' },
    title: { ru: '', ro: '' },
    badges: [],
    bio: { ru: '', ro: '' },
    education: [],
    experience: [],
    philosophy: { ru: '', ro: '' },
    stats: { students: 500, yearsOfExperience: 10, protocols: 15 },
    whyPlatform: { ru: '', ro: '' },
    promise: { ru: '', ro: '' },
    isActive: true,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/instructor-profile/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile(response.data)
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError('Ошибка при загрузке профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await axios.post(`${API_URL}/instructor-profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuccess('Профиль успешно сохранен!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.response?.data?.message || 'Ошибка при сохранении профиля')
    } finally {
      setSaving(false)
    }
  }

  const addBadge = () => {
    setProfile({
      ...profile,
      badges: [...profile.badges, { ru: '', ro: '' }],
    })
  }

  const removeBadge = (index: number) => {
    setProfile({
      ...profile,
      badges: profile.badges.filter((_, i) => i !== index),
    })
  }

  const updateBadge = (index: number, lang: 'ru' | 'ro', value: string) => {
    const newBadges = [...profile.badges]
    newBadges[index][lang] = value
    setProfile({ ...profile, badges: newBadges })
  }

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...profile.education,
        {
          title: { ru: '', ro: '' },
          description: { ru: '', ro: '' },
        },
      ],
    })
  }

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index),
    })
  }

  const updateEducation = (index: number, field: 'title' | 'description', lang: 'ru' | 'ro', value: string) => {
    const newEducation = [...profile.education]
    newEducation[index][field][lang] = value
    setProfile({ ...profile, education: newEducation })
  }

  const addExperience = () => {
    setProfile({
      ...profile,
      experience: [
        ...profile.experience,
        {
          title: { ru: '', ro: '' },
          description: { ru: '', ro: '' },
        },
      ],
    })
  }

  const removeExperience = (index: number) => {
    setProfile({
      ...profile,
      experience: profile.experience.filter((_, i) => i !== index),
    })
  }

  const updateExperience = (index: number, field: 'title' | 'description', lang: 'ru' | 'ro', value: string) => {
    const newExperience = [...profile.experience]
    newExperience[index][field][lang] = value
    setProfile({ ...profile, experience: newExperience })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Профиль преподавателя
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProfile}
            disabled={saving}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Basic Info */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Основная информация
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Фото (URL)"
                value={profile.photo || ''}
                onChange={(e) => setProfile({ ...profile, photo: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Имя (RU)"
                value={profile.name.ru}
                onChange={(e) => setProfile({ ...profile, name: { ...profile.name, ru: e.target.value } })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Имя (RO)"
                value={profile.name.ro}
                onChange={(e) => setProfile({ ...profile, name: { ...profile.name, ro: e.target.value } })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Должность (RU)"
                value={profile.title.ru}
                onChange={(e) => setProfile({ ...profile, title: { ...profile.title, ru: e.target.value } })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Должность (RO)"
                value={profile.title.ro}
                onChange={(e) => setProfile({ ...profile, title: { ...profile.title, ro: e.target.value } })}
                required
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Badges */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Бейджи</Typography>
            <Button startIcon={<AddIcon />} onClick={addBadge} size="small">
              Добавить
            </Button>
          </Box>
          {profile.badges.map((badge, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Grid container spacing={2} sx={{ flex: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Текст (RU)"
                        value={badge.ru}
                        onChange={(e) => updateBadge(index, 'ru', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Текст (RO)"
                        value={badge.ro}
                        onChange={(e) => updateBadge(index, 'ro', e.target.value)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <IconButton onClick={() => removeBadge(index)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>

        {/* Bio */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            О преподавателе (Bio)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bio (RU)"
                value={profile.bio.ru}
                onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, ru: e.target.value } })}
                multiline
                rows={4}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bio (RO)"
                value={profile.bio.ro}
                onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, ro: e.target.value } })}
                multiline
                rows={4}
                required
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Education */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Образование</Typography>
            <Button startIcon={<AddIcon />} onClick={addEducation} size="small">
              Добавить
            </Button>
          </Box>
          {profile.education.map((edu, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">Образование #{index + 1}</Typography>
                    <IconButton onClick={() => removeEducation(index)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Заголовок (RU)"
                        value={edu.title.ru}
                        onChange={(e) => updateEducation(index, 'title', 'ru', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Заголовок (RO)"
                        value={edu.title.ro}
                        onChange={(e) => updateEducation(index, 'title', 'ro', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Описание (RU)"
                        value={edu.description.ru}
                        onChange={(e) => updateEducation(index, 'description', 'ru', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Описание (RO)"
                        value={edu.description.ro}
                        onChange={(e) => updateEducation(index, 'description', 'ro', e.target.value)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>

        {/* Experience */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Опыт работы</Typography>
            <Button startIcon={<AddIcon />} onClick={addExperience} size="small">
              Добавить
            </Button>
          </Box>
          {profile.experience.map((exp, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">Опыт #{index + 1}</Typography>
                    <IconButton onClick={() => removeExperience(index)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Заголовок (RU)"
                        value={exp.title.ru}
                        onChange={(e) => updateExperience(index, 'title', 'ru', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Заголовок (RO)"
                        value={exp.title.ro}
                        onChange={(e) => updateExperience(index, 'title', 'ro', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Описание (RU)"
                        value={exp.description.ru}
                        onChange={(e) => updateExperience(index, 'description', 'ru', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Описание (RO)"
                        value={exp.description.ro}
                        onChange={(e) => updateExperience(index, 'description', 'ro', e.target.value)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>

        {/* Philosophy */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Философия преподавания
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Философия (RU)"
                value={profile.philosophy.ru}
                onChange={(e) => setProfile({ ...profile, philosophy: { ...profile.philosophy, ru: e.target.value } })}
                multiline
                rows={4}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Философия (RO)"
                value={profile.philosophy.ro}
                onChange={(e) => setProfile({ ...profile, philosophy: { ...profile.philosophy, ro: e.target.value } })}
                multiline
                rows={4}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Stats */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Статистика
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Количество студентов"
                type="number"
                value={profile.stats.students}
                onChange={(e) =>
                  setProfile({ ...profile, stats: { ...profile.stats, students: Number(e.target.value) } })
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Лет опыта"
                type="number"
                value={profile.stats.yearsOfExperience}
                onChange={(e) =>
                  setProfile({ ...profile, stats: { ...profile.stats, yearsOfExperience: Number(e.target.value) } })
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Протоколов массажа"
                type="number"
                value={profile.stats.protocols}
                onChange={(e) =>
                  setProfile({ ...profile, stats: { ...profile.stats, protocols: Number(e.target.value) } })
                }
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Why Platform */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Почему создана платформа
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Почему платформа (RU)"
                value={profile.whyPlatform.ru}
                onChange={(e) => setProfile({ ...profile, whyPlatform: { ...profile.whyPlatform, ru: e.target.value } })}
                multiline
                rows={4}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Почему платформа (RO)"
                value={profile.whyPlatform.ro}
                onChange={(e) => setProfile({ ...profile, whyPlatform: { ...profile.whyPlatform, ro: e.target.value } })}
                multiline
                rows={4}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Promise */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Обещание студентам
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Обещание (RU)"
                value={profile.promise.ru}
                onChange={(e) => setProfile({ ...profile, promise: { ...profile.promise, ru: e.target.value } })}
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Обещание (RO)"
                value={profile.promise.ro}
                onChange={(e) => setProfile({ ...profile, promise: { ...profile.promise, ro: e.target.value } })}
                multiline
                rows={3}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}

export default InstructorProfileManager
