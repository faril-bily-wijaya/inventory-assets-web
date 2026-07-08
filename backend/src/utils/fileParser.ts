/**
 * File Parser Utilities
 *
 * Parses CSV and XLSX file buffers into structured row data.
 * Upstream: fileValidator.ts must be called first to validate the buffer.
 *
 * Libraries:
 *   - papaparse  — CSV parsing
 *   - xlsx       — Excel (.xlsx / .xls) parsing
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedRow {
  area?: string
  regional?: string
  district?: string
  cluster?: string
  site_code?: string
  site_name: string
  ruangan_code?: string
  ruangan_name?: string
  ruangan_panjang?: number
  ruangan_lebar?: number
  ruangan_tinggi?: number
  ruangan_luas?: number
  rack_code?: string
  rack_name?: string
  rack_panjang?: number
  rack_lebar?: number
  rack_tinggi?: number
  rack_luas?: number
  device_code: string
  device_name: string
  label_code?: string
  serial_number?: string
  device_type: string
  brand?: string
  model?: string
  year: number
  status?: string
  condition?: string
  kapasitas?: string
  satuan_kapasitas?: string
  jenis_tegangan?: string
  cap_real?: string
  beban_arus?: string | number
  satuan_beban?: string
  keterangan?: string
  usia_perangkat?: number
  latitude?: number
  longitude?: number
  address?: string
  class_type?: string
  territory?: string
  organization_name?: string
  teknisi?: string
  uuid?: string
  organization_uuid?: string
  organization_sname?: string
}


export interface ParseResult {
  data: ParsedRow[]
  errors: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ROWS = 10_000

const REQUIRED_COLUMNS: (keyof ParsedRow)[] = [
  'device_code',
  'device_name',
  'site_name',
  'device_type',
  'year',
]

// ---------------------------------------------------------------------------
// Excel serial-date helpers
// ---------------------------------------------------------------------------

/**
 * Detects whether a raw cell value looks like an Excel serial date.
 * Excel serial dates are integers between 1 and ~60,000
 * (covering 1900-01-01 through ~2078).
 *
 * We exclude small integers that are more plausibly quantities,
 * and apply a loose upper bound.
 */
function isExcelSerialDate(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 60 &&     // exclude row numbers / quantities
    value <= 100_000   // generous upper bound
  )
}

/**
 * Converts an Excel serial date to a year (integer).
 *
 * Excel incorrectly treats 1900 as a leap year (it has 1899-12-30 as day 1).
 * Dates on or after 1900-03-01 therefore need to subtract 1 to correct
 * the off-by-one leap-year error.
 */
function excelSerialToYear(serial: number): number {
  // Excel epoch is 1899-12-30
  const excelEpoch = new Date(Date.UTC(1899, 11, 30))
  const date = new Date(excelEpoch.getTime() + serial * 86_400_000)
  return date.getUTCFullYear()
}

// ---------------------------------------------------------------------------
// Column normalisation helpers
// ---------------------------------------------------------------------------

/** Trims a value and returns it as a string, or undefined if empty. */
function sanitizeString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined
  const trimmed = String(value).trim()
  return trimmed === '' ? undefined : trimmed
}

/** Converts tahun_operasi to an integer, returning undefined on failure. */
function parseTahunOperasi(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined

  // Handle Excel serial dates
  if (isExcelSerialDate(value)) {
    return excelSerialToYear(value as number)
  }

  // Handle numeric strings and plain numbers
  const asNumber =
    typeof value === 'number' ? value : parseFloat(String(value).trim())

  if (Number.isNaN(asNumber) || !Number.isFinite(asNumber)) return undefined

  return Math.trunc(asNumber)
}

/** Safely parses a numeric string to a number, or returns undefined. */
function parseOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined
  const asNumber =
    typeof value === 'number' ? value : parseFloat(String(value).trim())
  if (Number.isNaN(asNumber) || !Number.isFinite(asNumber)) return undefined
  return asNumber
}

// ---------------------------------------------------------------------------
// Core parse logic
// ---------------------------------------------------------------------------

/**
 * Validates that the header row contains all required columns.
 * Matching is case-insensitive.
 */
function validateHeaders(headers: string[]): string | null {
  const lower = headers.map((h) => h.trim().toLowerCase())
  for (const col of REQUIRED_COLUMNS) {
    if (!lower.includes(col.toLowerCase())) {
      return `Kolom wajib tidak ditemukan: ${col}`
    }
  }
  return null
}

