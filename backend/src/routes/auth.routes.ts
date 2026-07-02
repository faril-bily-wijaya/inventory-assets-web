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

    if (!user.isActive) {
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
        fullName: user.fullName,
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
        fullName: data.fullName,
        role: 'USER',
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
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
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
        fullName: true,
        role: true,
        createdAt: true,
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

export default router
