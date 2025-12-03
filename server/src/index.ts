import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from './config/database'
import './config/cloudinary'
import { initializeChatSocket } from './sockets/chatSocket'
import categoryRoutes from './routes/categoryRoutes'
import topicRoutes from './routes/topicRoutes'
import quizRoutes from './routes/quizRoutes'
import mediaRoutes from './routes/mediaRoutes'
import authRoutes from './routes/auth'
import subscriptionRoutes from './routes/subscriptionRoutes'
import paypalRoutes from './routes/paypalRoutes'
import massageProtocolRoutes from './routes/massageProtocolRoutes'
import hygieneGuidelineRoutes from './routes/hygieneGuidelineRoutes'
import anatomyModel3DRoutes from './routes/anatomyModel3DRoutes'
import triggerPointRoutes from './routes/triggerPointRoutes'
import tierPaymentRoutes from './routes/tierPaymentRoutes'
import usersManagementRoutes from './routes/usersManagementRoutes'
import chatRoutes from './routes/chatRoutes'
import searchRoutes from './routes/searchRoutes'
import bookmarkRoutes from './routes/bookmarkRoutes'
import noteRoutes from './routes/noteRoutes'
import resourceRoutes from './routes/resourceRoutes'
import progressRoutes from './routes/progressRoutes'

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3000

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return callback(null, true)
      }
      const allowedOrigins = process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',').map(url => url.trim())
        : ['http://localhost:5173']
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  },
})

// Initialize chat socket handlers
initializeChatSocket(io)

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}))
app.use(compression())
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)

    // In development, allow any localhost origin
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true)
    }

    // In production, allow configured origins
    const allowedOrigins = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map(url => url.trim())
      : ['http://localhost:5173']

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files (uploads) - using absolute path with CORS
const uploadsPath = path.join(__dirname, '..', 'uploads')
console.log('📁 Uploads directory:', uploadsPath)
// Применяем CORS для статических файлов
app.use('/uploads', cors({
  origin: '*',
  methods: ['GET'],
  credentials: false
}), express.static(uploadsPath))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/topics', topicRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/paypal', paypalRoutes)
app.use('/api/massage-protocols', massageProtocolRoutes)
app.use('/api/hygiene-guidelines', hygieneGuidelineRoutes)
app.use('/api/anatomy-models-3d', anatomyModel3DRoutes)
app.use('/api/trigger-points', triggerPointRoutes)
app.use('/api/tier-payment', tierPaymentRoutes)
app.use('/api/users-management', usersManagementRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api', searchRoutes)
app.use('/api', bookmarkRoutes)
app.use('/api', noteRoutes)
app.use('/api', resourceRoutes)
app.use('/api', progressRoutes)

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } })
})

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB()
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
      console.log(`📚 API available at http://localhost:${PORT}/api`)
      console.log(`💬 Socket.io server is ready`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
