import { Router } from 'express'
import { z } from 'zod'
import multer from 'multer'
import fs from 'fs'
import { prisma } from '../index.js'
import { authMiddleware } from '../middleware/auth.js'
import { validateFile } from '../utils/fileValidator.js'
import { parseFile } from '../utils/fileParser.js'
import { generateImportPreview, executeImport } from '../services/importService.js'
import { invalidateLocationsCache } from './locations.routes.js'
import { hitungButuhModernisasi } from '../utils/modernization.js'

const router = Router()
router.use(authMiddleware)

const deviceSchema = z.object({
  deviceCode: z.string().min(1),
  deviceName: z.string().min(1),
  deviceType: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  labelCode: z.string().optional(),
  kapasitas: z.string().optional(),
  satuanKapasitas: z.string().optional(),
  year: z.number().optional(),
  usiaPerangkat: z.number().optional(),
  status: z.string().default('OPERATIONAL'),
  condition: z.string().optional(),
  capReal: z.string().optional(),
  jenisTegangan: z.string().optional(),
  bebanArus: z.number().optional(),
  satuanBeban: z.string().optional(),
  keterangan: z.string().optional(),
  ruanganCode: z.string().optional(),
  ruanganName: z.string().optional(),
  ruanganPanjang: z.number().optional(),
  ruanganLebar: z.number().optional(),
  ruanganTinggi: z.number().optional(),
  ruanganLuas: z.number().optional(),
  rackCode: z.string().optional(),
  rackName: z.string().optional(),
  rackPanjang: z.number().optional(),
  rackLebar: z.number().optional(),
  rackTinggi: z.number().optional(),
  rackLuas: z.number().optional(),
  locationId: z.string().min(1),
})

// GET /api/devices
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '20', search, status, condition, deviceType, locationId } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = { deleted_at: null }
    const andConditions: any[] = []

    if (search) {
      andConditions.push({
        OR: [
          { device_code: { contains: search as string, mode: 'insensitive' } },
          { device_name: { contains: search as string, mode: 'insensitive' } },
          { serial_number: { contains: search as string, mode: 'insensitive' } },
          { brand: { contains: search as string, mode: 'insensitive' } },
          { model: { contains: search as string, mode: 'insensitive' } },
          { device_type: { contains: search as string, mode: 'insensitive' } },
          { kapasitas: { contains: search as string, mode: 'insensitive' } },
          { ruangan_name: { contains: search as string, mode: 'insensitive' } },
          { rack_name: { contains: search as string, mode: 'insensitive' } },
          { locations: { name: { contains: search as string, mode: 'insensitive' } } },
          { locations: { site_code: { contains: search as string, mode: 'insensitive' } } },
        ]
      })
    }
    
    if (status) {
      if (status === 'MODERNISASI') {
        const currentYear = new Date().getFullYear()
        andConditions.push({
          OR: [
            { device_type: { equals: 'ACSPLIT', mode: 'insensitive' }, year: { lt: currentYear - 15 } },
            { device_type: { equals: 'ACSTANDING', mode: 'insensitive' }, year: { lt: currentYear - 15 } },
            { device_type: { equals: 'RECTIFIER', mode: 'insensitive' }, year: { lt: currentYear - 15 } },
            { device_type: { equals: 'BATKERING', mode: 'insensitive' }, year: { lt: currentYear - 10 } },
            { device_type: { equals: 'BATBASAH', mode: 'insensitive' }, year: { lt: currentYear - 20 } },
            { device_type: { equals: 'GENSET', mode: 'insensitive' }, year: { lt: currentYear - 25 } },
          ]
        })
      } else {
        andConditions.push({ status })
      }
    }
    
    if (condition) {
      andConditions.push({ condition })
    }
    
    if (deviceType) {
      const types = (deviceType as string).split(',').map(t => t.trim())
      andConditions.push({ device_type: { in: types } })
    }
    
    if (locationId) {
      andConditions.push({ location_id: locationId })
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    const [devices, total] = await Promise.all([
      prisma.devices.findMany({
        where,
        include: {
          locations: {
            include: {
              clusters: {
                include: {
                  districts: {
                    include: { regionals: true }
                  }
                }
              }
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
      }) as any,
      prisma.devices.count({ where }),
    ])

    const mappedDevices = devices.map((d: any) => {
      const modernization = hitungButuhModernisasi(d.device_type, d.year || new Date().getFullYear())
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
        locationId: d.location_id,
        location: d.locations,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        ...modernization,
      }
    })

    res.json({
      devices: mappedDevices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Error fetching devices:', error)
    throw error
  }
})

// GET /api/devices/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, byStatus, byType] = await Promise.all([
      prisma.devices.count({ where: { deleted_at: null } }),
      prisma.devices.groupBy({
        by: ['status'],
        where: { deleted_at: null },
        _count: { status: true },
      }),
      prisma.devices.groupBy({
        by: ['device_type'],
        where: { deleted_at: null },
        _count: { device_type: true },
      }),
    ])

    const byStatusMap: Record<string, number> = {}
    byStatus.forEach(item => {
      byStatusMap[item.status] = item._count.status
    })

    const CATU_DAYA_TYPES = [
      'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
      'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
      'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
      'TRAFO', 'ATS', 'AMF'
    ]

    const byTypeMap: Record<string, number> = {}
    let catuDayaCount = 0
    let nonCatuDayaCount = 0

    byType.forEach(item => {
      const type = item.device_type.toUpperCase()
      const count = item._count.device_type
      byTypeMap[item.device_type] = count

      const isCatuDaya = CATU_DAYA_TYPES.some(t => type.includes(t))
      if (isCatuDaya) {
        catuDayaCount += count
      } else {
        nonCatuDayaCount += count
      }
    })

    res.json({
      total,
      byStatus: byStatusMap,
      byType: byTypeMap,
      byCategory: {
        catuDaya: catuDayaCount,
        nonCatuDaya: nonCatuDayaCount,
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    throw error
  }
})

