import { Router } from 'express'
import { prisma } from '../index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/hierarchy
router.get('/', async (req, res) => {
  try {
    const [areas, regionals, districts, clusters] = await Promise.all([
      prisma.areas.findMany({
        include: {
          regionals: {
            include: {
              districts: {
                include: {
                  clusters: {
                    include: { _count: { select: { locations: true } } }
                  }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' },
      }),
      prisma.regionals.findMany({
        include: {
          areas: true,
          districts: {
            include: {
              clusters: {
                include: { _count: { select: { locations: true } } }
              }
            }
          }
        },
        orderBy: { name: 'asc' },
      }),
      prisma.districts.findMany({
        include: {
          regionals: {
            include: { areas: true }
          },
          clusters: {
            include: { _count: { select: { locations: true } } }
          }
        },
        orderBy: { name: 'asc' },
      }),
      prisma.clusters.findMany({
        include: {
          districts: {
            include: {
              regionals: {
                include: { areas: true }
              }
            }
          },
          _count: { select: { locations: true } }
        },
        orderBy: { name: 'asc' },
      }),
    ])
    res.json({ areas, regionals, districts, clusters })
  } catch (error) {
    console.error('Error fetching hierarchy:', error)
    throw error
  }
})

// GET /api/hierarchy/areas
router.get('/areas', async (req, res) => {
  try {
    const areas = await prisma.areas.findMany({
      include: {
        _count: { select: { regionals: true } }
      },
      orderBy: { name: 'asc' },
    })
    res.json(areas)
  } catch (error) {
    console.error('Error fetching areas:', error)
    throw error
  }
})

// POST /api/hierarchy/areas
router.post('/areas', async (req, res) => {
  try {
    const { name } = req.body
    const area = await prisma.areas.create({ data: { name } })
    res.status(201).json(area)
  } catch (error) {
    console.error('Error creating area:', error)
    throw error
  }
})

// PUT /api/hierarchy/areas/:id
router.put('/areas/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const area = await prisma.areas.update({
      where: { id },
      data: { name },
    })
    res.json(area)
  } catch (error) {
    console.error('Error updating area:', error)
    throw error
  }
})

// DELETE /api/hierarchy/areas/:id
router.delete('/areas/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.areas.delete({ where: { id } })
    res.json({ message: 'Area deleted' })
  } catch (error) {
    console.error('Error deleting area:', error)
    throw error
  }
})

// GET /api/hierarchy/regionals
router.get('/regionals', async (req, res) => {
  try {
    const { area_id } = req.query
    const regionals = await prisma.regionals.findMany({
      where: area_id ? { area_id: area_id as string } : undefined,
      include: {
        areas: true,
        _count: { select: { districts: true } }
      },
      orderBy: { name: 'asc' },
    })
    res.json(regionals)
  } catch (error) {
    console.error('Error fetching regionals:', error)
    throw error
  }
})

// POST /api/hierarchy/regionals
router.post('/regionals', async (req, res) => {
  try {
    const { name, areaId } = req.body
    const regional = await prisma.regionals.create({
      data: {
        name,
        area_id: areaId || null,
      },
      include: { areas: true },
    })
    res.status(201).json(regional)
  } catch (error) {
    console.error('Error creating regional:', error)
    throw error
  }
})

// PUT /api/hierarchy/regionals/:id
router.put('/regionals/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, areaId } = req.body
    const regional = await prisma.regionals.update({
      where: { id },
      data: {
        name,
        area_id: areaId || null,
      },
      include: { areas: true },
    })
    res.json(regional)
  } catch (error) {
    console.error('Error updating regional:', error)
    throw error
  }
})

// DELETE /api/hierarchy/regionals/:id
router.delete('/regionals/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.regionals.delete({ where: { id } })
    res.json({ message: 'Regional deleted' })
  } catch (error) {
    console.error('Error deleting regional:', error)
    throw error
  }
})

// GET /api/hierarchy/districts
router.get('/districts', async (req, res) => {
  try {
    const { regional_id } = req.query
    const districts = await prisma.districts.findMany({
      where: regional_id ? { regional_id: regional_id as string } : undefined,
      include: {
        regionals: {
          include: { areas: true }
        },
        _count: { select: { clusters: true } }
      },
      orderBy: { name: 'asc' },
    })
    res.json(districts)
  } catch (error) {
    console.error('Error fetching districts:', error)
    throw error
  }
})

// POST /api/hierarchy/districts
router.post('/districts', async (req, res) => {
  try {
    const { name, regionalId } = req.body
    const district = await prisma.districts.create({
      data: { name, regional_id: regionalId },
      include: {
        regionals: {
          include: { areas: true }
        },
      },
    })
    res.status(201).json(district)
  } catch (error) {
    console.error('Error creating district:', error)
    throw error
  }
})

// PUT /api/hierarchy/districts/:id
router.put('/districts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, regionalId } = req.body
    const district = await prisma.districts.update({
      where: { id },
      data: {
        name,
        regional_id: regionalId,
      },
      include: {
        regionals: {
          include: { areas: true }
        },
      },
    })
    res.json(district)
  } catch (error) {
    console.error('Error updating district:', error)
    throw error
  }
})

// DELETE /api/hierarchy/districts/:id
router.delete('/districts/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.districts.delete({ where: { id } })
    res.json({ message: 'District deleted' })
  } catch (error) {
    console.error('Error deleting district:', error)
    throw error
  }
})

// GET /api/hierarchy/clusters
router.get('/clusters', async (req, res) => {
  try {
    const { district_id } = req.query
    const clusters = await prisma.clusters.findMany({
      where: district_id ? { district_id: district_id as string } : undefined,
      include: {
        districts: {
          include: {
            regionals: {
              include: { areas: true }
            }
          }
        },
        _count: { select: { locations: true } }
      },
      orderBy: { name: 'asc' },
    })
    res.json(clusters)
  } catch (error) {
    console.error('Error fetching clusters:', error)
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
        districts: {
          include: {
            regionals: {
              include: { areas: true }
            }
          }
        }
      },
    })
    res.status(201).json(cluster)
  } catch (error) {
    console.error('Error creating cluster:', error)
    throw error
  }
})

// PUT /api/hierarchy/clusters/:id
router.put('/clusters/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, districtId } = req.body
    const cluster = await prisma.clusters.update({
      where: { id },
      data: {
        name,
        district_id: districtId,
      },
      include: {
        districts: {
          include: {
            regionals: {
              include: { areas: true }
            }
          }
        }
      },
    })
    res.json(cluster)
  } catch (error) {
    console.error('Error updating cluster:', error)
    throw error
  }
})

// DELETE /api/hierarchy/clusters/:id
router.delete('/clusters/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.clusters.delete({ where: { id } })
    res.json({ message: 'Cluster deleted' })
  } catch (error) {
    console.error('Error deleting cluster:', error)
    throw error
  }
})

export default router
