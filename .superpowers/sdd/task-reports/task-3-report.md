# Task 3 Report: Backend - Modernization Calculator

## Status: DONE

## Files Created

1. `backend/src/utils/modernization.ts` — Core implementation
2. `backend/src/utils/__tests__/modernization.test.ts` — Test suite (18 tests)

## Implementation Details

### `hitungButuhModernisasi(deviceType: string, tahunOperasi: number): ModernizationResult`

- Normalizes `deviceType` to uppercase for case-insensitive matching
- Computes `umur = currentYear - tahunOperasi` using `new Date().getFullYear()`
- Looks up the device type in a `MODERNIZATION_RULES` record
- Returns `{ butuhModernisasi: true, alasan: string }` when `umur > threshold`
- Returns `{ butuhModernisasi: false }` for unknown device types (non-catu daya)

### Rules Applied

| Device Type | Threshold | Alasan |
|-------------|-----------|--------|
| ACSPLIT    | > 15 years | AC > 15 tahun |
| ACSTANDING | > 15 years | AC > 15 tahun |
| RECTIFIER  | > 15 years | Rectifier > 15 tahun |
| BATKERING  | > 10 years | Battery VRLA > 10 tahun |
| BATBASAH   | > 20 years | Battery VLA > 20 tahun |
| GENSET     | > 25 years | Genset > 25 tahun |
| (other)    | —          | Never flags |

## Test Results

```
RUN  v4.1.9
Test Files  1 passed (1)
     Tests  18 passed (18)
```

### Test Coverage

| # | Test Case | Result |
|---|-----------|--------|
| 1 | ACSPLIT > 15 years → true | PASS |
| 2 | ACSPLIT < 15 years → false | PASS |
| 3 | ACSPLIT = 15 years → false (boundary) | PASS |
| 4 | ACSTANDING > 15 years → true | PASS |
| 5 | ACSTANDING < 15 years → false | PASS |
| 6 | RECTIFIER > 15 years → true (mixed case "Rectifier") | PASS |
| 7 | RECTIFIER < 15 years → false | PASS |
| 8 | BATKERING > 10 years → true | PASS |
| 9 | BATKERING = 10 years → false (boundary) | PASS |
| 10 | BATBASAH > 20 years → true | PASS |
| 11 | BATBASAH = 20 years → false (boundary) | PASS |
| 12 | GENSET > 25 years → true (mixed case "Genset") | PASS |
| 13 | GENSET = 25 years → false (boundary) | PASS |
| 14 | OLT age 100 → false | PASS |
| 15 | Switch age 50 → false | PASS |
| 16 | lowercase "acsplit" → correctly matches | PASS |
| 17 | mixed-case "BatKering" → correctly matches | PASS |
| 18 | uppercase "GENSET" → correctly matches | PASS |

## No Concerns

- No dependencies required
- Fully isolated utility — no database or external service calls
- Threshold comparisons use strict `>` (not `>=`), matching the brief
- The function is re-exported from `backend/src/utils/index.ts` if that barrel file is updated in the future
