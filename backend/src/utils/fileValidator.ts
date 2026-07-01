/**
 * File Validation Utilities
 *
 * Validates uploaded files before processing:
 * - Extension checking (.csv, .xlsx, .xls)
 * - File size checking (max 10MB)
 * - Magic bytes validation for security
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

// Magic bytes for file type detection
const MAGIC_BYTES = {
  xlsx: [0x50, 0x4b, 0x03, 0x04], // PK (ZIP) — XLSX files are ZIP archives
  xls:  [0xd0, 0xcf, 0x11, 0xe0], // OLE2 Compound Document — XLS files
  // CSV: no magic bytes; validated by checking printable ASCII ratio
} as const

export interface ValidationResult {
  valid: boolean
  mimeType: string
  error?: string
}

/**
 * Checks if the given buffer starts with the expected magic bytes.
 */
function matchesMagicBytes(buffer: Buffer, magic: readonly number[]): boolean {
  if (buffer.length < magic.length) return false
  return magic.every((byte, i) => buffer[i] === byte)
}

/**
 * Validates that a buffer contains mostly printable ASCII text (>80%).
 * Used to confirm a file is truly a CSV rather than a binary disguised as .csv.
 */
function isValidCsvText(buffer: Buffer): boolean {
  if (buffer.length === 0) return false
  let printable = 0
  for (const byte of buffer) {
    // Printable ASCII range (space=0x20 through ~0x7e), plus tab (0x09)
    if ((byte >= 0x20 && byte <= 0x7e) || byte === 0x09 || byte === 0x0a || byte === 0x0d) {
      printable++
    }
  }
  return printable / buffer.length > 0.8
}

/**
 * Extracts the lowercase file extension from a filename.
 * Returns an empty string if no extension is found.
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === filename.length - 1) return ''
  return filename.slice(lastDot).toLowerCase()
}

/**
 * Determines the MIME type string for a given extension.
 * Returns 'application/octet-stream' for unknown extensions.
 */
function mimeTypeFor(ext: string): string {
  switch (ext) {
    case '.csv':  return 'text/csv'
    case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case '.xls':  return 'application/vnd.ms-excel'
    default:      return 'application/octet-stream'
  }
}

/**
 * Validates a file buffer against size, extension, and magic bytes.
 *
 * @param buffer   - The raw file bytes
 * @param filename - Original filename used to check the extension
 * @returns ValidationResult indicating whether the file passes all checks
 */
export function validateFile(buffer: Buffer, filename: string): ValidationResult {
  const ext = getExtension(filename)

  // 1. Extension check
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      mimeType: '',
      error: 'Format file tidak valid. Gunakan .csv atau .xlsx',
    }
  }

  // 2. Size check
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      mimeType: '',
      error: 'Ukuran file maksimal 10MB',
    }
  }

  // 3. Magic bytes validation
  if (ext === '.xlsx') {
    if (!matchesMagicBytes(buffer, MAGIC_BYTES.xlsx)) {
      return {
        valid: false,
        mimeType: '',
        error: 'Format file tidak valid. Gunakan .csv atau .xlsx',
      }
    }
  } else if (ext === '.xls') {
    if (!matchesMagicBytes(buffer, MAGIC_BYTES.xls)) {
      return {
        valid: false,
        mimeType: '',
        error: 'Format file tidak valid. Gunakan .csv atau .xlsx',
      }
    }
  } else if (ext === '.csv') {
    if (!isValidCsvText(buffer)) {
      return {
        valid: false,
        mimeType: '',
        error: 'Format file tidak valid. Gunakan .csv atau .xlsx',
      }
    }
  }

  return {
    valid: true,
    mimeType: mimeTypeFor(ext),
  }
}
