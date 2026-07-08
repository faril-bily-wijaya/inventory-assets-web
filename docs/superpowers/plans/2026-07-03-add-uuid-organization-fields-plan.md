# Add UUID & Organization Fields to Devices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new fields (uuid, organization_name, organization_uuid, organization_sname) to the devices table and update all related frontend/backend code.

**Architecture:** Add new nullable string fields to the devices table. Update import service to map new CSV fields. Update frontend types and UI components.

**Tech Stack:** Prisma ORM, PostgreSQL, React, TypeScript

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `backend/prisma/schema.prisma` | Modify | Add 4 fields to devices model |
| `backend/src/services/importService.ts` | Modify | Update mapDeviceData function |
| `frontend/src/types/index.ts` | Modify | Add fields to Device interface |
| `frontend/src/components/modals/DeviceModal.tsx` | Modify | Add form fields for new data |
| `frontend/src/pages/DevicesPage.tsx` | Modify | Add table columns |
| `backend/template_import.csv` | Modify | Add new columns to template |

---

## Task 1: Update Prisma Schema

**Files:**
- Modify: `backend/prisma/schema.prisma:102-141`

**Action:** Add 4 new nullable fields to the `devices` model.

```prisma
model devices {
  id               String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  device_code      String?   @unique @map("device_code") @db.VarChar(100)
  device_name      String    @map("device_name") @db.VarChar(255)
  device_type      String    @map("device_type") @db.VarChar(50)
  brand            String?   @map("brand") @db.VarChar(100)
  model            String?   @map("model") @db.VarChar(100)
  serial_number    String?   @map("serial_number") @db.VarChar(100)
  label_code       String?   @map("label_code") @db.VarChar(100)
  kapasitas        String?   @map("kapasitas") @db.VarChar(50)
  satuan_kapasitas String?  @map("satuan_kapasitas") @db.VarChar(20)
  year             Int?      @map("year")
  usia_perangkat   Int?      @map("usia_perangkat")
  status           String    @default("OPERATIONAL") @map("status") @db.VarChar(30)
  condition        String?   @map("condition") @db.VarChar(50)
  cap_real         String?   @map("cap_real") @db.VarChar(50)
  jenis_tegangan   String?  @map("jenis_tegangan") @db.VarChar(20)
  beban_arus       Float?   @map("beban_arus")
  satuan_beban     String?  @map("satuan_beban") @db.VarChar(20)
  keterangan       String?   @map("keterangan") @db.Text
  ruangan_code     String?   @map("ruangan_code") @db.VarChar(100)
  ruangan_name     String?   @map("ruangan_name") @db.VarChar(255)
  ruangan_panjang  Float?   @map("ruangan_panjang")
  ruangan_lebar    Float?   @map("ruangan_lebar")
  ruangan_tinggi   Float?   @map("ruangan_tinggi")
  ruangan_luas     Float?   @map("ruangan_luas")
  rack_code        String?   @map("rack_code") @db.VarChar(100)
  rack_name        String?   @map("rack_name") @db.VarChar(255)
  rack_panjang     Float?   @map("rack_panjang")
  rack_lebar       Float?    @map("rack_lebar")
  rack_tinggi      Float?    @map("rack_tinggi")
  rack_luas        Float?    @map("rack_luas")
  uuid             String?   @map("uuid") @db.Uuid
  organization_name String?  @map("organization_name") @db.VarChar(255)
  organization_uuid String?  @map("organization_uuid") @db.Uuid
  organization_sname String? @map("organization_sname") @db.VarChar(50)
  location_id      String    @map("location_id") @db.Uuid
  created_at       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updated_at       DateTime  @default(now()) @map("updated_at") @db.Timestamptz(6)
  deleted_at       DateTime? @map("deleted_at") @db.Timestamptz(6)
  locations        locations @relation(fields: [location_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@map("devices")
}
```

**Run Migration:**
```bash
cd backend
npx prisma migrate dev --name add_organization_fields_to_devices
```

- [ ] **Step 1: Edit schema.prisma**

Add the 4 fields (uuid, organization_name, organization_uuid, organization_sname) to the devices model before `location_id`. Use the exact field definitions shown above.

- [ ] **Step 2: Run Prisma migration**

Run: `npx prisma migrate dev --name add_organization_fields_to_devices`
Expected: Migration created successfully

- [ ] **Step 3: Generate Prisma client**

