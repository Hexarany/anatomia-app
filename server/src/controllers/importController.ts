import { Response } from 'express'
import { CustomRequest } from '../middleware/auth'
import Category from '../models/Category'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'
import MassageProtocol from '../models/MassageProtocol'
import TriggerPoint from '../models/TriggerPoint'
import HygieneGuideline from '../models/HygieneGuideline'
import csvParser from 'csv-parser'
import { Readable } from 'stream'
import { TelegramNotificationService } from '../services/telegram/notificationService'

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

// Parse CSV from buffer
const parseCSV = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    const stream = Readable.from(buffer.toString())

    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

// Import Topics
export const importTopics = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const data = await parseCSV(req.file.buffer)
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        // Expected CSV columns:
        // categoryId,slug,title_ru,title_ro,description_ru,description_ro,content_ru,content_ro

        const topic = new Topic({
          categoryId: row.categoryId,
          slug: row.slug,
          title: {
            ru: row.title_ru,
            ro: row.title_ro,
          },
          description: {
            ru: row.description_ru || '',
            ro: row.description_ro || '',
          },
          content: {
            ru: row.content_ru || '',
            ro: row.content_ro || '',
          },
          images: [],
          videos: [],
        })

        await topic.save()
        result.imported++
      } catch (error: any) {
        result.failed++
        result.errors.push({
          row: i + 1,
          error: error.message,
        })
      }
    }

    return res.json(result)
  } catch (error: any) {
    console.error('Error importing topics:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Import Quizzes
export const importQuizzes = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const data = await parseCSV(req.file.buffer)
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    }

    // Group questions by quiz
    const quizzes = new Map<string, any>()

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        // Expected CSV columns:
        // quiz_slug,quiz_title_ru,quiz_title_ro,question_ru,question_ro,option1_ru,option1_ro,option2_ru,option2_ro,option3_ru,option3_ro,option4_ru,option4_ro,correct_answer

        if (!quizzes.has(row.quiz_slug)) {
          quizzes.set(row.quiz_slug, {
            slug: row.quiz_slug,
            title: {
              ru: row.quiz_title_ru,
              ro: row.quiz_title_ro,
            },
            description: {
              ru: row.quiz_description_ru || '',
              ro: row.quiz_description_ro || '',
            },
            questions: [],
          })
        }

        const quiz = quizzes.get(row.quiz_slug)
        quiz.questions.push({
          question: {
            ru: row.question_ru,
            ro: row.question_ro,
          },
          options: [
            { ru: row.option1_ru, ro: row.option1_ro },
            { ru: row.option2_ru, ro: row.option2_ro },
            { ru: row.option3_ru, ro: row.option3_ro },
            { ru: row.option4_ru, ro: row.option4_ro },
          ],
          correctAnswer: parseInt(row.correct_answer) || 0,
        })
      } catch (error: any) {
        result.failed++
        result.errors.push({
          row: i + 1,
          error: error.message,
        })
      }
    }

    // Save quizzes
    for (const [slug, quizData] of quizzes) {
      try {
        const quiz = new Quiz(quizData)
        await quiz.save()
        result.imported++

        // Send Telegram notification about new quiz (non-blocking)
        if (process.env.TELEGRAM_BOT_TOKEN) {
          TelegramNotificationService.notifyNewQuiz(
            quiz.title,
            quiz.questions?.length || 0
          ).catch(err => {
            console.error('Failed to send quiz notification:', err)
          })
        }
      } catch (error: any) {
        result.failed++
        result.errors.push({
          row: 0,
          error: `Quiz ${slug}: ${error.message}`,
        })
      }
    }

    return res.json(result)
  } catch (error: any) {
    console.error('Error importing quizzes:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Import Massage Protocols
export const importMassageProtocols = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const data = await parseCSV(req.file.buffer)
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        // Expected CSV columns:
        // slug,title_ru,title_ro,description_ru,description_ro,duration,difficulty,category

        const protocol = new MassageProtocol({
          slug: row.slug,
          title: {
            ru: row.title_ru,
            ro: row.title_ro,
          },
          description: {
            ru: row.description_ru || '',
            ro: row.description_ro || '',
          },
          duration: parseInt(row.duration) || 30,
          difficulty: row.difficulty || 'beginner',
          category: row.category || 'general',
          steps: [],
          images: [],
          videos: [],
        })

        await protocol.save()
        result.imported++
      } catch (error: any) {
        result.failed++
        result.errors.push({
          row: i + 1,
          error: error.message,
        })
      }
    }

    return res.json(result)
  } catch (error: any) {
    console.error('Error importing massage protocols:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Import Trigger Points
export const importTriggerPoints = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const data = await parseCSV(req.file.buffer)
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        // Expected CSV columns:
        // slug,name_ru,name_ro,muscle_ru,muscle_ro,location_ru,location_ro,symptoms_ru,symptoms_ro

        const triggerPoint = new TriggerPoint({
          slug: row.slug,
          name: {
            ru: row.name_ru,
            ro: row.name_ro,
          },
          muscle: {
            ru: row.muscle_ru,
            ro: row.muscle_ro,
          },
          location: {
            ru: row.location_ru || '',
            ro: row.location_ro || '',
          },
          symptoms: {
            ru: row.symptoms_ru || '',
            ro: row.symptoms_ro || '',
          },
          treatment: {
            ru: row.treatment_ru || '',
            ro: row.treatment_ro || '',
          },
          images: [],
        })

        await triggerPoint.save()
        result.imported++
      } catch (error: any) {
        result.failed++
        result.errors.push({
          row: i + 1,
          error: error.message,
        })
      }
    }

    return res.json(result)
  } catch (error: any) {
    console.error('Error importing trigger points:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Import JSON data
export const importJSON = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const { type, data } = req.body

    if (!type || !data) {
      return res.status(400).json({ message: 'Missing type or data' })
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    }

    let Model: any
    switch (type) {
      case 'topics':
        Model = Topic
        break
      case 'quizzes':
        Model = Quiz
        break
      case 'protocols':
        Model = MassageProtocol
        break
      case 'triggerPoints':
        Model = TriggerPoint
        break
      case 'categories':
        Model = Category
        break
      case 'guidelines':
        Model = HygieneGuideline
        break
      default:
        return res.status(400).json({ message: 'Invalid type' })
    }

    const items = Array.isArray(data) ? data : [data]

    for (let i = 0; i < items.length; i++) {
      try {
        const item = new Model(items[i])
        await item.save()
        result.imported++
      } catch (error: any) {
        result.failed++
        result.errors.push({
          row: i + 1,
          error: error.message,
        })
      }
    }

    return res.json(result)
  } catch (error: any) {
    console.error('Error importing JSON:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Preview CSV data before import
export const previewCSV = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const data = await parseCSV(req.file.buffer)

    return res.json({
      totalRows: data.length,
      columns: Object.keys(data[0] || {}),
      preview: data.slice(0, 5), // First 5 rows
    })
  } catch (error: any) {
    console.error('Error previewing CSV:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}
