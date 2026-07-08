# Task 6: Update Template CSV

**Plan:** Add UUID & Organization Fields to Devices
**Location:** docs/superpowers/plans/2026-07-03-add-uuid-organization-fields-plan.md

## Requirements

Update `backend/template_import.csv` to include the 4 new columns.

## File to Modify

`backend/template_import.csv`

## Changes

1. Add these 4 columns to the header row (after `teknisi`):
```
uuid,organization_name,organization_uuid,organization_sname
```

2. Add placeholder values for each data row. Example:
```
deab2cef-20a9-4a6d-98a1-af0361cd88ee,CLUSTER PALEMBANG,549f33c7-aac5-4059-a150-3e4c52239557,C_PLMB
```

## Acceptance Criteria

- [ ] New columns added to header
- [ ] Sample data rows updated with placeholder values
- [ ] CSV is valid format

**Location in Plan:** Phase 3, Task 6

## Context
Task 5 created auth routes. Task 6 creates CRUD routes for devices, locations, and hierarchy.

## Files to Create
1. `backend/src/routes/devices.routes.ts`
2. `backend/src/routes/locations.routes.ts`
3. `backend/src/routes/hierarchy.routes.ts`

## Devices Routes
```typescript
// src/routes/devices.routes.ts
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

const deviceSchema = z.object({
  deviceCode: z.string().min(1),
  deviceName: z.string().min(1),
  deviceType: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  kapasitas: z.string().optional(),
  year: z.number().optional(),
  room: z.string().optional(),
  status: z.enum(['active', 'warning', 'critical', 'inactive']).default('active'),
  condition: z.string().optional(),
  capReal: z.string().optional(),
  locationId: z.string().min(1),
})

// GET /api/devices
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '20', search, status, deviceType, locationId } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = { deletedAt: null }

    if (search) {
      where.OR = [
        { deviceCode: { contains: search as string, mode: 'insensitive' } },
        { deviceName: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (deviceType) where.deviceType = deviceType
    if (locationId) where.locationId = locationId

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        include: { location: { include: { cluster: { include: { district: { include: { regional: true } } } } } } },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.device.count({ where }),
    ])

    res.json({
      devices,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    })
  } catch (error) { throw error }
})

// GET /api/devices/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, byStatus, byType] = await Promise.all([
      prisma.device.count({ where: { deletedAt: null } }),
      prisma.device.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { status: true } }),
      prisma.device.groupBy({ by: ['deviceType'], where: { deletedAt: null }, _count: { deviceType: true } }),
    ])

    res.json({
      total,
      byStatus: byStatus.reduce((acc, item) => { acc[item.status] = item._count.status; return acc }, {} as Record<string, number>),
      byType: byType.reduce((acc, item) => { acc[item.deviceType] = item._count.deviceType; return acc }, {} as Record<string, number>),
    })
  } catch (error) { throw error }
})

// GET /api/devices/:id
router.get('/:id', async (req, res) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: req.params.id },
      include: { location: { include: { cluster: { include: { district: { include: { regional: true } } } } } } },
    })
    if (!device || device.deletedAt) return res.status(404).json({ error: 'Device not found' })
    res.json({ device })
  } catch (error) { throw error }
})

// POST /api/devices
router.post('/', async (req, res) => {
  try {
    const data = deviceSchema.parse(req.body)
    const existing = await prisma.device.findUnique({ where: { deviceCode: data.deviceCode } })
    if (existing) return res.status(400).json({ error: 'Device code already exists' })
    const device = await prisma.device.create({ data })
    res.status(201).json({ device })
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: error.errors })
    throw error
  }
})

// PUT /api/devices/:id
router.put('/:id', async (req, res) => {
  try {
    const data = deviceSchema.partial().parse(req.body)
    const device = await prisma.device.update({ where: { id: req.params.id }, data })
    res.json({ device })
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: error.errors })
    throw error
  }
})

// DELETE /api/devices/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.device.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } })
    res.json({ success: true })
  } catch (error) { throw error }
})

// POST /api/devices/bulk-delete
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body
    await prisma.device.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } })
    res.json({ success: true, count: ids.length })
  } catch (error) { throw error }
})

export default router
```

