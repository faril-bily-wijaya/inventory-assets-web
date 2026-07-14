import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { rateLimit } from 'express-rate-limit'
import { authRoutes, usersRoutes, devicesRoutes, locationsRoutes, hierarchyRoutes } from './routes/index.js'
import { errorHandler } from './middleware/error-handler.js'

dotenv.config()

const app = express()
const connectionString = process.env.DATABASE_URL

// Create Prisma client with adapter for Prisma 7
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const PORT = process.env.PORT || 8080

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet())
app.use(limiter)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/devices', devicesRoutes)
app.use('/api/locations', locationsRoutes)
app.use('/api/hierarchy', hierarchyRoutes)

// Error handler (must be last)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('Prisma client disconnected')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  console.log('Prisma client disconnected')
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { prisma }
