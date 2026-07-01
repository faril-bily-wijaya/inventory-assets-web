import { describe, it, expect, beforeEach } from 'vitest'
import { parseFile } from '../fileParser.js'

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Minimal valid CSV with all required columns and one data row. */
const VALID_CSV = Buffer.from(
  'code,name,sites_name,jenis,tahun_operasi,merk,status\n' +
    '  CODE001 ,  Engine Alpha ,  Site A ,  Genset ,  2020 ,  CAT ,  Active ',
)

/** CSV missing the "sites_name" required column. */
const CSV_MISSING_REQUIRED = Buffer.from(
  'code,name,jenis,tahun_operasi\n' +
    'CODE001,Engine Alpha,Genset,2020',
)

/** CSV with 10,002 total lines (header + 10,001 data rows) → returns 10,001 rows from Papa. */
function csvOverRowLimit(): Buffer {
  const header = 'code,name,sites_name,jenis,tahun_operasi\n'
  const row = 'C001,N,S,J,2020\n'
  // 10,001 data rows + 1 header = 10,002 lines
  // PapaParse with header:true gives rows.length = 10,001 → 10,001 > MAX_ROWS=10,000
  return Buffer.from(header + row.repeat(10_001))
}

/** Builds a minimal real XLSX buffer from a CSV string (compatible with xlsx 0.18.x). */
function xlsxBuffer(csvContent: string): Buffer {
  const XLSX = require('xlsx') as typeof import('xlsx')
  const rows = csvContent.trim().split('\n').map((line) => line.split(','))
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('parseFile', () => {
  describe('CSV', () => {
    it('should parse CSV correctly', async () => {
      const result = await parseFile(VALID_CSV, 'text/csv', 'inventory.csv')

      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(1)

      const row = result.data[0]
      expect(row.code).toBe('CODE001')
      expect(row.name).toBe('Engine Alpha')
      expect(row.sites_name).toBe('Site A')
      expect(row.jenis).toBe('Genset')
      expect(row.tahun_operasi).toBe(2020)
      expect(row.merk).toBe('CAT')
      expect(row.status).toBe('Active')
    })

    it('should throw error for missing required columns', async () => {
      await expect(
        parseFile(CSV_MISSING_REQUIRED, 'text/csv', 'inventory.csv'),
      ).rejects.toThrow('Kolom wajib tidak ditemukan: sites_name')
    })

    it('should throw error for files exceeding row limit', async () => {
      await expect(
        parseFile(csvOverRowLimit(), 'text/csv', 'large.csv'),
      ).rejects.toThrow('Jumlah baris melebihi batas maksimum')
    })

    it('should sanitize string values (trim whitespace)', async () => {
      const dirtyCsv = Buffer.from(
        'code,name,sites_name,jenis,tahun_operasi\n' +
          '  CODE002  ,  Dirty Name  ,  Dirty Site  ,  Motor  ,  2021  ',
      )
      const result = await parseFile(dirtyCsv, 'text/csv', 'dirty.csv')

      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(1)

      const row = result.data[0]
      expect(row.code).toBe('CODE002')     // no surrounding spaces
      expect(row.name).toBe('Dirty Name')  // internal spaces preserved
      expect(row.sites_name).toBe('Dirty Site')
      expect(row.jenis).toBe('Motor')
      expect(row.tahun_operasi).toBe(2021)
    })

    it('should handle optional columns gracefully', async () => {
      const partialCsv = Buffer.from(
        'code,name,sites_name,jenis,tahun_operasi,latitude,longitude\n' +
          'C001,N,S,J,2020,1.2345,-6.789',
      )
      const result = await parseFile(partialCsv, 'text/csv', 'partial.csv')

      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].latitude).toBeCloseTo(1.2345)
      expect(result.data[0].longitude).toBeCloseTo(-6.789)
    })
  })

  describe('XLSX', () => {
    it('should parse XLSX correctly', async () => {
      const xlsxBuf = xlsxBuffer(
        'code,name,sites_name,jenis,tahun_operasi,merk\n' +
          'EX001,Excel Engine,Site X,Turbine,2022,Cummins',
      )
      const result = await parseFile(
        xlsxBuf,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'inventory.xlsx',
      )

      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(1)

      const row = result.data[0]
      expect(row.code).toBe('EX001')
      expect(row.name).toBe('Excel Engine')
      expect(row.sites_name).toBe('Site X')
      expect(row.jenis).toBe('Turbine')
      expect(row.tahun_operasi).toBe(2022)
      expect(row.merk).toBe('Cummins')
    })

    it('should throw error for missing required columns in XLSX', async () => {
      const badXlsxBuf = xlsxBuffer('code,name,jenis\nC001,N,J')
      await expect(
        parseFile(
          badXlsxBuf,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'bad.xlsx',
        ),
      ).rejects.toThrow('Kolom wajib tidak ditemukan: sites_name')
    })

    it('should throw error for XLSX exceeding row limit', async () => {
      const header = 'code,name,sites_name,jenis,tahun_operasi\n'
      const row = 'C,N,S,J,2020\n'
      const lines: string[] = [header]
      for (let i = 0; i < 10_001; i++) lines.push(row)
      const xlsxBuf = xlsxBuffer(lines.join(''))

      await expect(
        parseFile(xlsxBuf, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'huge.xlsx'),
      ).rejects.toThrow('Jumlah baris melebihi batas maksimum')
    })

    it('should sanitize string values in XLSX', async () => {
      const xlsxBuf = xlsxBuffer(
        'code,name,sites_name,jenis,tahun_operasi\n' +
          '  EX002  ,  Trimmed  ,  Site B  ,  Pump  ,  2023 ',
      )
      const result = await parseFile(xlsxBuf, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'trimmed.xlsx')

      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].code).toBe('EX002')
      expect(result.data[0].name).toBe('Trimmed')
    })
  })

  describe('Excel serial dates for tahun_operasi', () => {
    it('should convert Excel serial date to year for XLSX', async () => {
      // Excel serial date for 2020-01-01 is approximately 43831
      // (days since 1899-12-30)
      const XLSX = require('xlsx') as typeof import('xlsx')
      const wb = XLSX.utils.book_new()

      // Build a sheet programmatically with an integer cell for tahun_operasi
      const ws = XLSX.utils.aoa_to_sheet([
        ['code', 'name', 'sites_name', 'jenis', 'tahun_operasi'],
        ['EX001', 'Engine', 'Site A', 'Genset', 43831], // integer — treated as serial date
      ])

      // Force the cell type to number (not date string) so our logic kicks in
      ws['E2'] = { t: 'n', v: 43831 } as XLSX.CellObject

      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      const xlsxBuf = Buffer.from(
        XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }),
      )

      const result = await parseFile(
        xlsxBuf,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'serial_date.xlsx',
      )

      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(1)
      // 43831 days from 1899-12-30 → 2020-01-01 → year 2020
      expect(result.data[0].tahun_operasi).toBe(2020)
    })
  })
})
