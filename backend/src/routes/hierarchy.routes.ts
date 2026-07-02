import { Router } from 'express'
import { prisma } from '../index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/hierarchy
router.get('/', async (req, res) => {
  try {
    const [regionals, districts, clusters] = await Promise.all([
      prisma.regionals.findMany({
        include: {
          districts: {
            include: {
              clusters: {
                include: { _count: { select: { locations: true } } }
              },
              _count: { select: { clusters: true } }
            }
          }
        },
        orderBy: { name: 'asc' },
      }),
      prisma.districts.findMany({
        include: {
          regional: true,
          clusters: {
            include: { _count: { select: { locations: true } } }
          }
        },
        orderBy: { name: 'asc' },
      }),
      prisma.clusters.findMany({
        include: {
          district: {
            include: { regional: true }
          },
          _count: { select: { locations: true } }
        },
        orderBy: { name: 'asc' },
      }),
    ])
    res.json({ regionals, districts, clusters })
  } catch (error) {
    console.error('Error fetching hierarchy:', error)
    throw error
  }
})

// POST /api/hierarchy/regionals
router.post('/regionals', async (req, res) => {
  try {
    const { name } = req.body
    const regional = await prisma.regionals.create({ data: { name } })
    res.status(201).json({ regional })
  } catch (error) {
    console.error('Error creating regional:', error)
    throw error
  }
})

// POST /api/hierarchy/districts
router.post('/districts', async (req, res) => {
  try {
    const { name, regionalId } = req.body
    const district = await prisma.districts.create({
      data: { name, regional_id: regionalId },
      include: { regional: true },
    })
    res.status(201).json({ district })
  } catch (error) {
    console.error('Error creating district:', error)
    throw error
  }
})

// POST /api/hierarchy/clusters
router.post('/clusters', async (req, res) => {
  try {
    const { name, districtId } = req.body
    const cluster = await prisma.clusters.create({
      data: { name, district_id: districtId },
      include: {
        district: {
          include: { regional: true }
        }
      },
    })
    res.status(201).json({ cluster })
  } catch (error) {
    console.error('Error creating cluster:', error)
    throw error
  }
})

export default router
