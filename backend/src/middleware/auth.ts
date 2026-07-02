import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'

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

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true, is_active: true },
    })

    if (!user || !user.is_active) {
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
