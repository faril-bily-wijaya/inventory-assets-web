import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { authMiddleware } from '../middleware/auth.js'
import { hitungButuhModernisasi } from '../utils/modernization.js'

const router = Router()
router.use(authMiddleware)

const locationSchema = z.object({
  name: z.string().min(1),
  siteCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  clusterId: z.string().optional(),
  classType: z.string().optional(),
  address: z.string().optional(),
  territory: z.string().optional(),
  teknisi: z.string().optional(),
  uuid: z.string().optional(),
  organizationUuid: z.string().optional(),
  organizationSname: z.string().optional(),
})

// Simple memory cache
const cache = {
  locationsAll: null as any,
  locationsAllTime: 0,
  mapDataAll: null as any,
  mapDataAllTime: 0,
}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const invalidateLocationsCache = () => {
  cache.locationsAll = null
  cache.mapDataAll = null
}

// GET /api/locations
router.get('/', async (req, res) => {
  try {
    const isUnfiltered = Object.keys(req.query).length === 0
    if (isUnfiltered && cache.locationsAll && Date.now() - cache.locationsAllTime < CACHE_TTL) {
      return res.json({ locations: cache.locationsAll })
    }

    const toArray = (val: any) => (Array.isArray(val) ? val : [val]) as string[]
    const { areaId, clusterId, districtId, regionalId, locationId } = req.query
    const where: any = {}
    if (locationId) where.id = { in: toArray(locationId) }
    if (clusterId) where.cluster_id = { in: toArray(clusterId) }
    if (districtId) where.clusters = { districts: { id: { in: toArray(districtId) } } }
    if (regionalId) where.clusters = { districts: { regionals: { id: { in: toArray(regionalId) } } } }
    if (areaId) where.clusters = { districts: { regionals: { areas: { id: { in: toArray(areaId) } } } } }

    const locations = await prisma.locations.findMany({
      where,
      include: {
        clusters: {
          include: {
            districts: {
              include: { regionals: { include: { areas: true } } }
            }
          }
        },
      },
      orderBy: { name: 'asc' },
    }) as any[]

    if (isUnfiltered) {
      cache.locationsAll = locations
      cache.locationsAllTime = Date.now()
    }

    res.json({ locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw error
  }
})

// GET /api/locations/map-data
router.get('/map-data', async (req, res) => {
  try {
    const isUnfiltered = Object.keys(req.query).length === 0
    if (isUnfiltered && cache.mapDataAll && Date.now() - cache.mapDataAllTime < CACHE_TTL) {
      return res.json({ markers: cache.mapDataAll })
    }

    const toArray = (val: any) => (Array.isArray(val) ? val : [val]) as string[]
    const { areaId, clusterId, districtId, regionalId, locationId } = req.query
    const where: any = {
      devices: {
        some: { deleted_at: null }
      }
    }
    if (locationId) where.id = { in: toArray(locationId) }
    if (clusterId) where.cluster_id = { in: toArray(clusterId) }
    if (districtId) where.clusters = { districts: { id: { in: toArray(districtId) } } }
    if (regionalId) where.clusters = { districts: { regionals: { id: { in: toArray(regionalId) } } } }
    if (areaId) where.clusters = { districts: { regionals: { areas: { id: { in: toArray(areaId) } } } } }

    const locations = await prisma.locations.findMany({
      where,
      include: {
        clusters: {
          include: {
            districts: {
              include: { regionals: { include: { areas: true } } }
            }
          }
        },
        devices: {
          where: { deleted_at: null }
        }
      },
    }) as any[]

    const markers = locations.map((loc: any) => {
      const activeDevices = loc.devices.filter((d: any) => d.status === 'critical')
        .concat(loc.devices.filter((d: any) => d.status === 'warning'))
        .concat(loc.devices.filter((d: any) => d.status === 'active'))

      let worstStatus = 'inactive'
      if (loc.devices.length > 0) {
        if (loc.devices.some((d: any) => d.status === 'critical')) worstStatus = 'critical'
        else if (loc.devices.some((d: any) => d.status === 'warning')) worstStatus = 'warning'
        else worstStatus = 'active'
      }

      // Map snake_case to camelCase for the frontend MapContext
      const mappedDevices = loc.devices.map((d: any) => {
        const mod = hitungButuhModernisasi(d.device_type, d.year || new Date().getFullYear())
        return {
          id: d.id,
          deviceCode: d.device_code,
          deviceName: d.device_name,
          deviceType: d.device_type,
          brand: d.brand,
          model: d.model,
          serialNumber: d.serial_number,
          labelCode: d.label_code,
          kapasitas: d.kapasitas,
          satuanKapasitas: d.satuan_kapasitas,
          year: d.year,
          usiaPerangkat: d.usia_perangkat,
          ruanganCode: d.ruangan_code,
          ruanganName: d.ruangan_name,
          ruanganPanjang: d.ruangan_panjang,
          ruanganLebar: d.ruangan_lebar,
          ruanganTinggi: d.ruangan_tinggi,
          ruanganLuas: d.ruangan_luas,
          rackCode: d.rack_code,
          rackName: d.rack_name,
          rackPanjang: d.rack_panjang,
          rackLebar: d.rack_lebar,
          rackTinggi: d.rack_tinggi,
          rackLuas: d.rack_luas,
          status: d.status,
          condition: d.condition,
          capReal: d.cap_real,
          jenisTegangan: d.jenis_tegangan,
          bebanArus: d.beban_arus,
          satuanBeban: d.satuan_beban,
          keterangan: d.keterangan,
          uuid: d.uuid,
          organizationName: d.organization_name,
          organizationUuid: d.organization_uuid,
          organizationSname: d.organization_sname,
          locationId: d.location_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          butuhModernisasi: mod.butuhModernisasi,
          alasan: mod.alasan
        }
      })

      return {
        id: loc.id,
        name: loc.name,
        site_code: loc.site_code,
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
        class_type: loc.class_type,
        teknisi: loc.teknisi,
        deviceCount: loc.devices.length,
        devices: mappedDevices,
        hierarchy: {
          area: loc.clusters?.districts?.regionals?.areas?.name,
          regional: loc.clusters?.districts?.regionals?.name,
          district: loc.clusters?.districts?.name,
          cluster: loc.clusters?.name,
        },
        worstStatus,
      }
    })

    if (isUnfiltered) {
      cache.mapDataAll = markers
      cache.mapDataAllTime = Date.now()
    }

    res.json({ markers })
  } catch (error) {
    console.error('Error fetching map data:', error)
    throw error
  }
})

// GET /api/locations/:id
router.get('/:id', async (req, res) => {
  try {
    const location = await prisma.locations.findUnique({
      where: { id: req.params.id },
      include: {
        clusters: {
          include: {
            districts: {
              include: { regionals: true }
            }
          }
        },
        devices: {
          where: { deleted_at: null }
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
    const location = await prisma.locations.create({ 
      data: {
        name: data.name,
        site_code: data.siteCode,
        latitude: data.latitude,
        longitude: data.longitude,
        cluster_id: data.clusterId,
        class_type: data.classType,
        address: data.address,
        territory: data.territory,
        teknisi: data.teknisi,
        uuid: data.uuid,
        organization_uuid: data.organizationUuid,
        organization_sname: data.organizationSname,
      }
    })
    invalidateLocationsCache()
    res.status(201).json({ location })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
  }
})

// PUT /api/locations/:id
router.put('/:id', async (req, res) => {
  try {
    const data = locationSchema.partial().parse(req.body)
    
    // Build update object
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.siteCode !== undefined) updateData.site_code = data.siteCode
    if (data.latitude !== undefined) updateData.latitude = data.latitude
    if (data.longitude !== undefined) updateData.longitude = data.longitude
    if (data.clusterId !== undefined) updateData.cluster_id = data.clusterId
    if (data.classType !== undefined) updateData.class_type = data.classType
    if (data.address !== undefined) updateData.address = data.address
    if (data.territory !== undefined) updateData.territory = data.territory
    if (data.teknisi !== undefined) updateData.teknisi = data.teknisi
    if (data.uuid !== undefined) updateData.uuid = data.uuid
    if (data.organizationUuid !== undefined) updateData.organization_uuid = data.organizationUuid
    if (data.organizationSname !== undefined) updateData.organization_sname = data.organizationSname

    const location = await prisma.locations.update({
      where: { id: req.params.id },
      data: updateData,
    })
    invalidateLocationsCache()
    res.json({ location })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
  }
})

// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.locations.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }, // Soft delete
    })
    invalidateLocationsCache()
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
    const location = await prisma.locations.findUnique({
      where: { id },
      include: {
        clusters: {
          include: {
            districts: {
              include: { regionals: { include: { areas: true } } },
            },
          },
        },
      },
    })

    if (!location) {
      return res.status(404).json({ error: 'Lokasi tidak ditemukan' })
    }

    // Get all devices for this location (excluding deleted)
    const devices = await prisma.devices.findMany({
      where: { location_id: id, deleted_at: null },
    })

    // Categorize and add modernization info
    const catuDayaItems: any[] = []
    const nonCatuDayaItems: any[] = []

    for (const device of devices) {
      const device_type = device.device_type.toUpperCase()
      const isCatuDaya = CATU_DAYA_TYPES.some(t => device_type.includes(t))

      // Calculate modernization using the utility
      const tahunOperasi = device.year || new Date().getFullYear()
      const modernization = hitungButuhModernisasi(device_type, tahunOperasi)

      const deviceWithModernization = {
        id: device.id,
        deviceCode: device.device_code,
        deviceName: device.device_name,
        deviceType: device.device_type,
        brand: device.brand,
        serialNumber: device.serial_number,
        kapasitas: device.kapasitas,
        year: device.year,
        status: device.status,
        condition: device.condition,
        ruanganName: device.ruangan_name,
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
        class_type: location.class_type,
        hierarchy: {
          area: location.clusters?.districts?.regionals?.areas?.name,
          regional: location.clusters?.districts?.regionals?.name,
          district: location.clusters?.districts?.name,
          cluster: location.clusters?.name,
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
