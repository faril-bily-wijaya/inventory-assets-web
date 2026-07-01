import { describe, it, expect } from 'vitest'
import { hitungButuhModernisasi } from '../modernization.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns an operation year that makes a device exactly `yearsOld` years old. */
function opYear(yearsOld: number): number {
  return new Date().getFullYear() - yearsOld
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('hitungButuhModernisasi', () => {
  describe('ACSPLIT — threshold 15 years', () => {
    it('should return true for ACSPLIT older than 15 years', () => {
      const result = hitungButuhModernisasi('ACSPLIT', opYear(16))
      expect(result.butuhModernisasi).toBe(true)
      expect(result.alasan).toBe('AC > 15 tahun')
    })

    it('should return false for ACSPLIT younger than 15 years', () => {
      const result = hitungButuhModernisasi('ACSPLIT', opYear(15))
      expect(result.butuhModernisasi).toBe(false)
      expect(result.alasan).toBeUndefined()
    })

    it('should return false for ACSPLIT exactly 15 years old', () => {
      const result = hitungButuhModernisasi('ACSPLIT', opYear(15))
      expect(result.butuhModernisasi).toBe(false)
    })
  })

  describe('ACSTANDING — threshold 15 years', () => {
    it('should return true for ACSTANDING older than 15 years', () => {
      const result = hitungButuhModernisasi('ACSTANDING', opYear(16))
      expect(result.butuhModernisasi).toBe(true)
      expect(result.alasan).toBe('AC > 15 tahun')
    })

    it('should return false for ACSTANDING younger than 15 years', () => {
      const result = hitungButuhModernisasi('ACSTANDING', opYear(10))
      expect(result.butuhModernisasi).toBe(false)
    })
  })

  describe('RECTIFIER — threshold 15 years', () => {
    it('should return true for Rectifier older than 15 years', () => {
      const result = hitungButuhModernisasi('Rectifier', opYear(20))
      expect(result.butuhModernisasi).toBe(true)
      expect(result.alasan).toBe('Rectifier > 15 tahun')
    })

    it('should return false for Rectifier younger than 15 years', () => {
      const result = hitungButuhModernisasi('RECTIFIER', opYear(10))
      expect(result.butuhModernisasi).toBe(false)
    })
  })

  describe('BATKERING — threshold 10 years', () => {
    it('should return true for BATKERING older than 10 years', () => {
      const result = hitungButuhModernisasi('BATKERING', opYear(11))
      expect(result.butuhModernisasi).toBe(true)
      expect(result.alasan).toBe('Battery VRLA > 10 tahun')
    })

    it('should return false for BATKERING younger than 10 years', () => {
      const result = hitungButuhModernisasi('BATKERING', opYear(10))
      expect(result.butuhModernisasi).toBe(false)
    })
  })

  describe('BATBASAH — threshold 20 years', () => {
    it('should return true for BATBASAH older than 20 years', () => {
      const result = hitungButuhModernisasi('BATBASAH', opYear(21))
      expect(result.butuhModernisasi).toBe(true)
      expect(result.alasan).toBe('Battery VLA > 20 tahun')
    })

    it('should return false for BATBASAH younger than 20 years', () => {
      const result = hitungButuhModernisasi('BATBASAH', opYear(20))
      expect(result.butuhModernisasi).toBe(false)
    })
  })

  describe('GENSET — threshold 25 years', () => {
    it('should return true for Genset older than 25 years', () => {
      const result = hitungButuhModernisasi('Genset', opYear(30))
      expect(result.butuhModernisasi).toBe(true)
      expect(result.alasan).toBe('Genset > 25 tahun')
    })

    it('should return false for GENSET younger than 25 years', () => {
      const result = hitungButuhModernisasi('GENSET', opYear(25))
      expect(result.butuhModernisasi).toBe(false)
    })
  })

  describe('non-catu daya devices', () => {
    it('should return false for OLT regardless of age', () => {
      const result = hitungButuhModernisasi('OLT', opYear(100))
      expect(result.butuhModernisasi).toBe(false)
      expect(result.alasan).toBeUndefined()
    })

    it('should return false for Switch regardless of age', () => {
      const result = hitungButuhModernisasi('Switch', opYear(50))
      expect(result.butuhModernisasi).toBe(false)
      expect(result.alasan).toBeUndefined()
    })
  })

  describe('case-insensitivity', () => {
    it('should handle lowercase device types', () => {
      const result = hitungButuhModernisasi('acsplit', opYear(20))
      expect(result.butuhModernisasi).toBe(true)
    })

    it('should handle mixed-case device types', () => {
      const result = hitungButuhModernisasi('BatKering', opYear(15))
      expect(result.butuhModernisasi).toBe(true)
    })

    it('should handle uppercase device types', () => {
      const result = hitungButuhModernisasi('GENSET', opYear(30))
      expect(result.butuhModernisasi).toBe(true)
    })
  })
})
