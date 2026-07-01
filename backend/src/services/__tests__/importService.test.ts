import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateImportPreview, executeImport, CATU_DAYA_TYPES } from '../importService.js'
import type { ParsedRow } from '../../utils/fileParser.js'
import type { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Mock PrismaClient (minimal subset used by importService)
// ---------------------------------------------------------------------------

function createMockPrisma(overrides?: Partial<MockPrismaState>): any {
  // Spread overrides first, then normalize all objects to camelCase to match Prisma output
  const raw = {
    devices: [],
    regionals: [],
    districts: [],
    clusters: [],
    locations: [],
    ...overrides,
  }

  function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      const camelK = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      result[camelK] = v
    }
    return result
  }

  const state: MockPrismaState = {
    devices: raw.devices.map((d, i) => toCamelCase({ id: `mock-id-${i}`, ...d })),
    regionals: raw.regionals.map((r, i) => toCamelCase({ id: `reg-${i}`, ...r })),
    districts: raw.districts.map((d, i) => toCamelCase({ id: `dist-${i}`, ...d })),
    clusters: raw.clusters.map((c, i) => toCamelCase({ id: `clus-${i}`, ...c })),
    locations: raw.locations.map((l, i) => toCamelCase({ id: `loc-${i}`, ...l })),
  }

  const mockPrisma: any = {
    device: {
      findMany: vi.fn(async (args: any) => {
        const { where, select } = args ?? {}
        // Determine which devices to return based on the where clause
        let result = state.devices
        if (where !== undefined && Object.keys(where).length > 0) {
          if (where?.deviceCode?.in) {
            result = state.devices.filter((d) => where.deviceCode.in.includes(d.deviceCode))
          }
        }
        // Apply select projection if present (mimics real Prisma behaviour)
        if (select) {
          result = result.map((d) => {
            const projected: Record<string, unknown> = {}
            for (const key of Object.keys(select)) {
              if (key in d) projected[key] = (d as any)[key]
            }
            return projected
          })
        }
        return result
      }),
      updateMany: vi.fn(async () => ({ count: state.devices.length })),
      create: vi.fn(async ({ data }: any) => {
        const newDevice = { id: `dev-${state.devices.length + 1}`, ...data }
        state.devices.push(newDevice)
        return newDevice
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = state.devices.findIndex((d) => d.deviceCode === where.deviceCode)
        if (idx >= 0) {
          state.devices[idx] = { ...state.devices[idx], ...data }
          return state.devices[idx]
        }
        throw new Error('Not found')
      }),
    },
    regional: {
      findMany: vi.fn(async (args: any) => {
        const { where, select } = args ?? {}
        let result = state.regionals
        if (where?.name?.in) result = state.regionals.filter((r) => where.name.in.includes(r.name as string))
        if (select) result = result.map((r) => { const p: Record<string, unknown> = {}; for (const k of Object.keys(select)) { if (k in r) p[k] = (r as any)[k] }; return p })
        return result
      }),
      create: vi.fn(async ({ data }: any) => {
        const newReg = { id: `reg-${state.regionals.length + 1}`, ...data }
        state.regionals.push(newReg)
        return newReg
      }),
      deleteMany: vi.fn(),
    },
    district: {
      findMany: vi.fn(async (args: any) => {
        const { where, select } = args ?? {}
        let result = state.districts
        if (where?.name?.in) result = state.districts.filter((d) => where.name.in.includes(d.name as string))
        if (select) result = result.map((d) => { const p: Record<string, unknown> = {}; for (const k of Object.keys(select)) { if (k in d) p[k] = (d as any)[k] }; return p })
        return result
      }),
      create: vi.fn(async ({ data }: any) => {
        const newDist = { id: `dist-${state.districts.length + 1}`, ...data }
        state.districts.push(newDist)
        return newDist
      }),
      deleteMany: vi.fn(),
    },
    cluster: {
      findMany: vi.fn(async (args: any) => {
        const { where, select } = args ?? {}
        let result = state.clusters
        if (where?.name?.in) result = state.clusters.filter((c) => where.name.in.includes(c.name as string))
        if (select) result = result.map((c) => { const p: Record<string, unknown> = {}; for (const k of Object.keys(select)) { if (k in c) p[k] = (c as any)[k] }; return p })
        return result
      }),
      create: vi.fn(async ({ data }: any) => {
        const newCluster = { id: `clus-${state.clusters.length + 1}`, ...data }
        state.clusters.push(newCluster)
        return newCluster
      }),
      deleteMany: vi.fn(),
    },
    location: {
      findMany: vi.fn(async (args: any) => {
        const { where, select } = args ?? {}
        let result = state.locations
        if (where?.name?.in) result = state.locations.filter((l) => where.name.in.includes(l.name as string))
        if (select) result = result.map((l) => { const p: Record<string, unknown> = {}; for (const k of Object.keys(select)) { if (k in l) p[k] = (l as any)[k] }; return p })
        return result
      }),
      create: vi.fn(async ({ data }: any) => {
        const newLoc = { id: `loc-${state.locations.length + 1}`, ...data }
        state.locations.push(newLoc)
        return newLoc
      }),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn(mockPrisma)),
  }

  return { mockPrisma, state }
}

