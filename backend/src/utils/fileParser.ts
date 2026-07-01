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
  code: string
  name: string
  sites_name: string
  jenis: string
  tahun_operasi: number
  label_code?: string
  merk?: string
  status?: string
  kondisi?: string
  kapasitas?: string
  jenis_tegangan?: string
  beban_arus?: string | number
  ruangan_name?: string
  teknisi?: string
  latitude?: number
  longitude?: number
  address?: string
  class_type?: string
  region?: string
  district?: string
  organization_name?: string
  cluster?: string
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
  'code',
  'name',
  'sites_name',
  'jenis',
  'tahun_operasi',
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

  const code = sanitizeString(get('code'))
  const name = sanitizeString(get('name'))
  const sites_name = sanitizeString(get('sites_name'))
  const jenis = sanitizeString(get('jenis'))
  const tahun_operasi = parseTahunOperasi(get('tahun_operasi'))

  // Skip completely empty rows
  if (!code && !name && !sites_name && !jenis && tahun_operasi === undefined) {
    return null
  }

  return {
    code: code ?? '',
    name: name ?? '',
    sites_name: sites_name ?? '',
    jenis: jenis ?? '',
    tahun_operasi: tahun_operasi ?? 0,
    label_code: sanitizeString(get('label_code')),
    merk: sanitizeString(get('merk')),
    status: sanitizeString(get('status')),
    kondisi: sanitizeString(get('kondisi')),
    kapasitas: sanitizeString(get('kapasitas')),
    jenis_tegangan: sanitizeString(get('jenis_tegangan')),
    beban_arus: (() => {
      const s = sanitizeString(get('beban_arus'))
      if (s !== undefined) return s
      const n = parseOptionalNumber(get('beban_arus'))
      return n
    })(),
    ruangan_name: sanitizeString(get('ruangan_name')),
    teknisi: sanitizeString(get('teknisi')),
    latitude: parseOptionalNumber(get('latitude')),
    longitude: parseOptionalNumber(get('longitude')),
    address: sanitizeString(get('address')),
    class_type: sanitizeString(get('class_type')),
    region: sanitizeString(get('region')),
    district: sanitizeString(get('district')),
    organization_name: sanitizeString(get('organization_name')),
    cluster: sanitizeString(get('cluster')),
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

function parseXlsx(buffer: Buffer): ParseResult {
  const errors: string[] = []
  const data: ParsedRow[] = []

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false })
  const sheetName = workbook.SheetNames[0]
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

  // Normalise headers from first row keys
  const headers = Object.keys(rawRows[0])

  const headerError = validateHeaders(headers)
  if (headerError) {
    throw new Error(headerError)
  }

  // Build case-insensitive header map
  const headerMap = new Map(headers.map((h) => [h.trim().toLowerCase(), h.trim()]))

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i]
    // Normalise keys by trimming them (XLSX sometimes returns keys with spaces)
    const normalised: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(raw)) {
      normalised[key.trim()] = val
    }
    const row = mapRow(normalised, headerMap)
    if (row !== null) {
      data.push(row)
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
  return parseXlsx(buffer)
}
