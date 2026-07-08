export function isCatuDaya(deviceType?: string | null): boolean {
  if (!deviceType) return false
  const type = deviceType.toUpperCase()
  const catuDayaKeywords = [
    'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
    'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
    'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
    'TRAFO', 'ATS', 'AMF',
    // Fallback/Legacy keywords yang mungkin masih ada:
    'BATTERE', 'TANGKI', 'PDB'
  ]
  return catuDayaKeywords.some(keyword => type.includes(keyword))
}
