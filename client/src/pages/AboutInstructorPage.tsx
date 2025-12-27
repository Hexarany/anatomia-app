import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  School as SchoolIcon,
  WorkHistory as WorkIcon,
  EmojiEvents as AwardIcon,
  Favorite as HeartIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

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
}

// Default fallback content
const DEFAULT_PROFILE: InstructorProfile = {
  name: { ru: 'Денис Матиевич', ro: 'Denis Matievici' },
  title: {
    ru: 'Сертифицированный массажист • Преподаватель',
    ro: 'Maseur certificat • Profesor',
  },
  badges: [
    { ru: '10+ лет опыта', ro: '10+ ani experiență' },
    { ru: 'Сертифицированный специалист', ro: 'Specialist certificat' },
    { ru: 'Автор курса', ro: 'Autor curs' },
  ],
  bio: {
    ru: 'Добро пожаловать! Меня зовут Денис Матиевич, и я рад приветствовать вас на платформе MateevMassage. За более чем 10 лет практики в области массажной терапии я помог сотням людей не только освоить профессиональные техники массажа, но и построить успешную карьеру в этой сфере.',
    ro: 'Bine ați venit! Numele meu este Denis Matievici și sunt bucuros să vă salut pe platforma MateevMassage. În peste 10 ani de practică în domeniul terapiei prin masaj, am ajutat sute de persoane nu doar să stăpânească tehnicile profesionale de masaj, ci și să construiască o carieră de succes în acest domeniu.',
  },
  education: [],
  experience: [],
  philosophy: {
    ru: 'Я верю, что качественное образование должно быть практичным и доступным.',
    ro: 'Cred că educația de calitate trebuie să fie practică și accesibilă.',
  },
  stats: { students: 500, yearsOfExperience: 10, protocols: 15 },
  whyPlatform: {
    ru: 'На протяжении многих лет обучения студентов я заметил, что многим не хватает структурированного подхода к изучению массажа.',
    ro: 'Pe parcursul multor ani de predare, am observat că multor studenți le lipsește o abordare structurată în învățarea masajului.',
  },
  promise: {
    ru: 'Я буду постоянно обновлять и улучшать эту платформу, добавлять новые протоколы, отвечать на ваши вопросы и помогать вам становиться профессионалами в массажной терапии.',
    ro: 'Voi actualiza și îmbunătăți constant această platformă, voi adăuga noi protocoale, voi răspunde la întrebările dvs. și vă voi ajuta să deveniți profesioniști în terapia prin masaj.',
  },
}

