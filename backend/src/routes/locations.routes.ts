import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { authMiddleware } from '../middleware/auth.js'
import { hitungButuhModernisasi } from '../utils/modernization.js'

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
    if (districtId) where.cluster = { districtId: districtId as string }
    if (regionalId) where.cluster = { district: { regionalId: regionalId as string } }

    const locations = await prisma.location.findMany({
      where,
      include: {
        cluster: {
          include: {
            district: {
              include: { regional: true }
            }
          }
        },
        _count: {
          select: { devices: { where: { deletedAt: null } } }
        }
      },
      orderBy: { name: 'asc' },
    })
    res.json({ locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw error
  }
})

// GET /api/locations/map-data
router.get('/map-data', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        cluster: {
          include: {
            district: {
              include: { regional: true }
            }
          }
        },
        devices: {
          where: { deletedAt: null },
          select: {
            id: true,
            deviceCode: true,
            deviceName: true,
            deviceType: true,
            status: true,
            condition: true,
          },
        },
      },
    })

    const markers = locations.map(loc => {
      const activeDevices = loc.devices.filter(d => d.status === 'critical')
        .concat(loc.devices.filter(d => d.status === 'warning'))
        .concat(loc.devices.filter(d => d.status === 'active'))

      let worstStatus = 'inactive'
      if (loc.devices.length > 0) {
        if (loc.devices.some(d => d.status === 'critical')) worstStatus = 'critical'
        else if (loc.devices.some(d => d.status === 'warning')) worstStatus = 'warning'
        else worstStatus = 'active'
      }

      return {
        id: loc.id,
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
        classType: loc.classType,
        deviceCount: loc.devices.length,
        devices: loc.devices,
        hierarchy: {
          regional: loc.cluster.district.regional.name,
          district: loc.cluster.district.name,
          cluster: loc.cluster.name,
        },
        worstStatus,
      }
    })

    res.json({ markers })
  } catch (error) {
    console.error('Error fetching map data:', error)
    throw error
  }
})

// GET /api/locations/:id
router.get('/:id', async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
      include: {
        cluster: {
          include: {
            district: {
              include: { regional: true }
            }
          }
        },
        devices: {
          where: { deletedAt: null }
        },
      },
    })
    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
    }
    res.json({ location })
  } catch (error) {
    console.error('Error fetching location:', error)
    throw error
  }
})

// POST /api/locations
router.post('/', async (req, res) => {
  try {
    const data = locationSchema.parse(req.body)
    const location = await prisma.location.create({ data })
    res.status(201).json({ location })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    throw error
  }
})

// PUT /api/locations/:id
router.put('/:id', async (req, res) => {
  try {
    const data = locationSchema.partial().parse(req.body)
    const location = await prisma.location.update({
      where: { id: req.params.id },
      data,
    })
    res.json({ location })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    throw error
  }
})

// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.location.delete({
      where: { id: req.params.id },
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
})

const CATU_DAYA_TYPES = [
  'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
  'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
  'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
  'TRAFO', 'ATS', 'AMF'
]

// GET /api/locations/:id/devices
router.get('/:id/devices', async (req, res) => {
  try {
    const { id } = req.params

    // Get location with hierarchy
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        cluster: {
          include: {
            district: {
              include: { regional: true },
            },
          },
        },
      },
    })

    if (!location) {
      return res.status(404).json({ error: 'Lokasi tidak ditemukan' })
    }

    // Get all devices for this location (excluding deleted)
    const devices = await prisma.device.findMany({
      where: { locationId: id, deletedAt: null },
    })

    // Categorize and add modernization info
    const catuDayaItems: any[] = []
    const nonCatuDayaItems: any[] = []

    for (const device of devices) {
      const deviceType = device.deviceType.toUpperCase()
      const isCatuDaya = CATU_DAYA_TYPES.some(t => deviceType.includes(t))

      // Calculate modernization using the utility
      const tahunOperasi = device.year || new Date().getFullYear()
      const modernization = hitungButuhModernisasi(deviceType, tahunOperasi)

      const deviceWithModernization = {
        id: device.id,
        deviceCode: device.deviceCode,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        brand: device.brand,
        serialNumber: device.serialNumber,
        kapasitas: device.kapasitas,
        year: device.year,
        status: device.status,
        condition: device.condition,
        room: device.room,
        ...modernization,
      }

      if (isCatuDaya) {
        catuDayaItems.push(deviceWithModernization)
      } else {
        nonCatuDayaItems.push(deviceWithModernization)
      }
    }

    res.json({
      location: {
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        classType: location.classType,
        hierarchy: {
          regional: location.cluster?.district?.regional?.name,
          district: location.cluster?.district?.name,
          cluster: location.cluster?.name,
        },
      },
      devices: {
        catuDaya: {
          total: catuDayaItems.length,
          items: catuDayaItems.slice(0, 5),
          hasMore: catuDayaItems.length > 5,
        },
        nonCatuDaya: {
          total: nonCatuDayaItems.length,
          items: nonCatuDayaItems.slice(0, 5),
          hasMore: nonCatuDayaItems.length > 5,
        },
      },
    })
  } catch (error) {
    console.error('Get location devices error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data devices' })
  }
})

export default router
