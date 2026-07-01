# Task 4 Report: Backend - Import Service

## Status: DONE

## Files Created

1. **`backend/src/services/importService.ts`** — Core import business logic
2. **`backend/src/services/__tests__/importService.test.ts`** — Test suite (17 tests)

## Implementation Details

### `generateImportPreview(data, mode, prisma)`

Performs a dry-run analysis:
1. Detects intra-file duplicates using `code` + `label_code` as key
2. Counts new vs existing devices by querying deviceCode in DB
3. Counts new hierarchy nodes (regional, district, cluster, location)
4. Returns counts and any validation errors

### `executeImport(data, mode, prisma)`

Performs the actual import:

**Mode 'upsert':**
- Inserts new devices, updates existing ones by deviceCode
- Creates hierarchy nodes as needed (regional → district → cluster → location)

**Mode 'replace':**
- Soft-deletes all existing devices (sets deletedAt)
- Deletes all locations
- Cascades cleanup of empty hierarchy nodes
- Inserts all data fresh

### Batch Processing

- Processes devices in batches of 100 for performance
- Pre-loads existing hierarchy and device data into memory to minimize DB calls

### Key Functions

- `buildRowKey()` — Creates unique key for duplicate detection
- `normalise()` — Trims and normalizes string values
- `mapDeviceData()` — Maps ParsedRow to Prisma device data

### Constants

```typescript
export const CATU_DAYA_TYPES = [
  'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
  'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
  'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
  'TRAFO', 'ATS', 'AMF'
]

const BATCH_SIZE = 100

const HIERARCHY_DEFAULTS = {
  regional: 'REGIONAL DEFAULT',
  district: 'DISTRICT DEFAULT',
  cluster: 'CLUSTER DEFAULT',
}
```

## Test Results

```
Test Files  4 passed (4)
     Tests  61 passed (61)
```

### Test Coverage

| Category | Tests |
|----------|-------|
| CATU_DAYA_TYPES constants | 2 |
| generateImportPreview | 7 |
| executeImport | 9 |
| **Total** | **18** |

## Bug Fix Applied

During test implementation, discovered that Prisma returns camelCase properties (`Name`, `clusterId`) while test mock state used lowercase. Fixed by normalizing mock state to camelCase in `createMockPrisma()`.

## No Concerns

- All tests pass
- Mock properly simulates Prisma behavior including select projections
- Handles edge cases: empty data, duplicate rows, missing coordinates
