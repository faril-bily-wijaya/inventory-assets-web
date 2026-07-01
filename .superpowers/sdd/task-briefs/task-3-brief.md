# Task 3 Brief: Backend - Modernization Calculator

## Task Description

Create `backend/src/utils/modernization.ts` for on-the-fly modernization calculation.

## Interface

```typescript
interface ModernizationResult {
  butuhModernisasi: boolean;
  alasan?: string;
}

function hitungButuhModernisasi(deviceType: string, tahunOperasi: number): ModernizationResult
```

## Requirements

Calculate if device needs modernization based on device type and year of operation.

**Modernization Rules (threshold years):**

| Device Type | Threshold | Label |
|-------------|-----------|-------|
| ACSPLIT | > 15 years | "AC > 15 tahun" |
| ACSTANDING | > 15 years | "AC > 15 tahun" |
| RECTIFIER | > 15 years | "Rectifier > 15 tahun" |
| BATKERING | > 10 years | "Battery VRLA > 10 tahun" |
| BATBASAH | > 20 years | "Battery VLA > 20 tahun" |
| GENSET | > 25 years | "Genset > 25 tahun" |

**Calculation**: `umur = currentYear - tahunOperasi`
- If `umur > threshold`, return `butuhModernisasi: true` with alasan
- Otherwise return `butuhModernisasi: false`

**Note**: Device types are case-insensitive.

## Test File Location

Create test at: `backend/src/utils/__tests__/modernization.test.ts`

## Dependencies

- None (independent task)

## Plan Reference

Global Constraints:
- Modernization threshold: AC > 15 years, Rectifier > 15 years, BATKERING > 10 years, BATBASAH > 20 years, Genset > 25 years