Run: `npx prisma generate`
Expected: Generated client with new fields

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma
git commit -m "feat: add uuid and organization fields to devices table"
```

---

## Task 2: Update Import Service

**Files:**
- Modify: `backend/src/services/importService.ts:87-121`

**Action:** Update `mapDeviceData()` function to include the 4 new fields.

- [ ] **Step 1: Edit mapDeviceData function**

In `backend/src/services/importService.ts`, find the `mapDeviceData` function and add these fields after `rack_luas`:

```typescript
uuid: normalise(row.uuid) || null,
organization_name: normalise(row.organization_name) || null,
organization_uuid: normalise(row.organization_uuid) || null,
organization_sname: normalise(row.organization_sname) || null,
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/importService.ts
git commit -m "feat: map uuid and organization fields during import"
```

---

## Task 3: Update Frontend Types

**Files:**
- Modify: `frontend/src/types/index.ts:82-119`

**Action:** Add 4 new optional fields to the `Device` interface.

- [ ] **Step 1: Edit Device interface**

In `frontend/src/types/index.ts`, add these fields to the `Device` interface (after `location` or before `createdAt`):

```typescript
export interface Device {
  id: string
  deviceCode: string
  deviceName: string
  deviceType: string
  brand?: string
  model?: string
  serialNumber?: string
  labelCode?: string
  kapasitas?: string
  satuanKapasitas?: string
  year?: number
  usiaPerangkat?: number
  ruanganCode?: string
  ruanganName?: string
  ruanganPanjang?: number
  ruanganLebar?: number
  ruanganTinggi?: number
  ruanganLuas?: number
  rackCode?: string
  rackName?: string
  rackPanjang?: number
  rackLebar?: number
  rackTinggi?: number
  rackLuas?: number
  status: DeviceStatus
  condition?: string
  capReal?: string
  jenisTegangan?: string
  bebanArus?: number
  satuanBeban?: string
  keterangan?: string
  uuid?: string
  organizationName?: string
  organizationUuid?: string
  organizationSname?: string
  locationId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  location?: Location
}
```

Also update `DeviceFormData` interface with the same 4 fields.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: add uuid and organization fields to Device types"
```

---

## Task 4: Update DeviceModal

**Files:**
- Modify: `frontend/src/components/modals/DeviceModal.tsx:1-204`

**Action:** Add form fields for the 4 new organization fields.

- [ ] **Step 1: Add new fields to deviceSchema**

In `DeviceModal.tsx`, add to the `deviceSchema` z.object:

```typescript
uuid: z.string().optional(),
organizationName: z.string().optional(),
organizationUuid: z.string().optional(),
organizationSname: z.string().optional(),
```

- [ ] **Step 2: Add defaultValues**

In the `useForm` defaultValues, add the 4 new fields:

```typescript
uuid: device?.uuid,
organizationName: device?.organizationName,
organizationUuid: device?.organizationUuid,
organizationSname: device?.organizationSname,
```

- [ ] **Step 3: Add form fields to JSX**

Add a new section in the form (after the Location selector or in a new section) with these fields:

```tsx
<div className="border-t border-[var(--border)] pt-4 mt-4">
  <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Organization Info</h3>
  <div className="grid grid-cols-2 gap-4">
    <Input
      label="UUID"
      placeholder="deab2cef-..."
      {...register('uuid')}
    />
    <Input
      label="Organization Short Name"
      placeholder="C_PKLP"
      {...register('organizationSname')}
    />
  </div>
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Input
      label="Organization Name"
      placeholder="CLUSTER PANGKAL PINANG"
      {...register('organizationName')}
    />
    <Input
      label="Organization UUID"
      placeholder="549f33c7-..."
      {...register('organizationUuid')}
    />
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/modals/DeviceModal.tsx
git commit -m "feat: add organization fields to DeviceModal form"
```

---

## Task 5: Update DevicesPage Table

**Files:**
- Modify: `frontend/src/pages/DevicesPage.tsx:214-366`

**Action:** Add table column for Organization data.

- [ ] **Step 1: Add new table column**

Find the `<thead>` section and add a new `<th>` for Organization (after Location column):

```tsx
<th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Organization</th>
```

Find the `<tbody>` section in the device row rendering and add a new `<td>`:

```tsx
<td className="p-4 text-sm text-[var(--text-secondary)]">
  {device.organizationSname ? (
    <div className="flex flex-col">
      <span className="font-medium text-[var(--text-primary)]">{device.organizationSname}</span>
      {device.organizationName && (
        <span className="text-xs opacity-75">{device.organizationName}</span>
      )}
    </div>
  ) : '-'}
</td>
```

**Note:** Position this column before or after Location column. Adjust `colSpan` in empty state rows if needed.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DevicesPage.tsx
git commit -m "feat: add organization column to devices table"
```

---

## Task 6: Update Template CSV

**Files:**
- Modify: `backend/template_import.csv`

**Action:** Add 4 new columns to the import template.

- [ ] **Step 1: Update template**

Add these columns to the header row (after `teknisi`):
```
uuid,organization_name,organization_uuid,organization_sname
```

- [ ] **Step 2: Update sample data rows**

Add placeholder values for the new columns in each sample row:
```
deab2cef-20a9-4a6d-98a1-af0361cd88ee,CLUSTER PALEMBANG,549f33c7-aac5-4059-a150-3e4c52239557,C_PLMB
```

- [ ] **Step 3: Commit**

```bash
git add backend/template_import.csv
git commit -m "feat: add organization columns to import template"
```

---

## Summary

| Task | Status | Files |
|------|--------|-------|
| 1. Prisma Schema | Pending | `backend/prisma/schema.prisma` |
| 2. Import Service | Pending | `backend/src/services/importService.ts` |
| 3. Frontend Types | Pending | `frontend/src/types/index.ts` |
| 4. DeviceModal | Pending | `frontend/src/components/modals/DeviceModal.tsx` |
| 5. DevicesPage Table | Pending | `frontend/src/pages/DevicesPage.tsx` |
| 6. Template CSV | Pending | `backend/template_import.csv` |

## Testing Checklist

After all tasks complete:
- [ ] Import CSV with new fields works correctly
- [ ] New devices show UUID and organization data
- [ ] Edit device modal shows organization fields
- [ ] Devices table displays organization column
- [ ] Template download includes new columns
