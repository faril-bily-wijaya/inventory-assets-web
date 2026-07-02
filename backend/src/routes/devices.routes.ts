import { Router } from 'express'
import { z } from 'zod'
import multer from 'multer'
import { prisma } from '../index.js'
import { authMiddleware } from '../middleware/auth.js'
import { validateFile } from '../utils/fileValidator.js'
import { parseFile } from '../utils/fileParser.js'
import { generateImportPreview, executeImport } from '../services/importService.js'

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

    const where: any = { deleted_at: null }

    if (search) {
      where.OR = [
        { device_code: { contains: search as string, mode: 'insensitive' } },
        { device_name: { contains: search as string, mode: 'insensitive' } },
        { serial_number: { contains: search as string, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (deviceType) where.device_type = deviceType
    if (locationId) where.location_id = locationId

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

    res.json({
      devices,
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

    const byTypeMap: Record<string, number> = {}
    byType.forEach(item => {
      byTypeMap[item.device_type] = item._count.device_type
    })

    res.json({
      total,
      byStatus: byStatusMap,
      byType: byTypeMap,
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
    res.json({ device })
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
        kapasitas: data.kapasitas,
        year: data.year,
        room: data.room,
        status: data.status,
        condition: data.condition,
        cap_real: data.capReal,
        location_id: data.locationId,
      }
    })
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
    const device = await prisma.devices.update({
      where: { id: req.params.id },
      data,
    })
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
    res.json({ success: true, count: ids.length })
  } catch (error) {
    console.error('Error bulk deleting devices:', error)
    throw error
  }
})

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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
    const parseResult = await parseFile(req.file.buffer, validation.mimeType, req.file.originalname)
    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return res.status(400).json({ errors: parseResult.errors })
    }

    // Generate preview
    const preview = await generateImportPreview(parseResult.data, mode as 'upsert' | 'replace', prisma)

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
    const parseResult = await parseFile(req.file.buffer, validation.mimeType, req.file.originalname)
    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return res.status(400).json({ errors: parseResult.errors })
    }

    // Execute import with transaction
    const result = await prisma.$transaction(async (tx) => {
      return await executeImport(parseResult.data, mode as 'upsert' | 'replace', tx as any)
    }, {
      isolationLevel: 'Serializable',
      timeout: 60000,
    })

    res.json(result)
  } catch (error) {
    console.error('Import error:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat mengimpor data' })
  }
})

// GET /api/devices/import/template
router.get('/import/template', async (req, res) => {
  try {
    const XLSX = await import('xlsx')

    // Create template data
    const templateData = [{
      code: 'DEVICE001',
      name: 'Nama Device',
      sites_name: 'Nama Site',
      jenis: 'GENSET',
      tahun_operasi: 2020,
      label_code: 'SN12345',
      merk: 'CAT',
      status: 'AKTIF',
      kondisi: 'BAIK',
      kapasitas: '100 kVA',
      jenis_tegangan: '380V',
      ruangan_name: 'Ruang Genset',
      latitude: -2.5,
      longitude: 112.0,
      class_type: 'CLASS A',
      address: 'Alamat Site',
      region: 'REGIONAL SUMBAGSEL',
      district: 'PALEMBANG',
      organization_name: 'Cluster Palembang',
      cluster: '',
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
