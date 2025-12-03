import { Response } from 'express'
import PDFDocument from 'pdfkit'
import Certificate from '../models/Certificate'
import Progress from '../models/Progress'
import User from '../models/User'
import { CustomRequest } from '../middleware/auth'

// Certificate type definitions
const CERTIFICATE_TYPES = {
  course_completion: {
    title: {
      ru: 'Сертификат о прохождении курса',
      ro: 'Certificat de absolvire a cursului',
    },
    description: {
      ru: 'Успешно завершил базовый курс анатомии и массажа',
      ro: 'A finalizat cu succes cursul de bază de anatomie și masaj',
    },
    requirements: {
      minTopicsCompleted: 10,
      minQuizzesPassed: 5,
      minAverageScore: 70,
    },
  },
  topic_mastery: {
    title: {
      ru: 'Сертификат мастера темы',
      ro: 'Certificat de maestru al subiectului',
    },
    description: {
      ru: 'Продемонстрировал отличное владение выбранными темами',
      ro: 'A demonstrat o cunoaștere excelentă a subiectelor selectate',
    },
    requirements: {
      minTopicsCompleted: 25,
      minQuizzesPassed: 10,
      minAverageScore: 80,
    },
  },
  exam_excellence: {
    title: {
      ru: 'Сертификат отличника',
      ro: 'Certificat de excelență',
    },
    description: {
      ru: 'Показал выдающиеся результаты в тестировании',
      ro: 'A obținut rezultate remarcabile la teste',
    },
    requirements: {
      minTopicsCompleted: 5,
      minQuizzesPassed: 10,
      minAverageScore: 90,
    },
  },
  full_course: {
    title: {
      ru: 'Сертификат полного курса анатомии и массажа',
      ro: 'Certificat complet de anatomie și masaj',
    },
    description: {
      ru: 'Успешно завершил полный курс анатомии, физиологии и массажа',
      ro: 'A finalizat cu succes cursul complet de anatomie, fiziologie și masaj',
    },
    requirements: {
      minTopicsCompleted: 50,
      minQuizzesPassed: 25,
      minAverageScore: 85,
    },
  },
}

