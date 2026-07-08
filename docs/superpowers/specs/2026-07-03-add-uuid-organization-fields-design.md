# Design: Penambahan Field UUID & Organization ke Devices

**Date:** 2026-07-03
**Status:** Approved

## Overview

Menambahkan 4 field baru ke tabel `devices` untuk menyimpan UUID dan informasi organisasi yang berasal dari file CSV `data-perangkat.csv`.

## Database Changes

### Prisma Schema Update

**File:** `backend/prisma/schema.prisma`

Tambahkan 4 field baru ke model `devices`:

```prisma
model devices {
  // ... existing fields ...

  uuid               String?   @map("uuid") @db.Uuid
  organization_name  String?   @map("organization_name") @db.VarChar(255)
  organization_uuid  String?   @map("organization_uuid") @db.Uuid
  organization_sname String?   @map("organization_sname") @db.VarChar(50)

  @@map("devices")
}
```

### Migration

Run Prisma migration untuk apply perubahan ke database:
```bash
cd backend
npx prisma migrate dev --name add_organization_fields_to_devices
```

## Backend Changes

### 1. importService.ts

**File:** `backend/src/services/importService.ts`

Update function `mapDeviceData()` untuk include field baru:

```typescript
function mapDeviceData(row: ParsedRow, location_id: string) {
  return {
    // ... existing fields ...
    uuid: normalise(row.uuid) || null,
    organization_name: normalise(row.organization_name) || null,
    organization_uuid: normalise(row.organization_uuid) || null,
    organization_sname: normalise(row.organization_sname) || null,
  }
}
```

### 2. fileParser.ts

**File:** `backend/src/utils/fileParser.ts`

Field-field ini sudah di-parse di `ParsedRow` interface (lines 62-64):
- `uuid`
- `organization_uuid`
- `organization_sname`

`organization_name` diambil dari field `organization_name` yang sudah ada.

## Frontend Changes

### 1. types/index.ts

**File:** `frontend/src/types/index.ts`

Tambahkan ke interface `Device`:

```typescript
export interface Device {
  // ... existing fields ...
  uuid?: string
  organizationName?: string
  organizationUuid?: string
  organizationSname?: string
}
```

### 2. DeviceModal.tsx

**File:** `frontend/src/components/modals/DeviceModal.tsx`

Tambahkan form fields baru:
- UUID (readonly atau editable)
- Organization Name
- Organization UUID
- Organization Short Name

### 3. DevicesPage.tsx

**File:** `frontend/src/pages/DevicesPage.tsx`

Tambahkan kolom tabel baru untuk display field organization.

## Template Update

### template_import.csv

**File:** `backend/template_import.csv`

Tambahkan kolom baru:
- uuid
- organization_name
- organization_uuid
- organization_sname

## Implementation Order

1. Update Prisma schema
2. Run migration
3. Update backend (importService.ts)
4. Update frontend types
5. Update DeviceModal.tsx
6. Update DevicesPage.tsx
7. Update template_import.csv

## Notes

- Semua field baru adalah nullable
- Data berasal dari file CSV `data-perangkat.csv`
- Field-field ini berguna untuk tracking dan integritas data
