import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import { useTelegram } from './contexts/TelegramContext'
import { useTelegramBackButton } from './hooks/useTelegramBackButton'
import { MainButtonProvider } from './contexts/MainButtonContext'
// Temporarily disabled PWA components
// import PWAUpdatePrompt from './components/PWAUpdatePrompt'
// import InstallPWA from './components/InstallPWA'

// Critical pages - loaded immediately
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'

// Lazy-loaded pages - loaded on demand
// Priority 1: Heavy/admin pages
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AnatomyModels3DPage = lazy(() => import('./pages/AnatomyModels3DPage'))
const AnatomyModel3DViewerPage = lazy(() => import('./pages/AnatomyModel3DViewerPage'))

// Priority 2: Quiz and search pages
const QuizPage = lazy(() => import('./pages/QuizPage'))
const QuizzesPage = lazy(() => import('./pages/QuizzesPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ResourcesLibraryPage = lazy(() => import('./pages/ResourcesLibraryPage'))

// Priority 3: User pages
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage'))
const MyGroupsPage = lazy(() => import('./pages/MyGroupsPage'))
const GradesPage = lazy(() => import('./pages/GradesPage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))

// Priority 4: Content pages
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const TopicPage = lazy(() => import('./pages/TopicPage'))
const MassageProtocolsPage = lazy(() => import('./pages/MassageProtocolsPage'))
const MassageProtocolPage = lazy(() => import('./pages/MassageProtocolPage'))
const HygieneGuidelinesPage = lazy(() => import('./pages/HygieneGuidelinesPage'))
const TriggerPointsPage = lazy(() => import('./pages/TriggerPointsPage'))
const TriggerPointDetailPage = lazy(() => import('./pages/TriggerPointDetailPage'))

// Priority 5: Subscription and payment pages
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))

function App() {
  const { isInTelegram } = useTelegram()
  useTelegramBackButton()

  return (
    <MainButtonProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* <PWAUpdatePrompt /> */}
        {/* <InstallPWA /> */}
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/my-groups" element={<MyGroupsPage />} />
              <Route path="/grades" element={<GradesPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/payment-callback" element={<PaymentCallbackPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/topic/:topicId" element={<TopicPage />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
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
          </Suspense>
        </Box>
        {!isInTelegram && <Footer />}
      </Box>
    </MainButtonProvider>
  )
}

export default App
