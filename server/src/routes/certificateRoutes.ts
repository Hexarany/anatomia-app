import express from 'express'
import {
  checkEligibility,
  generateCertificate,
  downloadCertificate,
  getUserCertificates,
  verifyCertificate,
  getAvailableCertificates,
} from '../controllers/certificateController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Protected routes (require authentication)
router.get('/available', authenticateToken, getAvailableCertificates)
router.get('/my-certificates', authenticateToken, getUserCertificates)
router.get('/eligibility/:certificateType', authenticateToken, checkEligibility)
router.post('/generate/:certificateType', authenticateToken, generateCertificate)
router.get('/download/:certificateId', authenticateToken, downloadCertificate)

// Public route (for verification)
router.get('/verify/:certificateNumber', verifyCertificate)

export default router
