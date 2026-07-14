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
  areasBaru: number
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
  area: 'AREA DEFAULT',
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
  return normalise(row.device_code)
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
    device_code: normalise(row.device_code),
    device_name: normalise(row.device_name),
    device_type: normalise(row.device_type),
    serial_number: normalise(row.serial_number) || normalise(row.label_code) || null,
    label_code: normalise(row.label_code) || null,
    brand: normalise(row.brand) || null,
    model: normalise(row.model) || null,
    kapasitas: normalise(row.kapasitas) || null,
    satuan_kapasitas: normalise(row.satuan_kapasitas) || null,
    year: row.year > 0 ? row.year : null,
    usia_perangkat: row.usia_perangkat ?? null,
    status: normalise(row.status) || 'AKTIF',
    condition: normalise(row.condition) || null,
    cap_real: normalise(row.cap_real) || null,
    jenis_tegangan: normalise(row.jenis_tegangan) || null,
    beban_arus: typeof row.beban_arus === 'number' ? row.beban_arus : null,
    satuan_beban: normalise(row.satuan_beban) || null,
    keterangan: normalise(row.keterangan) || null,
    ruangan_code: normalise(row.ruangan_code) || null,
    ruangan_name: normalise(row.ruangan_name) || null,
    ruangan_panjang: row.ruangan_panjang ?? null,
    ruangan_lebar: row.ruangan_lebar ?? null,
    ruangan_tinggi: row.ruangan_tinggi ?? null,
    ruangan_luas: row.ruangan_luas ?? null,
    rack_code: normalise(row.rack_code) || null,
    rack_name: normalise(row.rack_name) || null,
    rack_panjang: row.rack_panjang ?? null,
    rack_lebar: row.rack_lebar ?? null,
    rack_tinggi: row.rack_tinggi ?? null,
    rack_luas: row.rack_luas ?? null,
    uuid: normalise(row.uuid) || null,
    organization_name: normalise(row.organization_name) || null,
    organization_uuid: normalise(row.organization_uuid) || null,
    organization_sname: normalise(row.organization_sname) || null,
    location_id,
    deleted_at: null,
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
  importType: string,
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
  const areaNames = new Set<string>()
  const regionalNames = new Set<string>()
  const districtNames = new Set<string>()
  const clusterNames = new Set<string>()
  const locationNames = new Set<string>()

  for (const row of data) {
    deviceCodeSet.add(normalise(row.device_code))

    const ar = normalise(row.area) || HIERARCHY_DEFAULTS.area
    const reg = normalise(row.regional) || HIERARCHY_DEFAULTS.regional
    const dist = normalise(row.district) || HIERARCHY_DEFAULTS.district
    const clus = normalise(row.cluster) || normalise(row.organization_name) || HIERARCHY_DEFAULTS.cluster
    const loc = normalise(row.site_name)

    if (loc) locationNames.add(loc)
    if (clus) clusterNames.add(clus)
    if (dist) districtNames.add(dist)
    if (reg) regionalNames.add(reg)
    if (ar) areaNames.add(ar)

    // Basic validation
    if (!row.device_code) {
      errors.push(`Baris "${row.device_name}": code/deviceCode kosong`)
    }
  }

  // --- 3. Check which device codes already exist ---
  const existingCodes = await prisma.devices.findMany({
    where: { device_code: { in: [...deviceCodeSet] } },
    select: { device_code: true },
  })
  const existingCodeSet = new Set(existingCodes.map((d) => d.device_code))

  // --- 4. Check which hierarchy names already exist ---
  const [existingAreas, existingRegs, existingDists, existingClusters, existingLocs] = await Promise.all([
    prisma.areas.findMany({ where: { name: { in: [...areaNames] } }, select: { name: true } }),
    prisma.regionals.findMany({ where: { name: { in: [...regionalNames] } }, select: { name: true } }),
    prisma.districts.findMany({ where: { name: { in: [...districtNames] } }, select: { name: true } }),
    prisma.clusters.findMany({ where: { name: { in: [...clusterNames] } }, select: { name: true } }),
    prisma.locations.findMany({ where: { name: { in: [...locationNames] } }, select: { name: true } }),
  ])

  const existingAreaSet = new Set(existingAreas.map((a) => a.name))
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

  const areasBaru = [...areaNames].filter((n) => !existingAreaSet.has(n)).length
  const regionalsBaru = [...regionalNames].filter((n) => !existingRegSet.has(n)).length
  const districtsBaru = [...districtNames].filter((n) => !existingDistSet.has(n)).length
  const clustersBaru = [...clusterNames].filter((n) => !existingClusterSet.has(n)).length
  const locationsBaru = [...locationNames].filter((n) => !existingLocSet.has(n)).length

  return {
    totalRows: data.length,
    devicesBaru,
    devicesUpdated,
    duplikatDalamFile: duplicateKeys.size,
    areasBaru,
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
  importType: string,
  prisma: PrismaClient,
): Promise<ImportResult> {
  const errors: string[] = []
  let newDevices = 0
  let updatedDevices = 0
  let newLocations = 0

  // -------------------------------------------------------------------------
  // Replace mode: wipe existing devices
  // -------------------------------------------------------------------------
  if (mode === 'replace') {
    if (importType === 'genset') {
      // Only wipe Genset Mobile devices
      await prisma.devices.updateMany({
        where: { device_type: { in: ['Genset Mobile', 'Genset Mobil', 'Dummy Load'] } },
        data: { deleted_at: new Date() },
      })
    } else {
      // Wipe regular devices (exclude Genset Mobiles)
      await prisma.devices.updateMany({
        where: { device_type: { notIn: ['Genset Mobile', 'Genset Mobil', 'Dummy Load'] } },
        data: { deleted_at: new Date() },
      })
    }
    // We intentionally DO NOT delete locations and hierarchy during replace mode
    // because they are shared between Genset Mobiles and regular devices, 
    // and deleting them would break foreign key relationships.
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
  const [allAreas, allRegs, allDists, allClusters, allLocs, allDevices] = await Promise.all([
    prisma.areas.findMany({ select: { id: true, name: true } }),
    prisma.regionals.findMany({ select: { id: true, name: true, area_id: true } }),
    prisma.districts.findMany({ select: { id: true, name: true, regional_id: true } }),
    prisma.clusters.findMany({ select: { id: true, name: true, district_id: true } }),
    prisma.locations.findMany({ select: { id: true, name: true, cluster_id: true, district_id: true, regional_id: true, latitude: true, longitude: true } }),
    prisma.devices.findMany({ select: { id: true, device_code: true } }),
  ])

  const areaByName = new Map(allAreas.map((a) => [a.name.toLowerCase(), a.id]))
  const regByName = new Map(allRegs.map((r) => [`${r.area_id}-${r.name.toLowerCase()}`, r.id]))
  const distByName = new Map(allDists.map((d) => [`${d.regional_id}-${d.name.toLowerCase()}`, d.id]))
  const clusterByName = new Map(allClusters.map((c) => [`${c.district_id}-${c.name.toLowerCase()}`, c.id]))
  const locByName = new Map(allLocs.map((l) => [l.name.toLowerCase(), l.id]))
  const deviceByCode = new Map(allDevices.map((d) => [d.device_code?.toLowerCase(), d.id]))
  
  // Create a mutable copy of all locations to use for fuzzy matching and fallback
  const availableLocations = [...allLocs]

  // Helper function to find best matching location or fallback coordinates
  const findLocationHelpers = (locName: string, clusterId: string | undefined, districtId: string | undefined) => {
    // 1. Fuzzy match
    const locNameLower = locName.toLowerCase()
    let bestMatch = availableLocations.find(l => 
      (l.name.toLowerCase().includes(locNameLower) || locNameLower.includes(l.name.toLowerCase())) &&
      (l.cluster_id === clusterId || l.district_id === districtId)
    )
    if (!bestMatch) {
      bestMatch = availableLocations.find(l => 
        l.name.toLowerCase() === locNameLower ||
        l.name.toLowerCase() === `sto ${locNameLower}` ||
        `sto ${l.name.toLowerCase()}` === locNameLower
      )
    }

    // 2. Fallback coordinates
    let fallbackLat = 0
    let fallbackLng = 0
    if (clusterId) {
      const locInCluster = availableLocations.find(l => l.cluster_id === clusterId && l.latitude !== 0 && l.longitude !== 0)
      if (locInCluster) { fallbackLat = locInCluster.latitude; fallbackLng = locInCluster.longitude }
    }
    if (fallbackLat === 0 && fallbackLng === 0 && districtId) {
      const locInDist = availableLocations.find(l => l.district_id === districtId && l.latitude !== 0 && l.longitude !== 0)
      if (locInDist) { fallbackLat = locInDist.latitude; fallbackLng = locInDist.longitude }
    }
    // Default to Sumatra center if still 0
    if (fallbackLat === 0 && fallbackLng === 0) {
      fallbackLat = -3.5
      fallbackLng = 103.5
    }

    return { matchedLocation: bestMatch, fallbackLat, fallbackLng }
  }

  // -------------------------------------------------------------------------
  // Phase 1 — Upsert hierarchy (top-down) for all unique rows
  // -------------------------------------------------------------------------
  for (const row of uniqueRows) {
    const areaName = normalise(row.area) || HIERARCHY_DEFAULTS.area
    const regName = normalise(row.regional) || HIERARCHY_DEFAULTS.regional
    const distName = normalise(row.district) || HIERARCHY_DEFAULTS.district
    const clusterName = normalise(row.cluster) || normalise(row.organization_name) || HIERARCHY_DEFAULTS.cluster
    const locName = normalise(row.site_name)

    // --- Area ---
    const areaKey = areaName.toLowerCase()
    let area_id = areaByName.get(areaKey)
    if (!area_id) {
      const created = await prisma.areas.create({ data: { name: areaName } })
      area_id = created.id
      areaByName.set(areaKey, area_id)
    }

    // --- Regional ---
    const regKey = `${area_id}-${regName.toLowerCase()}`
    let regional_id = regByName.get(regKey)
    if (!regional_id) {
      const created = await prisma.regionals.create({ data: { name: regName, area_id } })
      regional_id = created.id
      regByName.set(regKey, regional_id)
    }

    // --- District ---
    const distKey = `${regional_id}-${distName.toLowerCase()}`
    let district_id = distByName.get(distKey)
    if (!district_id) {
      const created = await prisma.districts.create({
        data: { name: distName, regional_id },
      })
      district_id = created.id
      distByName.set(distKey, district_id)
    }

    // --- Cluster ---
    const clusterKey = `${district_id}-${clusterName.toLowerCase()}`
    let cluster_id = clusterByName.get(clusterKey)
    if (!cluster_id) {
      const created = await prisma.clusters.create({
        data: { name: clusterName, district_id },
      })
      cluster_id = created.id
      clusterByName.set(clusterKey, cluster_id)
    }

    // --- Location ---
    if (locName) {
      const locKey = locName.toLowerCase()
      if (locByName.has(locKey)) {
        // Exact match found, do nothing
      } else {
        // Try fuzzy matching
        const { matchedLocation, fallbackLat, fallbackLng } = findLocationHelpers(locName, cluster_id, district_id)
        
        if (matchedLocation) {
          // Fuzzy match found, link to existing location
          locByName.set(locKey, matchedLocation.id)
        } else {
          // No match found, create new location with fallback coordinates
          const lat = row.latitude ?? fallbackLat
          const lng = row.longitude ?? fallbackLng
          const created = await prisma.locations.create({
            data: {
              name: locName,
              site_code: normalise(row.site_code) || null,
              latitude: lat,
              longitude: lng,
              cluster_id,
              area_id,
              regional_id,
              district_id,
              class_type: normalise(row.class_type) || 'BASIC',
              address: normalise(row.address) || null,
              territory: normalise(row.territory) || null,
              teknisi: normalise(row.teknisi) || null,
              uuid: normalise(row.uuid) || null,
              organization_uuid: normalise(row.organization_uuid) || null,
              organization_sname: normalise(row.organization_sname) || null,
            },
          })
          locByName.set(locName, created.id)
          availableLocations.push({
            id: created.id, name: created.name, cluster_id: created.cluster_id, 
            district_id: created.district_id, regional_id: created.regional_id,
            latitude: created.latitude, longitude: created.longitude
          })
          newLocations++
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Phase 2 — Upsert devices in batches
  // -------------------------------------------------------------------------
  const newDevicesData: any[] = []

  for (let i = 0; i < uniqueRows.length; i += BATCH_SIZE) {
    const batch = uniqueRows.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (row) => {
        const device_code = normalise(row.device_code)
        const locName = normalise(row.site_name)

        if (!device_code) {
          errors.push(`Baris "${row.device_name}": code/deviceCode kosong`)
          return
        }

        const locKey = locName ? locName.toLowerCase() : ''
        const location_id = locKey ? locByName.get(locKey) : undefined
        if (!location_id) {
          errors.push(`Baris "${row.device_name}": location tidak ditemukan`)
          return
        }

        const deviceData = mapDeviceData(row, location_id)

        if (deviceByCode.has(device_code.toLowerCase())) {
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
          // Collect new for bulk insert
          newDevicesData.push(deviceData)
          deviceByCode.set(device_code.toLowerCase(), device_code) // mark as existing for this session
        }
      })
    )
  }

  // Bulk insert all new devices at once
  if (newDevicesData.length > 0) {
    try {
      const result = await prisma.devices.createMany({
        data: newDevicesData,
        skipDuplicates: true, // safe guard
      })
      newDevices += result.count
    } catch (err) {
      errors.push(`Gagal bulk insert devices: ${(err as Error).message}`)
    }
  }

  return {
    newDevices,
    updatedDevices,
    newLocations,
    totalProcessed: uniqueRows.length,
    errors,
  }
}