/** Maps a raw sheet row object to a ParsedRow, skipping empty rows. */
function mapRow(
  raw: Record<string, unknown>,
  headerMap: Map<string, string>,
): ParsedRow | null {
  const get = (col: string): unknown => raw[headerMap.get(col) ?? col]

  const device_code = sanitizeString(get('device_code'))
  const device_name = sanitizeString(get('device_name'))
  const site_name = sanitizeString(get('site_name'))
  const device_type = sanitizeString(get('device_type'))
  const year = parseTahunOperasi(get('year'))

  // Skip completely empty rows
  if (!device_code && !device_name && !site_name && !device_type && year === undefined) {
    return null
  }

  return {
    area: sanitizeString(get('area')),
    regional: sanitizeString(get('regional')),
    district: sanitizeString(get('district')),
    cluster: sanitizeString(get('cluster')),
    site_name: site_name ?? '',
    site_code: sanitizeString(get('site_code')),
    ruangan_code: sanitizeString(get('ruangan_code')),
    ruangan_name: sanitizeString(get('ruangan_name')),
    ruangan_panjang: parseOptionalNumber(get('ruangan_panjang')),
    ruangan_lebar: parseOptionalNumber(get('ruangan_lebar')),
    ruangan_tinggi: parseOptionalNumber(get('ruangan_tinggi')),
    ruangan_luas: parseOptionalNumber(get('ruangan_luas')),
    rack_code: sanitizeString(get('rack_code')),
    rack_name: sanitizeString(get('rack_name')),
    rack_panjang: parseOptionalNumber(get('rack_panjang')),
    rack_lebar: parseOptionalNumber(get('rack_lebar')),
    rack_tinggi: parseOptionalNumber(get('rack_tinggi')),
    rack_luas: parseOptionalNumber(get('rack_luas')),
    device_code: device_code ?? '',
    device_name: device_name ?? '',
    label_code: sanitizeString(get('label_code')),
    serial_number: sanitizeString(get('serial_number')),
    device_type: device_type ?? '',
    brand: sanitizeString(get('brand')),
    model: sanitizeString(get('model')),
    year: year ?? 0,
    status: sanitizeString(get('status')),
    condition: sanitizeString(get('condition')),
    kapasitas: sanitizeString(get('kapasitas')),
    satuan_kapasitas: sanitizeString(get('satuan_kapasitas')),
    jenis_tegangan: sanitizeString(get('jenis_tegangan')),
    cap_real: sanitizeString(get('cap_real')),
    beban_arus: (() => {
      const s = sanitizeString(get('beban_arus'))
      if (s !== undefined && isNaN(Number(s))) return s
      const n = parseOptionalNumber(get('beban_arus'))
      return n
    })(),
    satuan_beban: sanitizeString(get('satuan_beban')),
    keterangan: sanitizeString(get('keterangan')),
    usia_perangkat: parseOptionalNumber(get('usia_perangkat')),
    latitude: parseOptionalNumber(get('latitude')),
    longitude: parseOptionalNumber(get('longitude')),
    address: sanitizeString(get('address')),
    class_type: sanitizeString(get('class_type')),
    territory: sanitizeString(get('territory')),
    organization_name: sanitizeString(get('organization_name')),
    teknisi: sanitizeString(get('teknisi')),
    uuid: sanitizeString(get('uuid')),
    organization_uuid: sanitizeString(get('organization_uuid')),
    organization_sname: sanitizeString(get('organization_sname')),
  }
}

// ---------------------------------------------------------------------------
// CSV parser
// ---------------------------------------------------------------------------

