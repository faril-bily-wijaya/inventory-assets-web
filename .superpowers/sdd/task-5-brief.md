# Task 5: Create Auth Routes and Middleware

**Location in Plan:** Phase 3, Task 5

## Context
Task 2 created the backend foundation. Task 5 creates authentication middleware and routes.

## Files to Create
1. `backend/src/middleware/auth.ts` - JWT authentication middleware
2. `backend/src/middleware/error-handler.ts` - Global error handler
3. `backend/src/routes/auth.routes.ts` - Auth endpoints (login, register, me)
4. `backend/src/routes/users.routes.ts` - User management endpoints

## Auth Middleware
```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index'

interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    role: string
  }
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      username: string
      role: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
```

## Error Handler Middleware
```typescript
// src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err)

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' })
  }

  return res.status(500).json({ error: 'Internal server error' })
}
```

## Auth Routes
```typescript
// src/routes/auth.routes.ts
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth'

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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    throw error
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
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
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    throw error
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
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
```

## Users Routes
```typescript
// src/routes/users.routes.ts
import { Router } from 'express'
import { prisma } from '../index'
import { authMiddleware, adminOnly } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

// GET /api/users
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ users })
  } catch (error) {
    throw error
  }
})

// PUT /api/users/:id/role
router.put('/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body

    if (!['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    res.json({ user })
  } catch (error) {
    throw error
  }
})

// PUT /api/users/:id/active
router.put('/:id/active', adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    res.json({ user })
  } catch (error) {
    throw error
  }
})

// DELETE /api/users/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })

    res.json({ success: true })
  } catch (error) {
    throw error
  }
})

export default router
```

## Update src/index.ts to use routes and middleware
Add to the imports and routes section:
```typescript
import authRoutes from './routes/auth.routes'
import usersRoutes from './routes/users.routes'

// Add after health check:
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)

// Update error handler:
import { errorHandler } from './middleware/error-handler'
app.use(errorHandler)
```

## Default Admin User
The database already has admin user (username: `admin`, password: `admin123`).

## Verification
Test the API:
```bash
# Health check
curl http://localhost:8080/api/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Commit
```bash
git add src/middleware/ src/routes/
git commit -m "feat: add auth middleware and API routes"
```