interface MockPrismaState {
  devices: Record<string, any>[]
  regionals: Record<string, any>[]
  districts: Record<string, any>[]
  clusters: Record<string, any>[]
  locations: Record<string, any>[]
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeRow(overrides: Partial<ParsedRow> = {}): ParsedRow {
  return {
    code: 'CODE001',
    name: 'Engine Alpha',
    sites_name: 'Site A',
    jenis: 'Genset',
    tahun_operasi: 2020,
    label_code: 'LBL001',
    merk: 'CAT',
    status: 'AKTIF',
    kondisi: 'BAIK',
    kapasitas: '100 kVA',
    jenis_tegangan: '380V',
    ruangan_name: 'Ruang Genset',
    latitude: -2.5,
    longitude: 112.0,
    region: 'REGIONAL SUMBAGSEL',
    district: 'PALEMBANG',
    organization_name: 'Cluster Palembang',
    cluster: undefined,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests — CATU_DAYA_TYPES
// ---------------------------------------------------------------------------

describe('CATU_DAYA_TYPES', () => {
  it('should contain known catu daya types', () => {
    expect(CATU_DAYA_TYPES).toContain('GENSET')
    expect(CATU_DAYA_TYPES).toContain('UPS')
    expect(CATU_DAYA_TYPES).toContain('RECTIFIER')
    expect(CATU_DAYA_TYPES).toContain('INVERTER')
    expect(CATU_DAYA_TYPES).toContain('BATSTARTER')
  })

  it('should be a readonly array', () => {
    expect(Array.isArray(CATU_DAYA_TYPES)).toBe(true)
    // @ts-expect-error — intentional: should be readonly
    CATU_DAYA_TYPES.push('NEW_TYPE') // should not compile if typed correctly
  })
})

// ---------------------------------------------------------------------------
// Tests — generateImportPreview
// ---------------------------------------------------------------------------

describe('generateImportPreview', () => {
  it('should count duplicate rows within the file', async () => {
    const { mockPrisma } = createMockPrisma()

    const data = [
      makeRow({ code: 'CODE001', label_code: 'LBL001' }),
      makeRow({ code: 'CODE001', label_code: 'LBL001' }), // duplicate
      makeRow({ code: 'CODE002', label_code: 'LBL002' }),
    ]

    const preview = await generateImportPreview(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(preview.totalRows).toBe(3)
    expect(preview.duplikatDalamFile).toBe(1)
  })

  it('should count devices as baru when not in DB', async () => {
    const { mockPrisma } = createMockPrisma({ devices: [] })

    const data = [
      makeRow({ code: 'NEW001' }),
      makeRow({ code: 'NEW002' }),
    ]

    const preview = await generateImportPreview(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(preview.devicesBaru).toBe(2)
    expect(preview.devicesUpdated).toBe(0)
  })

  it('should count devices as updated when they exist in DB', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [{ deviceCode: 'CODE001' }],
    })

    const data = [makeRow({ code: 'CODE001' })]

    const preview = await generateImportPreview(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(preview.devicesUpdated).toBe(1)
    expect(preview.devicesBaru).toBe(0)
  })

  it('should count new hierarchy nodes', async () => {
    const { mockPrisma } = createMockPrisma({
      regionals: [{ name: 'REGIONAL SUMBAGSEL' }],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [
      makeRow({ region: 'REGIONAL SUMBAGSEL', district: 'PALEMBANG', organization_name: 'Cluster A', sites_name: 'Site A' }),
      makeRow({ region: 'REGIONAL BARU', district: 'JAMBI', organization_name: 'Cluster B', sites_name: 'Site B' }),
    ]

    const preview = await generateImportPreview(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(preview.regionalsBaru).toBe(1)  // REGIONAL BARU is new
    expect(preview.districtsBaru).toBe(2)  // PALEMBANG + JAMBI are new
    expect(preview.clustersBaru).toBe(2)  // Cluster A + Cluster B
    expect(preview.locationsBaru).toBe(2) // Site A + Site B
  })

  it('should use default hierarchy names when region/district/cluster are empty', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [],
      regionals: [{ name: 'REGIONAL DEFAULT' }],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [
      makeRow({ region: undefined, district: undefined, organization_name: undefined }),
    ]

    const preview = await generateImportPreview(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(preview.regionalsBaru).toBe(0)  // REGIONAL DEFAULT already exists
    expect(preview.districtsBaru).toBe(1)   // DISTRICT DEFAULT is new
    expect(preview.clustersBaru).toBe(1)   // CLUSTER DEFAULT is new
  })

  it('should report errors for rows with empty code', async () => {
    const { mockPrisma } = createMockPrisma({ devices: [] })

    const data = [
      makeRow({ code: '' }),
    ]

    const preview = await generateImportPreview(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(preview.errors).toContain('Baris "Engine Alpha": code/deviceCode kosong')
  })

  it('should handle empty data array', async () => {
    const { mockPrisma } = createMockPrisma()

    const preview = await generateImportPreview([], 'upsert', mockPrisma as unknown as PrismaClient)

    expect(preview.totalRows).toBe(0)
    expect(preview.devicesBaru).toBe(0)
    expect(preview.devicesUpdated).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Tests — executeImport
// ---------------------------------------------------------------------------

describe('executeImport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create new devices and hierarchy in upsert mode', async () => {
    const { mockPrisma, state } = createMockPrisma({
      devices: [],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [
      makeRow({ code: 'CODE001', region: 'REG SUMBAGSEL', district: 'PALEMBANG', organization_name: 'Cluster P', sites_name: 'Site 1' }),
    ]

    const result = await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(result.totalProcessed).toBe(1)
    expect(result.newDevices).toBe(1)
    expect(result.updatedDevices).toBe(0)
    expect(result.newLocations).toBe(1)

    // Verify hierarchy was created
    expect(mockPrisma.regional.create).toHaveBeenCalled()
    expect(mockPrisma.district.create).toHaveBeenCalled()
    expect(mockPrisma.cluster.create).toHaveBeenCalled()
    expect(mockPrisma.location.create).toHaveBeenCalled()
    expect(mockPrisma.device.create).toHaveBeenCalled()

    // Verify state
    expect(state.regionals).toHaveLength(1)
    expect(state.districts).toHaveLength(1)
    expect(state.clusters).toHaveLength(1)
    expect(state.locations).toHaveLength(1)
    expect(state.devices).toHaveLength(1)
  })

  it('should update existing devices in upsert mode', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [{ deviceCode: 'CODE001' }],
      regionals: [{ name: 'REG SUMBAGSEL' }],
      districts: [{ name: 'PALEMBANG' }],
      clusters: [{ name: 'Cluster P' }],
      locations: [{ name: 'Site 1' }],
    })

    const data = [
      makeRow({ code: 'CODE001', region: 'REG SUMBAGSEL', district: 'PALEMBANG', organization_name: 'Cluster P', sites_name: 'Site 1' }),
    ]

    const result = await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(result.totalProcessed).toBe(1)
    expect(result.newDevices).toBe(0)
    expect(result.updatedDevices).toBe(1)
    expect(mockPrisma.device.update).toHaveBeenCalled()
  })

  it('should replace all devices and locations in replace mode', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [{ deviceCode: 'OLD001' }, { deviceCode: 'OLD002' }],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [{ name: 'Old Site' }],
    })

    const data = [
      makeRow({ code: 'NEW001', region: 'REG SUMBAGSEL', district: 'PALEMBANG', organization_name: 'Cluster P', sites_name: 'New Site' }),
    ]

    const result = await executeImport(data, 'replace', mockPrisma as unknown as PrismaClient)

    expect(result.totalProcessed).toBe(1)
    expect(mockPrisma.device.updateMany).toHaveBeenCalled() // soft-delete
    expect(mockPrisma.location.deleteMany).toHaveBeenCalled()
  })

  it('should skip duplicate rows within the same file', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [
      makeRow({ code: 'CODE001', label_code: 'LBL001' }),
      makeRow({ code: 'CODE001', label_code: 'LBL001' }), // duplicate
      makeRow({ code: 'CODE001', label_code: 'LBL001' }), // duplicate
    ]

    const result = await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(result.totalProcessed).toBe(1) // only one unique row
    expect(result.newDevices).toBe(1)
    // device.create should be called exactly once
    expect(mockPrisma.device.create).toHaveBeenCalledTimes(1)
  })

  it('should map ParsedRow fields correctly to device data', async () => {
    const { mockPrisma, state } = createMockPrisma({
      devices: [],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [
      makeRow({
        code: 'DEV001',
        name: 'Genset Utama',
        jenis: 'GENSET',
        tahun_operasi: 2019,
        label_code: 'SN12345',
        merk: 'Caterpillar',
        status: 'AKTIF',
        kondisi: 'BAIK',
        kapasitas: '500 kVA',
        jenis_tegangan: '380V',
        ruangan_name: 'Ruang Genset A',
      }),
    ]

    await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    // Check the device was created with correct data
    const createdDevice = state.devices[0]
    expect(createdDevice.deviceCode).toBe('DEV001')
    expect(createdDevice.deviceName).toBe('Genset Utama')
    expect(createdDevice.deviceType).toBe('GENSET')
    expect(createdDevice.serialNumber).toBe('SN12345')
    expect(createdDevice.brand).toBe('Caterpillar')
    expect(createdDevice.year).toBe(2019)
    expect(createdDevice.status).toBe('AKTIF')
    expect(createdDevice.condition).toBe('BAIK')
    expect(createdDevice.kapasitas).toBe('500 kVA')
    expect(createdDevice.capReal).toBe('380V')
    expect(createdDevice.room).toBe('Ruang Genset A')
  })

  it('should use default coordinates (0, 0) when lat/lng not provided', async () => {
    const { mockPrisma, state } = createMockPrisma({
      devices: [],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [
      makeRow({ latitude: undefined, longitude: undefined }),
    ]

    await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    const createdLoc = state.locations[0]
    expect(createdLoc.latitude).toBe(0)
    expect(createdLoc.longitude).toBe(0)
  })

  it('should report error when row has no code', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [makeRow({ code: '' })]

    const result = await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(result.errors.some((e) => e.includes('code/deviceCode kosong'))).toBe(true)
  })

  it('should handle mixed existing and new devices', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [{ deviceCode: 'CODE001' }],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [],
    })

    const data = [
      makeRow({ code: 'CODE001' }),
      makeRow({ code: 'CODE002' }),
      makeRow({ code: 'CODE003' }),
    ]

    const result = await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    expect(result.totalProcessed).toBe(3)
    expect(result.newDevices).toBe(2)   // CODE002 + CODE003
    expect(result.updatedDevices).toBe(1) // CODE001
  })

  it('should process in batches of 100', async () => {
    const { mockPrisma } = createMockPrisma({
      devices: [],
      regionals: [],
      districts: [],
      clusters: [],
      locations: [],
    })

    // Generate 105 rows — should require 2 batches
    const data = Array.from({ length: 105 }, (_, i) =>
      makeRow({ code: `CODE${String(i).padStart(3, '0')}` }),
    )

    await executeImport(data, 'upsert', mockPrisma as unknown as PrismaClient)

    // All 105 devices should be created
    expect(mockPrisma.device.create).toHaveBeenCalledTimes(105)
  })
})