function parseCsv(buffer: Buffer): ParseResult {
  const errors: string[] = []
  let headers: string[] = []
  let rowCount = 0
  const data: ParsedRow[] = []
  let headerMap = new Map<string, string>()

  const result = Papa.parse<Record<string, unknown>>(buffer.toString('utf-8'), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const rows = result.data

  if (rows.length === 0) {
    return { data: [], errors: ['File kosong atau tidak memiliki baris data'] }
  }

  // Row limit check (account for header in total count)
  if (rows.length > MAX_ROWS) {
    throw new Error(`Jumlah baris melebihi batas maksimum ${MAX_ROWS.toLocaleString()}`)
  }

  headers = result.meta.fields ?? []

  const headerError = validateHeaders(headers)
  if (headerError) {
    throw new Error(headerError)
  }

  // Build case-insensitive header map
  headerMap = new Map(headers.map((h) => [h.toLowerCase(), h]))

  for (const raw of rows) {
    rowCount++
    const row = mapRow(raw, headerMap)
    if (row !== null) {
      data.push(row)
    }
  }

  if (result.errors.length > 0) {
    for (const e of result.errors) {
      errors.push(`Baris ${rowCount}: ${e.message}`)
    }
  }

  return { data, errors }
}

// ---------------------------------------------------------------------------
// XLSX parser
// ---------------------------------------------------------------------------

function parseXlsx(buffer: Buffer, importType: 'default' | 'genset' = 'default'): ParseResult {
  const errors: string[] = []
  const data: ParsedRow[] = []

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false })
  
  let sheetName = workbook.SheetNames[0]
  if (importType === 'genset') {
    sheetName = workbook.SheetNames.find(n => n.toUpperCase() === 'REKAP') || workbook.SheetNames[0]
  }

  if (!sheetName) {
    return { data: [], errors: ['File Excel tidak memiliki sheet'] }
  }

  const sheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: undefined,
  })

  if (rawRows.length === 0) {
    return { data: [], errors: ['File kosong atau tidak memiliki baris data'] }
  }

  if (rawRows.length > MAX_ROWS) {
    throw new Error(`Jumlah baris melebihi batas maksimum ${MAX_ROWS.toLocaleString()}`)
  }

  if (importType === 'genset') {
    // Genset specific mapping
    for (let i = 0; i < rawRows.length; i++) {
      const raw = rawRows[i]
      const get = (key: string) => raw[Object.keys(raw).find(k => k.trim().toLowerCase().includes(key)) || key]
      
      const perangkat = sanitizeString(get('perangkat'))
      const sto = sanitizeString(get('sto'))
      const distrik = sanitizeString(get('distrik'))
      const myassetId = sanitizeString(get('myasset id'))
      
      if (!perangkat && !sto) continue
      
      let device_type = perangkat || 'Genset Mobile'
      if (device_type.toLowerCase() === 'genset mobil') device_type = 'Genset Mobile'

      const rawKapasitas = String(get('kapasitas') || '')
      let kapasitas = ''
      let satuan_kapasitas = ''
      const match = rawKapasitas.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/)
      if (match) {
        kapasitas = match[1]
        satuan_kapasitas = match[2].toUpperCase()
      } else {
        kapasitas = sanitizeString(rawKapasitas) || ''
      }

      data.push({
        device_code: myassetId || `GM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, // fallback code if missing
        device_name: `${device_type} ${sto || ''}`.trim(),
        site_name: sto || 'Unknown Site',
        district: distrik,
        device_type: device_type,
        year: new Date().getFullYear(),
        brand: sanitizeString(get('merk')),
        kapasitas: kapasitas || undefined,
        satuan_kapasitas: satuan_kapasitas || undefined,
        condition: sanitizeString(get('kondisi')),
        keterangan: sanitizeString(get('keterangan')),
        status: sanitizeString(get('kondisi'))?.toLowerCase() === 'bagus' ? 'OPERATIONAL' : 'RUSAK',
      })
    }
  } else {
    // Normal mapping
    const headers = Object.keys(rawRows[0])
    const headerError = validateHeaders(headers)
    if (headerError) {
      throw new Error(headerError)
    }

    const headerMap = new Map(headers.map((h) => [h.trim().toLowerCase(), h.trim()]))

    for (let i = 0; i < rawRows.length; i++) {
      const raw = rawRows[i]
      const normalised: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(raw)) {
        normalised[key.trim()] = val
      }
      const row = mapRow(normalised, headerMap)
      if (row !== null) {
        data.push(row)
      }
    }
  }

  return { data, errors }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a validated file buffer into structured row data.
 *
 * @param buffer   - Raw file bytes (should already be validated by validateFile)
 * @param mimeType - MIME type of the file
 * @param filename - Original filename (used to detect .xls vs .xlsx)
 * @returns ParseResult containing parsed rows and any non-fatal errors
 */
export async function parseFile(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  importType: 'default' | 'genset' = 'default'
): Promise<ParseResult> {
  const ext = filename.toLowerCase().endsWith('.xls')
    ? 'xlsx'
    : filename.toLowerCase().endsWith('.csv')
    ? 'csv'
    : mimeType

  if (ext === 'csv' || mimeType === 'text/csv') {
    return parseCsv(buffer)
  }

  // Treat everything else (xlsx, xls, vnd.ms-excel) as Excel
  return parseXlsx(buffer, importType)
}
