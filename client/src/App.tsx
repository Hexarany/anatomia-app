import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import TopicPage from './pages/TopicPage'
import QuizPage from './pages/QuizPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ProfilePage from './pages/ProfilePage'
import MassageProtocolsPage from './pages/MassageProtocolsPage'
import MassageProtocolPage from './pages/MassageProtocolPage'
import HygieneGuidelinesPage from './pages/HygieneGuidelinesPage'
import AnatomyModels3DPage from './pages/AnatomyModels3DPage'
import AnatomyModel3DViewerPage from './pages/AnatomyModel3DViewerPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/massage-protocols" element={<MassageProtocolsPage />} />
          <Route path="/massage-protocols/:protocolId" element={<MassageProtocolPage />} />
          <Route path="/hygiene-guidelines" element={<HygieneGuidelinesPage />} />
          <Route path="/anatomy-models-3d" element={<AnatomyModels3DPage />} />
          <Route path="/anatomy-models-3d/:id" element={<AnatomyModel3DViewerPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  )
}

export default App