const AboutInstructorPage = () => {
  const { t, i18n } = useTranslation()
  const isRu = i18n.language === 'ru'
  const [profile, setProfile] = useState<InstructorProfile>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/instructor-profile`)
      setProfile(response.data)
    } catch (err) {
      console.log('Using default instructor profile')
      // Use default profile
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        {profile.photo ? (
          <Avatar
            src={profile.photo}
            sx={{
              width: 180,
              height: 180,
              mx: 'auto',
              mb: 3,
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 180,
              height: 180,
              mx: 'auto',
              mb: 3,
              fontSize: '4rem',
              bgcolor: 'primary.main',
            }}
          >
            {profile.name[isRu ? 'ru' : 'ro']
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Avatar>
        )}
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {profile.name[isRu ? 'ru' : 'ro']}
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {profile.title[isRu ? 'ru' : 'ro']}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          {profile.badges.map((badge, index) => (
            <Chip
              key={index}
              label={badge[isRu ? 'ru' : 'ro']}
              color={index === 0 ? 'primary' : index === 1 ? 'success' : 'secondary'}
            />
          ))}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* About Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <HeartIcon color="primary" />
              <Typography variant="h5" fontWeight={600}>
                {isRu ? 'О преподавателе' : 'Despre profesor'}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {isRu
                ? 'Добро пожаловать! Меня зовут Денис Матиевич, и я рад приветствовать вас на платформе MateevMassage. За более чем 10 лет практики в области массажной терапии я помог сотням людей не только освоить профессиональные техники массажа, но и построить успешную карьеру в этой сфере.'
                : 'Bine ați venit! Numele meu este Denis Matievici și sunt bucuros să vă salut pe platforma MateevMassage. În peste 10 ani de practică în domeniul terapiei prin masaj, am ajutat sute de persoane nu doar să stăpânească tehnicile profesionale de masaj, ci și să construiască o carieră de succes în acest domeniu.'}
            </Typography>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {isRu
                ? 'Моя миссия — сделать качественное образование в области массажной терапии доступным для каждого. Я создал эту платформу, чтобы объединить теоретические знания анатомии с практическими протоколами массажа, предоставляя студентам всё необходимое для профессионального роста.'
                : 'Misiunea mea este să fac educația de calitate în domeniul terapiei prin masaj accesibilă pentru toată lumea. Am creat această platformă pentru a combina cunoștințele teoretice de anatomie cu protocoale practice de masaj, oferind studenților tot ce este necesar pentru creșterea profesională.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Education Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SchoolIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {isRu ? 'Образование и сертификаты' : 'Educație și certificate'}
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      isRu
                        ? 'Сертифицированный массажист'
                        : 'Maseur certificat'
                    }
                    secondary={
                      isRu
                        ? 'Диплом профессионального массажиста'
                        : 'Diplomă de maseur profesionist'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      isRu
                        ? 'Специализация: Лечебный массаж'
                        : 'Specializare: Masaj terapeutic'
                    }
                    secondary={
                      isRu
                        ? 'Техники спортивного и реабилитационного массажа'
                        : 'Tehnici de masaj sportiv și de recuperare'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      isRu
                        ? 'Углубленное изучение анатомии'
                        : 'Studiu aprofundat al anatomiei'
                    }
                    secondary={
                      isRu
                        ? 'Анатомия и физиология человека'
                        : 'Anatomie și fiziologie umană'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      isRu
                        ? 'Постоянное повышение квалификации'
                        : 'Formare profesională continuă'
                    }
                    secondary={
                      isRu
                        ? 'Регулярное участие в семинарах и тренингах'
                        : 'Participare regulată la seminarii și training-uri'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Experience Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <WorkIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {isRu ? 'Опыт работы' : 'Experiență profesională'}
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRu ? '10+ лет практики' : '10+ ani de practică'}
                    secondary={
                      isRu
                        ? 'Работа с клиентами различных категорий'
                        : 'Lucru cu clienți din diverse categorii'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRu ? 'Преподавательская деятельность' : 'Activitate didactică'}
                    secondary={
                      isRu
                        ? 'Обучение начинающих массажистов'
                        : 'Pregătirea maserilor începători'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      isRu
                        ? 'Разработка учебных программ'
                        : 'Dezvoltare de programe educaționale'
                    }
                    secondary={
                      isRu
                        ? 'Авторские методики обучения массажу'
                        : 'Metodologii autoriale de predare a masajului'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      isRu
                        ? 'Сотни довольных студентов'
                        : 'Sute de studenți mulțumiți'
                    }
                    secondary={
                      isRu
                        ? 'Многие из них успешно практикуют'
                        : 'Mulți dintre ei practică cu succes'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Philosophy Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4, bgcolor: 'primary.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AwardIcon color="primary" />
              <Typography variant="h5" fontWeight={600}>
                {isRu ? 'Моя философия преподавания' : 'Filosofia mea de predare'}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {isRu
                ? 'Я верю, что качественное образование должно быть практичным и доступным. Массажная терапия — это искусство, которое требует не только знания анатомии, но и понимания того, как правильно применять эти знания на практике.'
                : 'Cred că educația de calitate trebuie să fie practică și accesibilă. Terapia prin masaj este o artă care necesită nu doar cunoștințe de anatomie, ci și înțelegerea modului corect de aplicare a acestor cunoștințe în practică.'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    500+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isRu ? 'Студентов обучено' : 'Studenți instruiți'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    10+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isRu ? 'Лет опыта' : 'Ani de experiență'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    15+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isRu ? 'Протоколов массажа' : 'Protocoale de masaj'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Why this platform */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {isRu
                ? 'Почему я создал эту платформу?'
                : 'De ce am creat această platformă?'}
            </Typography>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {isRu
                ? 'На протяжении многих лет обучения студентов я заметил, что многим не хватает структурированного подхода к изучению массажа. Теория часто оторвана от практики, а анатомия кажется скучной и непонятной. Я хотел изменить это.'
                : 'Pe parcursul multor ani de predare, am observat că multor studenți le lipsește o abordare structurată în învățarea masajului. Teoria este adesea despărțită de practică, iar anatomia pare plictisitoare și de neînțeles. Am vrut să schimb asta.'}
            </Typography>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {isRu
                ? 'MateevMassage — это результат многолетнего опыта преподавания. Здесь каждый протокол массажа связан с анатомическими знаниями, каждая тема подкреплена 3D моделями и практическими заданиями. Моя цель — чтобы вы не просто запоминали информацию, а понимали ее и могли применять в работе с реальными клиентами.'
                : 'MateevMassage este rezultatul multor ani de experiență didactică. Aici fiecare protocol de masaj este legat de cunoștințele anatomice, fiecare temă este susținută de modele 3D și sarcini practice. Scopul meu este ca dvs. să nu memorați doar informația, ci să o înțelegeți și să o puteți aplica în lucrul cu clienți reali.'}
            </Typography>
            <Box
              sx={{
                mt: 3,
                p: 3,
                bgcolor: 'success.50',
                borderRadius: 2,
                borderLeft: '4px solid',
                borderColor: 'success.main',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {isRu ? 'Моё обещание вам:' : 'Promisiunea mea pentru dvs:'}
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                {isRu
                  ? '"Я буду постоянно обновлять и улучшать эту платформу, добавлять новые протоколы, отвечать на ваши вопросы и помогать вам становиться профессионалами в массажной терапии."'
                  : '"Voi actualiza și îmbunătăți constant această platformă, voi adăuga noi protocoale, voi răspunde la întrebările dvs. și vă voi ajuta să deveniți profesioniști în terapia prin masaj."'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AboutInstructorPage
