import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../index.js'
import { authMiddleware } from '../middleware/auth.js'
import fs from 'fs'

const router = Router()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
})

function log(...args: any[]) {
  const msg = `[${new Date().toISOString()}] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n'
  fs.appendFileSync('debug.log', msg)
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  log('[AUTH] Login attempt')
  try {
    const { username, password } = loginSchema.parse(req.body)
    log('[AUTH] Parsed:', username)

    const user = await prisma.users.findUnique({
      where: { username },
    })
    log('[AUTH] User found:', !!user)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    log('[AUTH] Comparing password...')
    const isValidPassword = await bcrypt.compare(password, user.password)
    log('[AUTH] Password valid:', isValidPassword)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' })
    }

    log('[AUTH] Signing token...')
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    log('[AUTH] Token signed')

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })
  } catch (error) {
    log('[AUTH] Error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.users.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        full_name: data.fullName,
        role: 'STAFF',
      },
    })

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })
  } catch (error: any) {
    log('[AUTH REGISTER ERROR]', error?.message || error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    res.status(500).json({ error: 'Internal server error: ' + (error?.message || 'Unknown') })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    throw error
  }
})

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  full_name: z.string().optional().nullable(),
})

// PUT /api/auth/me
router.put('/me', authMiddleware, async (req: any, res) => {
  try {
    const data = updateProfileSchema.parse(req.body)

    // Check if username/email belongs to someone else
    const existing = await prisma.users.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
        NOT: { id: req.user.id },
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'Username or email already in use' })
    }

    const updatedUser = await prisma.users.update({
      where: { id: req.user.id },
      data: {
        username: data.username,
        email: data.email,
        full_name: data.full_name,
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true,
      },
    })

    res.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
  }
})

const changePasswordSchema = z.object({
  newPassword: z.string().min(6),
})

// PUT /api/auth/me/password
router.put('/me/password', authMiddleware, async (req: any, res) => {
  try {
    const { newPassword } = changePasswordSchema.parse(req.body)

    const user = await prisma.users.findUnique({ where: { id: req.user.id } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.users.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    })

    res.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
  }
})

export default router