// Check if user is eligible for certificate
export const checkEligibility = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { certificateType } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    if (!CERTIFICATE_TYPES[certificateType as keyof typeof CERTIFICATE_TYPES]) {
      return res.status(400).json({ message: 'Invalid certificate type' })
    }

    const progress = await Progress.findOne({ userId })
    if (!progress) {
      return res.status(404).json({
        message: 'Progress not found',
        eligible: false,
      })
    }

    const certType = CERTIFICATE_TYPES[certificateType as keyof typeof CERTIFICATE_TYPES]
    const requirements = certType.requirements

    const eligible =
      progress.stats.totalTopicsCompleted >= requirements.minTopicsCompleted &&
      progress.stats.totalQuizzesPassed >= requirements.minQuizzesPassed &&
      progress.stats.averageQuizScore >= requirements.minAverageScore

    return res.json({
      eligible,
      requirements: {
        minTopicsCompleted: requirements.minTopicsCompleted,
        minQuizzesPassed: requirements.minQuizzesPassed,
        minAverageScore: requirements.minAverageScore,
      },
      currentProgress: {
        topicsCompleted: progress.stats.totalTopicsCompleted,
        quizzesPassed: progress.stats.totalQuizzesPassed,
        averageScore: progress.stats.averageQuizScore,
      },
      certificateType: certType.title,
    })
  } catch (error: any) {
    console.error('Error checking certificate eligibility:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Generate and issue certificate
export const generateCertificate = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { certificateType } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    if (!CERTIFICATE_TYPES[certificateType as keyof typeof CERTIFICATE_TYPES]) {
      return res.status(400).json({ message: 'Invalid certificate type' })
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      userId,
      certificateType,
    })

    if (existingCertificate) {
      return res.status(400).json({
        message: 'Certificate already issued',
        certificate: existingCertificate,
      })
    }

    // Get user progress
    const progress = await Progress.findOne({ userId })
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' })
    }

    const certType = CERTIFICATE_TYPES[certificateType as keyof typeof CERTIFICATE_TYPES]
    const requirements = certType.requirements

    // Verify eligibility
    const eligible =
      progress.stats.totalTopicsCompleted >= requirements.minTopicsCompleted &&
      progress.stats.totalQuizzesPassed >= requirements.minQuizzesPassed &&
      progress.stats.averageQuizScore >= requirements.minAverageScore

    if (!eligible) {
      return res.status(400).json({
        message: 'User does not meet certificate requirements',
        requirements,
        currentProgress: {
          topicsCompleted: progress.stats.totalTopicsCompleted,
          quizzesPassed: progress.stats.totalQuizzesPassed,
          averageScore: progress.stats.averageQuizScore,
        },
      })
    }

    // Get user details
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Create certificate
    const certificate = new Certificate({
      userId,
      certificateType,
      title: certType.title,
      description: certType.description,
      requirements,
      requirementsMet: {
        topicsCompleted: progress.stats.totalTopicsCompleted,
        quizzesPassed: progress.stats.totalQuizzesPassed,
        averageScore: progress.stats.averageQuizScore,
        completedAt: new Date(),
      },
      metadata: {
        courseName: 'Anatomia Interactive - Full Course',
        instructorName: 'Anatomia Study Platform',
        institution: 'Anatomia Study Platform',
        credentialId: '', // Will be generated by pre-save hook
      },
    })

    await certificate.save()

    return res.status(201).json({
      message: 'Certificate generated successfully',
      certificate,
    })
  } catch (error: any) {
    console.error('Error generating certificate:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Download certificate as PDF
export const downloadCertificate = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { certificateId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const certificate = await Certificate.findOne({
      _id: certificateId,
      userId,
    })

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    })

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=certificate-${certificate.certificateNumber}.pdf`
    )

    // Pipe PDF to response
    doc.pipe(res)

    // Design certificate
    const pageWidth = doc.page.width
    const pageHeight = doc.page.height

    // Border
    doc
      .lineWidth(3)
      .strokeColor('#2196f3')
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .stroke()

    doc
      .lineWidth(1)
      .strokeColor('#2196f3')
      .rect(40, 40, pageWidth - 80, pageHeight - 80)
      .stroke()

    // Title
    doc
      .fontSize(36)
      .fillColor('#1976d2')
      .font('Helvetica-Bold')
      .text('СЕРТИФИКАТ / CERTIFICAT', 0, 100, {
        align: 'center',
        width: pageWidth,
      })

    // Certificate type
    doc
      .fontSize(24)
      .fillColor('#333333')
      .font('Helvetica')
      .text(certificate.title.ru, 0, 160, {
        align: 'center',
        width: pageWidth,
      })

    doc
      .fontSize(18)
      .fillColor('#666666')
      .text(certificate.title.ro, 0, 195, {
        align: 'center',
        width: pageWidth,
      })

    // Awarded to
    doc
      .fontSize(16)
      .fillColor('#333333')
      .text('Настоящим сертифицируется, что / Se certifică că', 0, 250, {
        align: 'center',
        width: pageWidth,
      })

    // User name
    doc
      .fontSize(32)
      .fillColor('#1976d2')
      .font('Helvetica-Bold')
      .text(`${user.firstName} ${user.lastName}`, 0, 290, {
        align: 'center',
        width: pageWidth,
      })

    // Description
    doc
      .fontSize(14)
      .fillColor('#333333')
      .font('Helvetica')
      .text(certificate.description.ru, 0, 340, {
        align: 'center',
        width: pageWidth,
      })

    doc
      .fontSize(12)
      .fillColor('#666666')
      .text(certificate.description.ro, 0, 365, {
        align: 'center',
        width: pageWidth,
      })

    // Achievement details
    const achievementY = 410
    doc
      .fontSize(11)
      .fillColor('#333333')
      .text(
        `Изучено тем: ${certificate.requirementsMet.topicsCompleted} | Тестов пройдено: ${certificate.requirementsMet.quizzesPassed} | Средний балл: ${certificate.requirementsMet.averageScore}%`,
        0,
        achievementY,
        {
          align: 'center',
          width: pageWidth,
        }
      )

    // Issue date
    const issueDate = new Date(certificate.issuedAt).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    doc
      .fontSize(12)
      .fillColor('#666666')
      .text(`Дата выдачи / Data emiterii: ${issueDate}`, 0, 460, {
        align: 'center',
        width: pageWidth,
      })

    // Certificate number and credential ID
    doc
      .fontSize(10)
      .fillColor('#999999')
      .text(
        `Номер сертификата / Număr certificat: ${certificate.certificateNumber}`,
        0,
        pageHeight - 100,
        {
          align: 'center',
          width: pageWidth,
        }
      )

    doc
      .fontSize(9)
      .text(
        `Credential ID: ${certificate.metadata.credentialId}`,
        0,
        pageHeight - 80,
        {
          align: 'center',
          width: pageWidth,
        }
      )

    // Institution
    doc
      .fontSize(11)
      .fillColor('#333333')
      .font('Helvetica-Bold')
      .text(certificate.metadata.institution, 0, pageHeight - 55, {
        align: 'center',
        width: pageWidth,
      })

    // Finalize PDF
    doc.end()
  } catch (error: any) {
    console.error('Error downloading certificate:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get user certificates
export const getUserCertificates = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const certificates = await Certificate.find({ userId }).sort({ issuedAt: -1 })

    return res.json({ certificates })
  } catch (error: any) {
    console.error('Error fetching user certificates:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Verify certificate (public endpoint)
export const verifyCertificate = async (req: CustomRequest, res: Response) => {
  try {
    const { certificateNumber } = req.params

    const certificate = await Certificate.findOne({ certificateNumber }).populate(
      'userId',
      'firstName lastName email'
    )

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found'
      })
    }

    return res.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        certificateType: certificate.certificateType,
        title: certificate.title,
        issuedAt: certificate.issuedAt,
        recipientName: `${(certificate.userId as any).firstName} ${(certificate.userId as any).lastName}`,
        credentialId: certificate.metadata.credentialId,
        institution: certificate.metadata.institution,
      },
    })
  } catch (error: any) {
    console.error('Error verifying certificate:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get available certificate types
export const getAvailableCertificates = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const progress = await Progress.findOne({ userId })
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' })
    }

    const availableCerts = Object.entries(CERTIFICATE_TYPES).map(([type, data]) => {
      const eligible =
        progress.stats.totalTopicsCompleted >= data.requirements.minTopicsCompleted &&
        progress.stats.totalQuizzesPassed >= data.requirements.minQuizzesPassed &&
        progress.stats.averageQuizScore >= data.requirements.minAverageScore

      return {
        type,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        eligible,
        progress: {
          topicsCompleted: progress.stats.totalTopicsCompleted,
          quizzesPassed: progress.stats.totalQuizzesPassed,
          averageScore: progress.stats.averageQuizScore,
        },
      }
    })

    return res.json({ certificates: availableCerts })
  } catch (error: any) {
    console.error('Error fetching available certificates:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}