## Locations Routes
```typescript
// src/routes/locations.routes.ts
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

const locationSchema = z.object({
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  clusterId: z.string().min(1),
  classType: z.string().optional(),
  address: z.string().optional(),
})

// GET /api/locations
router.get('/', async (req, res) => {
  try {
    const { clusterId, districtId, regionalId } = req.query
    const where: any = {}
    if (clusterId) where.clusterId = clusterId as string
    if (districtId) where.cluster = { districtId }
    if (regionalId) where.cluster = { district: { regionalId } }

    const locations = await prisma.location.findMany({
      where,
      include: { cluster: { include: { district: { include: { regional: true } } } }, _count: { select: { devices: { where: { deletedAt: null } } } } },
      orderBy: { name: 'asc' },
    })
    res.json({ locations })
  } catch (error) { throw error }
})

// GET /api/locations/map-data
router.get('/map-data', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        cluster: { include: { district: { include: { regional: true } } } },
        devices: { where: { deletedAt: null }, select: { id: true, deviceCode: true, deviceName: true, deviceType: true, status: true, condition: true } },
      },
    })

    const markers = locations.map(loc => ({
      id: loc.id, name: loc.name, latitude: loc.latitude, longitude: loc.longitude,
      address: loc.address, classType: loc.classType, deviceCount: loc.devices.length, devices: loc.devices,
      hierarchy: { regional: loc.cluster.district.regional.name, district: loc.cluster.district.name, cluster: loc.cluster.name },
      worstStatus: loc.devices.length > 0
        ? loc.devices.some(d => d.status === 'critical') ? 'critical'
        : loc.devices.some(d => d.status === 'warning') ? 'warning' : 'active'
        : 'inactive',
    }))

    res.json({ markers })
  } catch (error) { throw error }
})

// GET /api/locations/:id
router.get('/:id', async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
      include: { cluster: { include: { district: { include: { regional: true } } } }, devices: { where: { deletedAt: null } } },
    })
    if (!location) return res.status(404).json({ error: 'Location not found' })
    res.json({ location })
  } catch (error) { throw error }
})

// POST /api/locations
router.post('/', async (req, res) => {
  try {
    const data = locationSchema.parse(req.body)
    const location = await prisma.location.create({ data })
    res.status(201).json({ location })
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: error.errors })
    throw error
  }
})

// PUT /api/locations/:id
router.put('/:id', async (req, res) => {
  try {
    const data = locationSchema.partial().parse(req.body)
    const location = await prisma.location.update({ where: { id: req.params.id }, data })
    res.json({ location })
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: error.errors })
    throw error
  }
})

// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) { throw error }
})

export default router
```

## Hierarchy Routes
```typescript
// src/routes/hierarchy.routes.ts
import { Router } from 'express'
import { prisma } from '../index'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// GET /api/hierarchy
router.get('/', async (req, res) => {
  try {
    const [regionals, districts, clusters] = await Promise.all([
      prisma.regional.findMany({ include: { districts: { include: { clusters: { include: { _count: { select: { locations: true } } } }, _count: { select: { clusters: true } } } } }, orderBy: { name: 'asc' } }),
      prisma.district.findMany({ include: { regional: true, clusters: { include: { _count: { select: { locations: true } } } } }, orderBy: { name: 'asc' } }),
      prisma.cluster.findMany({ include: { district: { include: { regional: true } }, _count: { select: { locations: true } } }, orderBy: { name: 'asc' } }),
    ])
    res.json({ regionals, districts, clusters })
  } catch (error) { throw error }
})

// POST /api/hierarchy/regionals
router.post('/regionals', async (req, res) => {
  try {
    const { name } = req.body
    const regional = await prisma.regional.create({ data: { name } })
    res.status(201).json({ regional })
  } catch (error) { throw error }
})

// POST /api/hierarchy/districts
router.post('/districts', async (req, res) => {
  try {
    const { name, regionalId } = req.body
    const district = await prisma.district.create({ data: { name, regionalId }, include: { regional: true } })
    res.status(201).json({ district })
  } catch (error) { throw error }
})

// POST /api/hierarchy/clusters
router.post('/clusters', async (req, res) => {
  try {
    const { name, districtId } = req.body
    const cluster = await prisma.cluster.create({ data: { name, districtId }, include: { district: { include: { regional: true } } } })
    res.status(201).json({ cluster })
  } catch (error) { throw error }
})

export default router
```

## Update src/index.ts
Add routes:
```typescript
import devicesRoutes from './routes/devices.routes'
import locationsRoutes from './routes/locations.routes'
import hierarchyRoutes from './routes/hierarchy.routes'

// Add routes:
app.use('/api/devices', devicesRoutes)
app.use('/api/locations', locationsRoutes)
app.use('/api/hierarchy', hierarchyRoutes)
```

## Verification
```bash
# Test devices endpoint (after getting token)
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/devices
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/devices/stats
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/locations/map-data
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/hierarchy
```

## Commit
```bash
git add src/routes/devices.routes.ts src/routes/locations.routes.ts src/routes/hierarchy.routes.ts
git commit -m "feat: add devices, locations, and hierarchy API routes"
```
