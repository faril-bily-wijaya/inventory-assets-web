# Task 4 Brief: Backend - Import Service

## Task Description

Create `backend/src/services/importService.ts` with import business logic.

## Interfaces

```typescript
interface ImportPreview {
  totalRows: number;
  devicesBaru: number;
  devicesUpdated: number;
  duplikatDalamFile: number;
  regionalsBaru: number;
  districtsBaru: number;
  clustersBaru: number;
  locationsBaru: number;
  errors: string[];
}

interface ImportResult {
  newDevices: number;
  updatedDevices: number;
  newLocations: number;
  totalProcessed: number;
  errors: string[];
}

async function generateImportPreview(data: ParsedRow[], mode: 'upsert' | 'replace', prisma: PrismaClient): Promise<ImportPreview>

async function executeImport(data: ParsedRow[], mode: 'upsert' | 'replace', prisma: PrismaClient): Promise<ImportResult>
```

## Requirements

### 1. Duplicate Detection
- Detect duplicates within CSV file using `code` + `label_code` as key
- Return count of duplicates found

### 2. Preview Generation
- Count new vs existing devices (check by deviceCode)
- Count new hierarchy items (regional, district, cluster, location)

### 3. Execute Import
- **Mode 'upsert'**: Insert new, update existing (by deviceCode)
- **Mode 'replace'**: Delete all devices + locations, then insert all
- Upsert hierarchy: regional → district → cluster → location
- Upsert device: create or update based on deviceCode
- Process in batches of 100 for performance

### 4. Catu Daya Types
```typescript
const CATU_DAYA_TYPES = [
  'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
  'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
  'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
  'TRAFO', 'ATS', 'AMF'
];
```

### 5. Hierarchy Default Values
- region → 'REGIONAL DEFAULT' if empty
- district → 'DISTRICT DEFAULT' if empty
- cluster/organization_name → 'CLUSTER DEFAULT' if empty

## Dependencies

- Task 2 (fileParser - ParsedRow type)
- Task 3 (modernization - not used here, just categorization types)

## Work Directory

D:\project Coding\Inventory-assets-program\backend

## Test File Location

Create test at: `backend/src/services/__tests__/importService.test.ts`
