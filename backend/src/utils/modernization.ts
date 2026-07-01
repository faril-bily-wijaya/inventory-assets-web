/**
 * Modernization Calculator
 *
 * Determines whether a device needs modernization based on its type
 * and years of operation. Thresholds follow PLN/telco infrastructure
 * asset management standards.
 */

/** Device types that are subject to modernization rules. */
type ModernizationDeviceType = 'ACSPLIT' | 'ACSTANDING' | 'RECTIFIER' | 'BATKERING' | 'BATBASAH' | 'GENSET'

/** Threshold (in years) and human-readable alasan for each tracked device type. */
const MODERNIZATION_RULES: Record<ModernizationDeviceType, { threshold: number; alasan: string }> = {
  ACSPLIT:    { threshold: 15, alasan: 'AC > 15 tahun' },
  ACSTANDING: { threshold: 15, alasan: 'AC > 15 tahun' },
  RECTIFIER:  { threshold: 15, alasan: 'Rectifier > 15 tahun' },
  BATKERING:  { threshold: 10, alasan: 'Battery VRLA > 10 tahun' },
  BATBASAH:   { threshold: 20, alasan: 'Battery VLA > 20 tahun' },
  GENSET:     { threshold: 25, alasan: 'Genset > 25 tahun' },
}

export interface ModernizationResult {
  /** True when the device exceeds the age threshold for its type. */
  butuhModernisasi: boolean
  /** Human-readable reason, present only when butuhModernisasi is true. */
  alasan?: string
}

/**
 * Calculates whether a device needs modernization based on its type and
 * year of first operation.
 *
 * @param deviceType   - Case-insensitive device type (e.g. "acsplit", "batkering")
 * @param tahunOperasi - Year the device began operation
 * @returns ModernizationResult with butuhModernisasi flag and optional alasan
 */
export function hitungButuhModernisasi(
  deviceType: string,
  tahunOperasi: number,
): ModernizationResult {
  const currentYear = new Date().getFullYear()
  const umur = currentYear - tahunOperasi

  const normalized = deviceType.toUpperCase() as ModernizationDeviceType
  const rule = MODERNIZATION_RULES[normalized]

  if (rule === undefined) {
    // Unknown device type — never flags for modernization
    return { butuhModernisasi: false }
  }

  if (umur > rule.threshold) {
    return { butuhModernisasi: true, alasan: rule.alasan }
  }

  return { butuhModernisasi: false }
}
