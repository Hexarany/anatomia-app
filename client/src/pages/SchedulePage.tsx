import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider,
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  Schedule as ClockIcon,
  Group as GroupIcon,
  Room as LocationIcon,
  Topic as TopicIcon,
} from '@mui/icons-material'

interface ScheduleEntry {
  _id: string
  lessonNumber: number
  title: { ru: string; ro: string }
  date: string
  duration: string
  location?: string
  group: {
    _id: string
    name: { ru: string; ro: string }
  }
  topic?: {
    _id: string
    name: { ru: string; ro: string }
    description?: { ru: string; ro: string }
  }
}

export default function SchedulePage() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const lang = user?.language || 'ru'

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await api.get('/schedule/my')
      setSchedule(response.data)
    } catch (err: any) {
      console.error('Error fetching schedule:', err)
      setError(err.response?.data?.error?.message || 'Ошибка при загрузке расписания')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const locale = lang === 'ru' ? 'ru-RU' : 'ro-RO'

    const dateStr = date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })

    const timeStr = date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })

    return { dateStr, timeStr }
  }

  const getLocalizedText = (text: { ru: string; ro: string } | string | undefined) => {
    if (!text) return ''
    if (typeof text === 'string') return text
    return text[lang] || text.ru || ''
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CalendarIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4">
            {lang === 'ru' ? 'Моё расписание' : 'Orarul meu'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {schedule.length === 0 ? (
          <Alert severity="info">
            {lang === 'ru'
              ? 'У вас пока нет запланированных занятий'
              : 'Nu aveți lecții programate încă'}
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {lang === 'ru'
                ? 'Показаны последние 3 прошедших занятия и все предстоящие'
                : 'Se afișează ultimele 3 lecții trecute și toate lecțiile viitoare'}
            </Typography>

            <List>
              {schedule.map((lesson, index) => {
                const { dateStr, timeStr } = formatDate(lesson.date)
                const isPast = new Date(lesson.date) < new Date()

                return (
                  <Box key={lesson._id}>
                    <ListItem
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        bgcolor: isPast ? 'grey.50' : 'background.paper',
                        borderRadius: 1,
                        mb: 1,
                        opacity: isPast ? 0.7 : 1,
                      }}
                    >
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {lang === 'ru' ? 'Занятие' : 'Lecția'} {lesson.lessonNumber}:{' '}
                          {getLocalizedText(lesson.title)}
                        </Typography>
                        {isPast && (
                          <Chip
                            label={lang === 'ru' ? 'Прошедшее' : 'Trecut'}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GroupIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {getLocalizedText(lesson.group.name)}
                              </Typography>
                            </Box>

                            {lesson.topic && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TopicIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {getLocalizedText(lesson.topic.name)}
                                </Typography>
                              </Box>
                            )}

                            {lesson.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon fontSize="small" color="action" />
                                <Typography variant="body2">{lesson.location}</Typography>
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {dateStr} {timeStr}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ClockIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {lang === 'ru' ? 'Длительность' : 'Durata'}: {lesson.duration}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < schedule.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                )
              })}
            </List>
          </>
        )}
      </Paper>
    </Container>
  )
}