// GET /api/devices/:id
router.get('/:id', async (req, res) => {
  try {
    const device = await prisma.devices.findUnique({
      where: { id: req.params.id },
      include: {
        locations: {
          include: {
            clusters: {
              include: {
                districts: {
                  include: { regionals: true }
                }
              }
            }
          }
        }
      },
    }) as any
    if (!device || device.deleted_at) {
      return res.status(404).json({ error: 'Device not found' })
    }
    
    const mappedDevice = {
      id: device.id,
      deviceCode: device.device_code,
      deviceName: device.device_name,
      deviceType: device.device_type,
      brand: device.brand,
      model: device.model,
      serialNumber: device.serial_number,
      labelCode: device.label_code,
      kapasitas: device.kapasitas,
      satuanKapasitas: device.satuan_kapasitas,
      year: device.year,
      usiaPerangkat: device.usia_perangkat,
      ruanganCode: device.ruangan_code,
      ruanganName: device.ruangan_name,
      ruanganPanjang: device.ruangan_panjang,
      ruanganLebar: device.ruangan_lebar,
      ruanganTinggi: device.ruangan_tinggi,
      ruanganLuas: device.ruangan_luas,
      rackCode: device.rack_code,
      rackName: device.rack_name,
      rackPanjang: device.rack_panjang,
      rackLebar: device.rack_lebar,
      rackTinggi: device.rack_tinggi,
      rackLuas: device.rack_luas,
      status: device.status,
      condition: device.condition,
      capReal: device.cap_real,
      jenisTegangan: device.jenis_tegangan,
      bebanArus: device.beban_arus,
      satuanBeban: device.satuan_beban,
      keterangan: device.keterangan,
      locationId: device.location_id,
      location: device.locations,
      createdAt: device.created_at,
      updatedAt: device.updated_at,
    }

    res.json({ device: mappedDevice })
  } catch (error) {
    console.error('Error fetching device:', error)
    throw error
  }
})

// POST /api/devices
router.post('/', async (req, res) => {
  try {
    const data = deviceSchema.parse(req.body)
    const existing = await prisma.devices.findUnique({
      where: { device_code: data.deviceCode },
    })
    if (existing) {
      return res.status(400).json({ error: 'Device code already exists' })
    }
    const device = await prisma.devices.create({
      data: {
        device_code: data.deviceCode,
        device_name: data.deviceName,
        device_type: data.deviceType,
        brand: data.brand,
        model: data.model,
        serial_number: data.serialNumber,
        label_code: data.labelCode,
        kapasitas: data.kapasitas,
        satuan_kapasitas: data.satuanKapasitas,
        year: data.year,
        usia_perangkat: data.usiaPerangkat,
        status: data.status,
        condition: data.condition,
        cap_real: data.capReal,
        jenis_tegangan: data.jenisTegangan,
        beban_arus: data.bebanArus,
        satuan_beban: data.satuanBeban,
        keterangan: data.keterangan,
        ruangan_code: data.ruanganCode,
        ruangan_name: data.ruanganName,
        ruangan_panjang: data.ruanganPanjang,
        ruangan_lebar: data.ruanganLebar,
        ruangan_tinggi: data.ruanganTinggi,
        ruangan_luas: data.ruanganLuas,
        rack_code: data.rackCode,
        rack_name: data.rackName,
        rack_panjang: data.rackPanjang,
        rack_lebar: data.rackLebar,
        rack_tinggi: data.rackTinggi,
        rack_luas: data.rackLuas,
        location_id: data.locationId,
      }
    })
    invalidateLocationsCache()
    res.status(201).json({ device })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
  }
})

