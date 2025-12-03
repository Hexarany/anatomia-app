import express from 'express'
import multer from 'multer'
import {
  importTopics,
  importQuizzes,
  importMassageProtocols,
  importTriggerPoints,
  importJSON,
  previewCSV,
} from '../controllers/importController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'text/plain']
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'))
    }
  },
})

// All routes require authentication and admin/teacher role
router.use(authenticateToken)

// CSV Import endpoints
router.post('/topics/csv', upload.single('file'), importTopics)
router.post('/quizzes/csv', upload.single('file'), importQuizzes)
router.post('/protocols/csv', upload.single('file'), importMassageProtocols)
router.post('/trigger-points/csv', upload.single('file'), importTriggerPoints)

// JSON Import endpoint (universal)
router.post('/json', importJSON)

// Preview CSV before import
router.post('/preview', upload.single('file'), previewCSV)

export default router
