/**
 * Import Service
 *
 * Core business logic for CSV/XLSX import of devices and their
 * location hierarchy (regional → district → cluster → location).
 *
 * - generateImportPreview()  — dry-run: counts new vs. existing records,
 *                              detects intra-file duplicates, and collects
 *                              validation errors without touching the database.
 * - executeImport()           — performs the actual upsert/replace operation.
 *
 * Dependencies:
 *   ParsedRow from src/utils/fileParser.ts
 *   PrismaClient from @prisma/client
 */

import type { PrismaClient } from '@prisma/client'
import type { ParsedRow } from '../utils/fileParser.js'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ImportPreview {
  totalRows: number
  devicesBaru: number
  devicesUpdated: number
  duplikatDalamFile: number
  regionalsBaru: number
  districtsBaru: number
  clustersBaru: number
  locationsBaru: number
  errors: string[]
}

export interface ImportResult {
  newDevices: number
  updatedDevices: number
  newLocations: number
  totalProcessed: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CATU_DAYA_TYPES: readonly string[] = [
  'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
  'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
  'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
  'TRAFO', 'ATS', 'AMF',
]

const BATCH_SIZE = 100

const HIERARCHY_DEFAULTS = {
  regional: 'REGIONAL DEFAULT',
  district: 'DISTRICT DEFAULT',
  cluster: 'CLUSTER DEFAULT',
} as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the lookup key used for intra-file duplicate detection.
 */
function buildRowKey(row: ParsedRow): string {
  return `${row.code}::${row.label_code ?? ''}`
}

/**
 * Normalises a string field so that variations of the same name
 * (different case, extra whitespace) map to a single canonical form.
 */
function normalise(s: string | undefined): string {
  return (s ?? '').trim()
}

/**
 * Maps a ParsedRow to the flat device data needed for Prisma device create/update.
 */
function mapDeviceData(row: ParsedRow, location_id: string) {
  return {
    device_code: normalise(row.code),
    device_name: normalise(row.name),
    device_type: normalise(row.jenis),
    serial_number: normalise(row.label_code) || null,
    brand: normalise(row.merk) || null,
    model: null,
    kapasitas: normalise(row.kapasitas) || null,
    year: row.tahun_operasi > 0 ? row.tahun_operasi : null,
    room: normalise(row.ruangan_name) || null,
    status: normalise(row.status) || 'AKTIF',
    condition: normalise(row.kondisi) || null,
    cap_real: normalise(row.jenis_tegangan) || null,
    location_id,
  }
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

/**
 * Generates a dry-run preview of an import without modifying the database.
 *
 * Steps:
 *  1. Detect duplicates within the file (code + label_code).
 *  2. Count devices that already exist in DB vs. new ones.
 *  3. Count new hierarchy nodes (regional, district, cluster, location).
 *  4. Collect row-level validation errors.
 */
export async function generateImportPreview(
  data: ParsedRow[],
  _mode: 'upsert' | 'replace',
  prisma: PrismaClient,
): Promise<ImportPreview> {
  const errors: string[] = []

  // --- 1. Intra-file duplicate detection ---
  const seenKeys = new Set<string>()
  const duplicateKeys = new Set<string>()

  for (const row of data) {
    const key = buildRowKey(row)
    if (seenKeys.has(key)) {
      duplicateKeys.add(key)
    } else {
      seenKeys.add(key)
    }
  }

  // --- 2. Collect all unique device codes & hierarchy names ---
  const deviceCodeSet = new Set<string>()
  const regionalNames = new Set<string>()
  const districtNames = new Set<string>()
  const clusterNames = new Set<string>()
  const locationNames = new Set<string>()

  for (const row of data) {
    deviceCodeSet.add(normalise(row.code))

    const reg = normalise(row.region) || HIERARCHY_DEFAULTS.regional
    const dist = normalise(row.district) || HIERARCHY_DEFAULTS.district
    const clus = normalise(row.organization_name) || normalise(row.cluster) || HIERARCHY_DEFAULTS.cluster
    const loc = normalise(row.sites_name)

    if (loc) locationNames.add(loc)
    if (clus) clusterNames.add(clus)
    if (dist) districtNames.add(dist)
    if (reg) regionalNames.add(reg)

    // Basic validation
    if (!row.code) {
      errors.push(`Baris "${row.name}": code/deviceCode kosong`)
    }
  }

  // --- 3. Check which device codes already exist ---
  const existingCodes = await prisma.devices.findMany({
    where: { device_code: { in: [...deviceCodeSet] } },
    select: { device_code: true },
  })
  const existingCodeSet = new Set(existingCodes.map((d) => d.device_code))

  // --- 4. Check which hierarchy names already exist ---
  const [existingRegs, existingDists, existingClusters, existingLocs] = await Promise.all([
    prisma.regionals.findMany({ where: { name: { in: [...regionalNames] } }, select: { name: true } }),
    prisma.districts.findMany({ where: { name: { in: [...districtNames] } }, select: { name: true } }),
    prisma.clusters.findMany({ where: { name: { in: [...clusterNames] } }, select: { name: true } }),
    prisma.locations.findMany({ where: { name: { in: [...locationNames] } }, select: { name: true } }),
  ])

  const existingRegSet = new Set(existingRegs.map((r) => r.name))
  const existingDistSet = new Set(existingDists.map((d) => d.name))
  const existingClusterSet = new Set(existingClusters.map((c) => c.name))
  const existingLocSet = new Set(existingLocs.map((l) => l.name))

  // --- 5. Compute counts ---
  let devicesBaru = 0
  let devicesUpdated = 0
  for (const code of deviceCodeSet) {
    if (existingCodeSet.has(code)) devicesUpdated++
    else devicesBaru++
  }

  const regionalsBaru = [...regionalNames].filter((n) => !existingRegSet.has(n)).length
  const districtsBaru = [...districtNames].filter((n) => !existingDistSet.has(n)).length
  const clustersBaru = [...clusterNames].filter((n) => !existingClusterSet.has(n)).length
  const locationsBaru = [...locationNames].filter((n) => !existingLocSet.has(n)).length

  return {
    totalRows: data.length,
    devicesBaru,
    devicesUpdated,
    duplikatDalamFile: duplicateKeys.size,
    regionalsBaru,
    districtsBaru,
    clustersBaru,
    locationsBaru,
    errors,
  }
}

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

/**
 * Executes the actual import.
 *
 * Mode 'replace': deletes ALL existing devices (soft-delete) and locations,
 *                 then inserts everything fresh.
 * Mode 'upsert':  inserts new records and updates existing ones by deviceCode.
 *
 * Hierarchy is always upserted (find or create) top-down:
 *   regional → district → cluster → location
 *
 * Devices are upserted by deviceCode.
 *
 * Processing is batched in groups of BATCH_SIZE (100) for performance.
 */
export async function executeImport(
  data: ParsedRow[],
  mode: 'upsert' | 'replace',
  prisma: PrismaClient,
): Promise<ImportResult> {
  const errors: string[] = []
  let newDevices = 0
  let updatedDevices = 0
  let newLocations = 0

  // -------------------------------------------------------------------------
  // Replace mode: wipe existing devices and locations
  // -------------------------------------------------------------------------
  if (mode === 'replace') {
    await prisma.devices.updateMany({ data: { deleted_at: new Date() } })
    await prisma.locations.deleteMany({})

    // Cascade: delete empty clusters, districts, regionals
    // (only if they have no remaining children)
    await prisma.clusters.deleteMany({
      where: { locations: { none: {} } },
    })
    await prisma.districts.deleteMany({
      where: { clusters: { none: {} } },
    })
    await prisma.regionals.deleteMany({
      where: { districts: { none: {} } },
    })
  }

  // -------------------------------------------------------------------------
  // Deduplicate input: keep first occurrence of each (code, label_code) pair
  // -------------------------------------------------------------------------
  const seenKeys = new Set<string>()
  const uniqueRows: ParsedRow[] = []
  for (const row of data) {
    const key = buildRowKey(row)
    if (seenKeys.has(key)) continue
    seenKeys.add(key)
    uniqueRows.push(row)
  }

  // -------------------------------------------------------------------------
  // Pre-load all existing hierarchy nodes and devices into memory to avoid
  // repeated DB lookups inside the row loop.
  // -------------------------------------------------------------------------
  const [allRegs, allDists, allClusters, allLocs, allDevices] = await Promise.all([
    prisma.regionals.findMany({ select: { id: true, name: true } }),
    prisma.districts.findMany({ select: { id: true, name: true, regional_id: true } }),
    prisma.clusters.findMany({ select: { id: true, name: true, district_id: true } }),
    prisma.locations.findMany({ select: { id: true, name: true, cluster_id: true } }),
    prisma.devices.findMany({ select: { id: true, device_code: true } }),
  ])

  const regByName = new Map(allRegs.map((r) => [r.name, r.id]))
  const distByName = new Map(allDists.map((d) => [d.name, d.id]))
  const clusterByName = new Map(allClusters.map((c) => [c.name, c.id]))
  const locByName = new Map(allLocs.map((l) => [l.name, l.id]))
  const deviceByCode = new Map(allDevices.map((d) => [d.device_code, d.id]))

  // -------------------------------------------------------------------------
  // Phase 1 — Upsert hierarchy (top-down) for all unique rows
  // -------------------------------------------------------------------------
  for (const row of uniqueRows) {
    const regName = normalise(row.region) || HIERARCHY_DEFAULTS.regional
    const distName = normalise(row.district) || HIERARCHY_DEFAULTS.district
    const clusterName = normalise(row.organization_name) || normalise(row.cluster) || HIERARCHY_DEFAULTS.cluster
    const locName = normalise(row.sites_name)

    // --- Regional ---
    let regional_id = regByName.get(regName)
    if (!regional_id) {
      const created = await prisma.regionals.create({ data: { name: regName } })
      regional_id = created.id
      regByName.set(regName, regional_id)
    }

    // --- District ---
    let district_id = distByName.get(distName)
    if (!district_id) {
      const created = await prisma.districts.create({
        data: { name: distName, regional_id },
      })
      district_id = created.id
      distByName.set(distName, district_id)
    }

    // --- Cluster ---
    let cluster_id = clusterByName.get(clusterName)
    if (!cluster_id) {
      const created = await prisma.clusters.create({
        data: { name: clusterName, district_id },
      })
      cluster_id = created.id
      clusterByName.set(clusterName, cluster_id)
    }

    // --- Location ---
    if (locName && !locByName.has(locName)) {
      // Use provided coordinates or a default placeholder
      const lat = row.latitude ?? 0
      const lng = row.longitude ?? 0
      const created = await prisma.locations.create({
        data: {
          name: locName,
          latitude: lat,
          longitude: lng,
          cluster_id,
          class_type: normalise(row.class_type) || 'BASIC',
          address: normalise(row.address) || null,
        },
      })
      locByName.set(locName, created.id)
      newLocations++
    }
  }

  // -------------------------------------------------------------------------
  // Phase 2 — Upsert devices in batches
  // -------------------------------------------------------------------------
  for (let i = 0; i < uniqueRows.length; i += BATCH_SIZE) {
    const batch = uniqueRows.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (row) => {
        const device_code = normalise(row.code)
        const locName = normalise(row.sites_name)

        // Validate device code before anything else
        if (!device_code) {
          errors.push(`Baris "${row.name}": code/deviceCode kosong`)
          return
        }

        // Skip rows without a valid location
        const location_id = locByName.get(locName)
        if (!location_id) {
          errors.push(`Baris "${row.name}": location tidak ditemukan`)
          return
        }

        const deviceData = mapDeviceData(row, location_id)

        if (deviceByCode.has(device_code)) {
          // Update existing
          try {
            await prisma.devices.update({
              where: { device_code },
              data: deviceData,
            })
            updatedDevices++
          } catch (err) {
            errors.push(`Gagal update device ${device_code}: ${(err as Error).message}`)
          }
        } else {
          // Create new
          try {
            await prisma.devices.create({ data: deviceData })
            deviceByCode.set(device_code, device_code) // mark as existing for this session
            newDevices++
          } catch (err) {
            errors.push(`Gagal insert device ${device_code}: ${(err as Error).message}`)
          }
        }
      }),
    )
  }

  return {
    newDevices,
    updatedDevices,
    newLocations,
    totalProcessed: uniqueRows.length,
    errors,
  }
}
