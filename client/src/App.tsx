import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import InstallPWA from './components/InstallPWA'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import TopicPage from './pages/TopicPage'
import EnhancedQuizPage from './pages/EnhancedQuizPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ProfilePage from './pages/ProfilePage'
import MassageProtocolsPage from './pages/MassageProtocolsPage'
import MassageProtocolPage from './pages/MassageProtocolPage'
import HygieneGuidelinesPage from './pages/HygieneGuidelinesPage'
import QuizzesPage from './pages/QuizzesPage'
import AnatomyModels3DPage from './pages/AnatomyModels3DPage'
import AnatomyModel3DViewerPage from './pages/AnatomyModel3DViewerPage'
import TriggerPointsPage from './pages/TriggerPointsPage'
import TriggerPointDetailPage from './pages/TriggerPointDetailPage'
import PricingPage from './pages/PricingPage'
import PaymentCallbackPage from './pages/PaymentCallbackPage'
import ChatPage from './pages/ChatPage'
import SearchPage from './pages/SearchPage'
import ResourcesLibraryPage from './pages/ResourcesLibraryPage'
import DashboardPage from './pages/DashboardPage'
import CertificatesPage from './pages/CertificatesPage'
import NotificationsPage from './pages/NotificationsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PWAUpdatePrompt />
      <InstallPWA />
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment-callback" element={<PaymentCallbackPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/quiz/:quizId" element={<EnhancedQuizPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/massage-protocols" element={<MassageProtocolsPage />} />
          <Route path="/massage-protocols/:protocolId" element={<MassageProtocolPage />} />
          <Route path="/hygiene-guidelines" element={<HygieneGuidelinesPage />} />
          <Route path="/anatomy-models-3d" element={<AnatomyModels3DPage />} />
          <Route path="/anatomy-models-3d/:id" element={<AnatomyModel3DViewerPage />} />
          <Route path="/trigger-points" element={<TriggerPointsPage />} />
          <Route path="/trigger-points/:id" element={<TriggerPointDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/resources" element={<ResourcesLibraryPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  )
}

export default App
