import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Stack,
  Chip,
  Grid,
  Button,
  Autocomplete,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic'
import TimelineIcon from '@mui/icons-material/Timeline'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import QuizIcon from '@mui/icons-material/Quiz'
import SpaIcon from '@mui/icons-material/Spa'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PermMediaIcon from '@mui/icons-material/PermMedia'
import GroupsIcon from '@mui/icons-material/Groups'
import FolderIcon from '@mui/icons-material/Folder'
import EventNoteIcon from '@mui/icons-material/EventNote'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CategoriesManager from './CategoriesManager'
import TopicsManager from './TopicsManager'
import QuizzesManager from './QuizzesManager'
import MediaManager from './MediaManager'
import MassageProtocolsManager from './MassageProtocolsManager'
import HygieneGuidelinesManager from './HygieneGuidelinesManager'
import AnatomyModels3DManager from './AnatomyModels3DManager'
import TriggerPointsManager from './TriggerPointsManager'
import ResourcesManager from './ResourcesManager'
import DataImportPage from './DataImportPage'
import UsersManager from './UsersManager'
import PromoCodesManager from './PromoCodesManager'
import GroupsManager from './GroupsManager'
import GroupFilesManager from './GroupFilesManager'
import ScheduleManager from './ScheduleManager'
import AssignmentsManager from './AssignmentsManager'
import InstructorProfileManager from './InstructorProfileManager'

type AdminGroupKey = 'content' | 'workflow' | 'operations' | 'access'

type AdminSection = {
  key: string
  label: string
  shortLabel: string
  description: string
  icon: React.ElementType
  component: React.ElementType
  group: AdminGroupKey
  adminOnly?: boolean
  quickAccess?: boolean
}

type AdminGroup = {
  key: AdminGroupKey
  title: string
  description: string
  icon: React.ElementType
  accent: string
}

const ADMIN_GROUPS: AdminGroup[] = [
  {
    key: 'content',
    title: 'Контент и модули / Continut si module',
    description: 'Уроки, тесты, протоколы и библиотека.',
    icon: AutoAwesomeMosaicIcon,
    accent: '#1E88E5',
  },
  {
    key: 'workflow',
    title: 'Учебный процесс / Flux de studiu',
    description: 'Группы, задания, расписание и файлы.',
    icon: TimelineIcon,
    accent: '#00A087',
  },
  {
    key: 'operations',
    title: 'Инструменты / Instrumente',
    description: 'Импорт, медиа и служебные операции.',
    icon: BuildCircleIcon,
    accent: '#F59E0B',
  },
  {
    key: 'access',
    title: 'Доступ и продажи / Acces si vanzari',
    description: 'Пользователи, роли и промокоды.',
    icon: VerifiedUserIcon,
    accent: '#7C3AED',
  },
]

const GROUP_LABELS: Record<AdminGroupKey, string> = {
  content: 'Контент / Continut',
  workflow: 'Процесс / Flux',
  operations: 'Инструменты / Instrumente',
  access: 'Доступ / Acces',
}

