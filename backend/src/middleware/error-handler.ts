import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error Handler:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  })

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