// PUT /api/devices/:id
router.put('/:id', async (req, res) => {
  try {
    const data = deviceSchema.partial().parse(req.body)
    const updateData = {
      device_code: data.deviceCode,
      device_name: data.deviceName,
      device_type: data.deviceType,
      brand: data.brand,
      model: data.model,
      serial_number: data.serialNumber,
      label_code: data.labelCode,
      kapasitas: data.kapasitas,
      satuan_kapasitas: data.satuanKapasitas,
      year: data.year,
      usia_perangkat: data.usiaPerangkat,
      status: data.status,
      condition: data.condition,
      cap_real: data.capReal,
      jenis_tegangan: data.jenisTegangan,
      beban_arus: data.bebanArus,
      satuan_beban: data.satuanBeban,
      keterangan: data.keterangan,
      ruangan_code: data.ruanganCode,
      ruangan_name: data.ruanganName,
      ruangan_panjang: data.ruanganPanjang,
      ruangan_lebar: data.ruanganLebar,
      ruangan_tinggi: data.ruanganTinggi,
      ruangan_luas: data.ruanganLuas,
      rack_code: data.rackCode,
      rack_name: data.rackName,
      rack_panjang: data.rackPanjang,
      rack_lebar: data.rackLebar,
      rack_tinggi: data.rackTinggi,
      rack_luas: data.rackLuas,
      location_id: data.locationId,
    }
    const device = await prisma.devices.update({
      where: { id: req.params.id },
      data: updateData,
    })
    invalidateLocationsCache()
    res.json({ device })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues })
    }
    throw error
  }
})

// DELETE /api/devices/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.devices.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() },
    })
    invalidateLocationsCache()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting device:', error)
    throw error
  }
})

// POST /api/devices/bulk-delete
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body
    await prisma.devices.updateMany({
      where: { id: { in: ids } },
      data: { deleted_at: new Date() },
    })
    invalidateLocationsCache()
    res.json({ success: true, count: ids.length })
  } catch (error) {
    console.error('Error bulk deleting devices:', error)
    throw error
  }
})

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
})

// POST /api/devices/import/preview
router.post('/import/preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' })
    }

    const { mode = 'upsert' } = req.body
    if (!['upsert', 'replace'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be upsert or replace' })
    }

    // Validate file
    const validation = validateFile(req.file.buffer, req.file.originalname)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Parse file
    const parseResult = await parseFile(req.file.buffer, validation.mimeType, req.file.originalname, req.body.importType || 'default')
    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return res.status(400).json({ errors: parseResult.errors })
    }

    // Generate preview
    const preview = await generateImportPreview(parseResult.data, mode as 'upsert' | 'replace', req.body.importType || 'default', prisma)

    res.json(preview)
  } catch (error) {
    console.error('Import preview error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses file' })
  }
})

// POST /api/devices/import
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' })
    }

    const { mode = 'upsert' } = req.body
    if (!['upsert', 'replace'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be upsert or replace' })
    }

    // Validate file
    const validation = validateFile(req.file.buffer, req.file.originalname)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Parse file
    const parseResult = await parseFile(req.file.buffer, validation.mimeType, req.file.originalname, req.body.importType || 'default')
    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return res.status(400).json({ errors: parseResult.errors })
    }

    // Execute import with transaction
    const result = await prisma.$transaction(async (tx) => {
      return await executeImport(parseResult.data, mode as 'upsert' | 'replace', req.body.importType || 'default', tx as any)
    }, {
      maxWait: 10000,
      timeout: 120000,
    })

    invalidateLocationsCache()
    res.json(result)
  } catch (error: any) {
    console.error('Import error:', error)
    try {
      fs.appendFileSync('debug.log', '\n[IMPORT ERROR] ' + (error?.stack || error?.message || String(error)) + '\n')
    } catch(e) {}
    res.status(500).json({ error: 'Terjadi kesalahan saat mengimpor data', details: error?.message || String(error) })
  }
})

// GET /api/devices/import/template
router.get('/import/template', async (req, res) => {
  try {
    const XLSX = await import('xlsx')

    // Create template data
    const templateData = [{
      area: 'AREA SUMBAGSEL',
      region: 'REGIONAL SUMBAGSEL',
      district: 'PALEMBANG',
      cluster: 'CLUSTER PALEMBANG',
      sites_name: 'Nama Site',
      sites_code: 'PGC',
      code: 'DEVICE001',
      name: 'Nama Device',
      jenis: 'GENSET',
      tahun_operasi: 2020,
      label_code: 'SN12345',
      merk: 'CAT',
      status: 'AKTIF',
      kondisi: 'BAIK',
      kapasitas: '100',
      satuan_kapasitas: 'KVA',
      jenis_tegangan: '380V',
      ruangan_name: 'Ruang Genset',
      latitude: -3.5667,
      longitude: 102.9833,
      class_type: 'BASIC',
      address: 'Alamat Site',
      teknisi: 'Nama Teknisi',
    }]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=device_import_template.xlsx')
    res.send(buffer)
  } catch (error) {
    console.error('Template generation error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat template' })
  }
})

export default router
