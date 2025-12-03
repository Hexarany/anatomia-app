import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
} from '@mui/material'
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          У вас нет прав для доступа к админ-панели / Nu aveți drepturi de acces la panoul de administrare
        </Alert>
      </Container>
    )
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Админ-панель / Panou de administrare
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Управление контентом платформы / Gestionarea conținutului platformei
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Категории / Categorii" />
            <Tab label="Темы / Teme" />
            <Tab label="Тесты / Teste" />
            <Tab label="Протоколы массажа / Protocoale masaj" />
            <Tab label="Гигиена и стандарты / Igienă și standarde" />
            <Tab label="3D Модели / Modele 3D" />
            <Tab label="Триггерные точки / Puncte trigger" />
            <Tab label="Библиотека / Bibliotecă" />
            <Tab label="Импорт данных / Import date" />
            <Tab label="Медиа / Media" />
            {user?.role === 'admin' && <Tab label="Пользователи / Utilizatori" />}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <CategoriesManager />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <TopicsManager />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <QuizzesManager />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <MassageProtocolsManager />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <HygieneGuidelinesManager />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <AnatomyModels3DManager />
        </TabPanel>
        <TabPanel value={activeTab} index={6}>
          <TriggerPointsManager />
        </TabPanel>
        <TabPanel value={activeTab} index={7}>
          <ResourcesManager />
        </TabPanel>
        <TabPanel value={activeTab} index={8}>
          <DataImportPage />
        </TabPanel>
        <TabPanel value={activeTab} index={9}>
          <MediaManager />
        </TabPanel>
        {user?.role === 'admin' && (
          <TabPanel value={activeTab} index={10}>
            <UsersManager />
          </TabPanel>
        )}
      </Paper>
    </Container>
  )
}

export default AdminDashboard
