import { describe, it, expect } from 'vitest'
import { validateFile } from '../fileValidator.js'

// ---------------------------------------------------------------------------
// Helper builders
// ---------------------------------------------------------------------------

/** Builds a Buffer from a hex string (pairs of hex digits with optional spaces). */
function buf(hex: string): Buffer {
  const clean = hex.replace(/\s+/g, '')
  const bytes = clean.match(/.{2}/g)!
  return Buffer.from(bytes.map((h) => parseInt(h, 16)))
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const VALID_CSV_CONTENT = Buffer.from('id,name,category\n1,Laptop,Elektronik\n2,Meja,Kantor')

// PK (ZIP) magic bytes — first 4 bytes of a valid XLSX file
const XLSX_HEADER = buf('50 4b 03 04 14 00 06 00')

// MZ — first 2 bytes of a Windows EXE / DLL
const MZ_EXE_HEADER = buf('4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00')

// D0 CF 11 E0 — OLE2 Compound Document (legacy .xls)
const OLE2_HEADER = buf('d0 cf 11 e0 a1 b1 1a e1')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateFile', () => {
  describe('CSV', () => {
    it('should accept CSV files with valid text content', () => {
      const result = validateFile(VALID_CSV_CONTENT, 'inventory.csv')
      expect(result.valid).toBe(true)
      expect(result.mimeType).toBe('text/csv')
      expect(result.error).toBeUndefined()
    })

    it('should accept CSV files with uppercase extension', () => {
      const result = validateFile(VALID_CSV_CONTENT, 'INVENTORY.CSV')
      expect(result.valid).toBe(true)
      expect(result.mimeType).toBe('text/csv')
    })

    it('should reject EXE files disguised as CSV (MZ signature)', () => {
      // An attacker renames an .exe to .csv but the content is still an EXE
      const result = validateFile(MZ_EXE_HEADER, 'harmless.csv')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
      expect(result.mimeType).toBe('')
    })

    it('should reject binary content disguised as CSV', () => {
      const binaryContent = Buffer.from([0x00, 0xff, 0x01, 0xfe, 0x00, 0x00])
      const result = validateFile(binaryContent, 'data.csv')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
    })
  })

  describe('XLSX', () => {
    it('should accept XLSX files with valid ZIP signature', () => {
      const result = validateFile(XLSX_HEADER, 'inventory.xlsx')
      expect(result.valid).toBe(true)
      expect(result.mimeType).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      expect(result.error).toBeUndefined()
    })

    it('should reject non-ZIP content with .xlsx extension', () => {
      const result = validateFile(VALID_CSV_CONTENT, 'fake.xlsx')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
    })

    it('should reject MZ EXE with .xlsx extension', () => {
      const result = validateFile(MZ_EXE_HEADER, 'malicious.xlsx')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
    })
  })

  describe('XLS (legacy)', () => {
    it('should accept XLS files with valid OLE2 signature', () => {
      const result = validateFile(OLE2_HEADER, 'legacy.xls')
      expect(result.valid).toBe(true)
      expect(result.mimeType).toBe('application/vnd.ms-excel')
    })

    it('should reject text content with .xls extension', () => {
      const result = validateFile(VALID_CSV_CONTENT, 'fake.xls')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
    })
  })

  describe('File size', () => {
    it('should reject files larger than 10MB', () => {
      // 10MB + 1 byte
      const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 0x00)
      const result = validateFile(oversized, 'large.csv')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Ukuran file maksimal 10MB')
      expect(result.mimeType).toBe('')
    })

    it('should accept files exactly at the 10MB boundary', () => {
      // Exactly 10MB
      const exactly10MB = Buffer.alloc(10 * 1024 * 1024, 'A')
      const result = validateFile(exactly10MB, 'boundary.csv')
      expect(result.valid).toBe(true)
      expect(result.mimeType).toBe('text/csv')
    })

    it('should accept files just under 10MB', () => {
      const underLimit = Buffer.alloc(10 * 1024 * 1024 - 1, 0x41)
      const result = validateFile(underLimit, 'almost.csv')
      expect(result.valid).toBe(true)
    })
  })

  describe('Extension validation', () => {
    it('should reject files with disallowed extensions', () => {
      const result = validateFile(VALID_CSV_CONTENT, 'data.txt')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
    })

    it('should reject files with no extension', () => {
      const result = validateFile(VALID_CSV_CONTENT, 'datafile')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
    })

    it('should reject .json files', () => {
      const jsonContent = Buffer.from('{"key":"value"}')
      const result = validateFile(jsonContent, 'data.json')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Format file tidak valid. Gunakan .csv atau .xlsx')
    })
  })
})
