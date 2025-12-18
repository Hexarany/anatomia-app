import express from 'express'
import {
  generateLinkCode,
  unlinkTelegram,
  getLinkStatus,
  updateNotificationSettings,
  createGroupChat
} from '../controllers/telegramController'
import { authenticateToken, authorizeRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Linking/unlinking
router.post('/generate-link-code', generateLinkCode)
router.post('/unlink', unlinkTelegram)
router.get('/link-status', getLinkStatus)

// Notification settings
router.put('/notification-settings', updateNotificationSettings)

// Group chats (admin and teacher only)
router.post('/group-chat', authorizeRole('admin', 'teacher'), createGroupChat)

export default router
