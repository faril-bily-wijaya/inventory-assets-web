import { Router } from 'express'
import { prisma } from '../index.js'
import { authMiddleware, adminOnly } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

// GET /api/users
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await prisma.users.findMany({
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

    const user = await prisma.users.update({
      where: { id: req.params.id as string },
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

    const user = await prisma.users.update({
      where: { id: req.params.id as string },
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
    await prisma.users.update({
      where: { id: req.params.id as string },
      data: { isActive: false },
    })

    res.json({ success: true })
  } catch (error) {
    throw error
  }
})

export default router