const ADMIN_SECTIONS: AdminSection[] = [
  {
    key: 'categories',
    label: 'Категории / Categorii',
    shortLabel: 'Категории',
    description: 'Структура модулей, иконки и порядок.',
    icon: CategoryOutlinedIcon,
    component: CategoriesManager,
    group: 'content',
    quickAccess: true,
  },
  {
    key: 'topics',
    label: 'Темы / Teme',
    shortLabel: 'Темы',
    description: 'Темы и уроки внутри модулей.',
    icon: LocalLibraryIcon,
    component: TopicsManager,
    group: 'content',
    quickAccess: true,
  },
  {
    key: 'quizzes',
    label: 'Тесты / Teste',
    shortLabel: 'Тесты',
    description: 'Вопросы, варианты и логика тестов.',
    icon: QuizIcon,
    component: QuizzesManager,
    group: 'content',
    quickAccess: true,
  },
  {
    key: 'protocols',
    label: 'Протоколы массажа / Protocoale masaj',
    shortLabel: 'Протоколы',
    description: 'Пошаговые протоколы массажа.',
    icon: SpaIcon,
    component: MassageProtocolsManager,
    group: 'content',
  },
  {
    key: 'hygiene',
    label: 'Гигиена и стандарты / Igiena si standarde',
    shortLabel: 'Гигиена',
    description: 'Стандарты, безопасность, гигиена.',
    icon: HealthAndSafetyIcon,
    component: HygieneGuidelinesManager,
    group: 'content',
  },
  {
    key: 'models-3d',
    label: '3D модели / Modele 3D',
    shortLabel: '3D модели',
    description: 'Интерактивные модели и сцены.',
    icon: ViewInArIcon,
    component: AnatomyModels3DManager,
    group: 'content',
  },
  {
    key: 'trigger-points',
    label: 'Триггерные точки / Puncte trigger',
    shortLabel: 'Триггеры',
    description: 'Триггерные точки и методики.',
    icon: MyLocationIcon,
    component: TriggerPointsManager,
    group: 'content',
  },
  {
    key: 'resources',
    label: 'Библиотека / Biblioteca',
    shortLabel: 'Библиотека',
    description: 'Материалы, ссылки и файлы.',
    icon: MenuBookIcon,
    component: ResourcesManager,
    group: 'content',
  },
  {
    key: 'data-import',
    label: 'Импорт данных / Import date',
    shortLabel: 'Импорт',
    description: 'Загрузка данных и шаблоны.',
    icon: CloudUploadIcon,
    component: DataImportPage,
    group: 'operations',
    quickAccess: true,
  },
  {
    key: 'media',
    label: 'Медиа / Media',
    shortLabel: 'Медиа',
    description: 'Фото, видео и файлы.',
    icon: PermMediaIcon,
    component: MediaManager,
    group: 'operations',
    quickAccess: true,
  },
  {
    key: 'groups',
    label: 'Группы / Grupuri',
    shortLabel: 'Группы',
    description: 'Управление группами и доступами.',
    icon: GroupsIcon,
    component: GroupsManager,
    group: 'workflow',
  },
  {
    key: 'group-files',
    label: 'Файлы групп / Fisiere grup',
    shortLabel: 'Файлы групп',
    description: 'Материалы и загрузки по группам.',
    icon: FolderIcon,
    component: GroupFilesManager,
    group: 'workflow',
  },
  {
    key: 'schedule',
    label: 'Расписание / Orar',
    shortLabel: 'Расписание',
    description: 'График занятий и событий.',
    icon: EventNoteIcon,
    component: ScheduleManager,
    group: 'workflow',
  },
  {
    key: 'assignments',
    label: 'Домашние задания / Teme de casa',
    shortLabel: 'Домашние',
    description: 'Домашние, проверки, оценки.',
    icon: AssignmentTurnedInIcon,
    component: AssignmentsManager,
    group: 'workflow',
    quickAccess: true,
  },
  {
    key: 'promo-codes',
    label: 'Промокоды / Coduri promotionale',
    shortLabel: 'Промокоды',
    description: 'Скидки и промо-кампании.',
    icon: LocalOfferIcon,
    component: PromoCodesManager,
    group: 'access',
    adminOnly: true,
    quickAccess: true,
  },
  {
    key: 'users',
    label: 'Пользователи / Utilizatori',
    shortLabel: 'Пользователи',
    description: 'Аккаунты, подписки, доступ.',
    icon: PeopleIcon,
    component: UsersManager,
    group: 'access',
    adminOnly: true,
    quickAccess: true,
  },
  {
    key: 'instructor-profile',
    label: 'Профиль преподавателя / Profilul profesorului',
    shortLabel: 'Профиль',
    description: 'Информация о преподавателе на странице "О нас".',
    icon: PersonIcon,
    component: InstructorProfileManager,
    group: 'operations',
    adminOnly: false,
  },
]

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  )
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const visibleSections = useMemo(
    () => ADMIN_SECTIONS.filter((section) => !section.adminOnly || user?.role === 'admin'),
    [user?.role]
  )
  const groupedSections = useMemo(() => {
    return ADMIN_GROUPS.map((group) => ({
      ...group,
      items: visibleSections.filter((section) => section.group === group.key),
    })).filter((group) => group.items.length > 0)
  }, [visibleSections])
  const sectionIndexByKey = useMemo(() => {
    const indexMap = new Map<string, number>()
    visibleSections.forEach((section, index) => {
      indexMap.set(section.key, index)
    })
    return indexMap
  }, [visibleSections])
  const maxTabIndex = Math.max(visibleSections.length - 1, 0)
  const activeSection = visibleSections[activeTab]
  const quickSections = visibleSections.filter((section) => section.quickAccess)
  const roleLabel =
    user?.role === 'admin' ? 'Администратор / Administrator' : 'Преподаватель / Profesor'
  const activeGroup = activeSection
    ? ADMIN_GROUPS.find((group) => group.key === activeSection.group)
    : null
  const ActiveIcon = activeSection?.icon

  // Check URL for tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10)
      if (!isNaN(tabIndex) && tabIndex >= 0) {
        setActiveTab(Math.min(Math.max(tabIndex, 0), maxTabIndex))
      }
    }
  }, [searchParams, maxTabIndex])

  useEffect(() => {
    if (activeTab > maxTabIndex) {
      setActiveTab(0)
    }
  }, [activeTab, maxTabIndex])

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          У вас нет прав для доступа к админ-панели / Nu aveti drepturi de acces la panoul de
          administrare
        </Alert>
      </Container>
    )
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSectionSelect = (key: string) => {
    const index = sectionIndexByKey.get(key)
    if (index !== undefined) {
      setActiveTab(index)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          color: 'common.white',
          background: 'linear-gradient(135deg, #1E88E5 0%, #22C1C3 55%, #6DD5FA 100%)',
          boxShadow: '0 18px 40px rgba(30, 136, 229, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 220,
            height: 220,
            right: -60,
            top: -80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 260,
            height: 260,
            left: -120,
            bottom: -140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
          },
        }}
      >
        <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
              Админ-панель / Panou de administrare
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Управление контентом платформы и учебным процессом / Gestionarea continutului si a
              fluxului de studiu
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={roleLabel}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'common.white' }}
            />
            <Chip
              label={`Разделов: ${visibleSections.length} / Sectiuni: ${visibleSections.length}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'common.white' }}
            />
            {activeSection && (
              <Chip
                label={`Фокус: ${activeSection.shortLabel}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'common.white' }}
              />
            )}
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mt: 3, mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Быстрый доступ / Acces rapid
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Перейдите к нужному разделу или откройте частые инструменты.
                </Typography>
              </Box>
              <Autocomplete
                options={visibleSections}
                value={activeSection || null}
                groupBy={(option) => GROUP_LABELS[option.group]}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.key === value.key}
                onChange={(_, value) => {
                  if (value) {
                    handleSectionSelect(value.key)
                  }
                }}
                renderOption={(props, option) => {
                  const OptionIcon = option.icon
                  const optionGroup = ADMIN_GROUPS.find((group) => group.key === option.group)
                  const accent = optionGroup?.accent ?? '#1E88E5'
                  return (
                    <Box component="li" {...props}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: alpha(accent, 0.15),
                            color: accent,
                          }}
                        >
                          <OptionIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{option.shortLabel}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Быстрый переход / Salt rapid"
                    placeholder="Начните вводить название"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Divider />
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {quickSections.map((section) => {
                  const QuickIcon = section.icon
                  const group = ADMIN_GROUPS.find((item) => item.key === section.group)
                  const accent = group?.accent ?? '#1E88E5'
                  const isActive = activeSection?.key === section.key
                  return (
                    <Button
                      key={section.key}
                      size="small"
                      variant={isActive ? 'contained' : 'outlined'}
                      startIcon={<QuickIcon fontSize="small" />}
                      onClick={() => handleSectionSelect(section.key)}
                      sx={{
                        borderColor: alpha(accent, 0.35),
                        color: isActive ? 'common.white' : accent,
                        bgcolor: isActive ? accent : 'transparent',
                        '&:hover': {
                          borderColor: accent,
                          bgcolor: isActive ? accent : alpha(accent, 0.12),
                        },
                      }}
                    >
                      {section.shortLabel}
                    </Button>
                  )
                })}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
              background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: alpha(activeGroup?.accent ?? '#1E88E5', 0.15),
                    color: activeGroup?.accent ?? '#1E88E5',
                  }}
                >
                  {ActiveIcon ? <ActiveIcon fontSize="small" /> : null}
                </Avatar>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Активный раздел / Sectiune activa
                  </Typography>
                  <Typography variant="h6">{activeSection?.label ?? '—'}</Typography>
                </Box>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {activeSection?.description ?? 'Выберите раздел для работы.'}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ChevronLeftIcon />}
                  disabled={activeTab <= 0}
                  onClick={() => setActiveTab((prev) => Math.max(prev - 1, 0))}
                >
                  Назад
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<ChevronRightIcon />}
                  disabled={activeTab >= maxTabIndex}
                  onClick={() => setActiveTab((prev) => Math.min(prev + 1, maxTabIndex))}
                >
                  Дальше
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {groupedSections.map((group) => {
          const GroupIcon = group.icon
          return (
            <Grid item xs={12} md={6} xl={3} key={group.key}>
              <Paper
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  p: 2.5,
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${alpha(group.accent, 0.18)}`,
                  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(140deg, ${alpha(group.accent, 0.15)} 0%, transparent 55%)`,
                    opacity: 0.7,
                  },
                }}
              >
                <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha(group.accent, 0.18),
                        color: group.accent,
                        width: 42,
                        height: 42,
                      }}
                    >
                      <GroupIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {group.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {group.items.map((section) => {
                      const SectionIcon = section.icon
                      const isActive = activeSection?.key === section.key
                      return (
                        <Button
                          key={section.key}
                          size="small"
                          variant={isActive ? 'contained' : 'outlined'}
                          startIcon={<SectionIcon fontSize="small" />}
                          onClick={() => handleSectionSelect(section.key)}
                          sx={{
                            borderColor: alpha(group.accent, 0.35),
                            color: isActive ? 'common.white' : group.accent,
                            bgcolor: isActive ? group.accent : 'transparent',
                            '&:hover': {
                              borderColor: group.accent,
                              bgcolor: isActive ? group.accent : alpha(group.accent, 0.12),
                            },
                          }}
                        >
                          {section.shortLabel}
                        </Button>
                      )
                    })}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <Paper
        sx={{
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={(theme) => ({
              px: 2,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 56,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                mr: 1,
                fontWeight: 600,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              },
              '& .MuiTabs-scrollButtons.Mui-disabled': {
                opacity: 0.3,
              },
            })}
          >
            {visibleSections.map((section) => {
              const SectionIcon = section.icon
              return (
                <Tab
                  key={section.key}
                  label={section.label}
                  icon={<SectionIcon fontSize="small" />}
                  iconPosition="start"
                />
              )
            })}
          </Tabs>
        </Box>

        {visibleSections.map((section, index) => {
          const SectionComponent = section.component
          return (
            <TabPanel key={section.key} value={activeTab} index={index}>
              <SectionComponent />
            </TabPanel>
          )
        })}
      </Paper>
    </Container>
  )
}

export default AdminDashboard
