# Spec: Import Data & Map Popup Enhancement

## Project: TIF Indonesia - Map Inventory Asset Management

## Tanggal: 2026-07-01

---

## 1. Overview

Fitur untuk import data perangkat via file CSV/XLSX dan enhancement popup map untuk menampilkan daftar perangkat per lokasi dengan kategorisasi Catu Daya dan Non-Catu Daya.

---

## 2. Lokasi Fitur UI

### 2.1 Devices Page Tabs
- Tab "Daftar" → halaman existing devices (list view)
- Tab "Import" → halaman upload data

### 2.2 Import Page Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Daftar] [Import]                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                   │    │
│  │        📁 Drag & Drop File Disini               │    │
│  │           atau klik untuk pilih file             │    │
│  │           Mendukung .csv dan .xlsx               │    │
│  │                                                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Tambah Data] [Ganti Semua] (radio/pill toggle)         │
│                                                          │
│  [📥 Download Template XLSX]                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Alur Upload

```
1. User upload file (CSV/XLSX)
          ↓
2. Validasi format file
   - ✅ valid → lanjut
   - ❌ invalid → error toast "Format file tidak valid. Gunakan .csv atau .xlsx"
          ↓
3. Parse file & mapping kolom
          ↓
4. Deteksi duplikat dalam file CSV itu sendiri
          ↓
5. Tampilkan Preview Summary:
   ┌────────────────────────────────────────────┐
   │  📊 Preview Import Data                     │
   │                                             │
   │  • Total Baris: 150                        │
   │  • Devices Baru: 120                       │
   │  • Duplikat (dalam file): 30              │
   │                                             │
   │  Hierarchy Changes:                          │
   │  • Regionals baru: 1                        │
   │  • Districts baru: 5                         │
   │  • Clusters baru: 12                        │
   │  • Locations baru: 25                       │
   │                                             │
   │  [Batal]  [Konfirmasi Upload]              │
   └────────────────────────────────────────────┘
          ↓
6. User klik "Konfirmasi Upload"
   - Jika Mode = Ganti Semua → muncul Hard Confirmation Modal
          ↓
7. Proses Import (dengan Transaction):
   - Mode Ganti: TRUNCATE devices + locations
   - Upsert hierarchy (Regional → District → Cluster → Location)
   - Upsert devices (insert/update berdasarkan code)
          ↓
8. Tampilkan hasil akhir via toast notification
```

---

## 4. Mode Upload

### 4.1 Mode Tambah/Update (Upsert)
- Insert data baru
- Jika `code` + `label_code` sudah ada → update semua field dengan data dari CSV

### 4.2 Mode Timpa Total (Replace All)
- Truncate tabel `devices` dan `locations`
- Hierarchy (regional/district/cluster) tetap
- Insert semua data dari CSV
- **Wajib cek duplikat dalam file CSV itu sendiri** saat preview

### 4.3 Hard Confirmation (Replace All Only)
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ PERINGATAN: DATA AKAN DIHAPUS!                      │
│                                                          │
│  Anda akan menghapus seluruh data perangkat dan lokasi.  │
│  Data yang dihapus tidak dapat dikembalikan.             │
│                                                          │
│  Ketik "HAPUS DATA" untuk melanjutkan:                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Batal]                                    [Konfirmasi] │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Duplicate Detection

- **Primary Key**: `code` + `label_code` (kombinasi unik perangkat)
- **Dalam file CSV**: Tandai baris duplikat saat preview
- **Dalam database** (mode Upsert): Update jika ditemukan

---

## 6. Mapping Kolom

### 6.1 Hierarchy Mapping

| CSV Column      | Database Field     |
|-----------------|-------------------|
| region          | Regional.name      |
| district        | District.name     |
| organization_name / cluster | Cluster.name |
| sites_name      | Location.name     |
| latitude        | Location.latitude |
| longitude       | Location.longitude|
| address         | Location.address  |
| class_type      | Location.classType|

### 6.2 Device Mapping

| CSV Column      | Database Field    |
|-----------------|-------------------|
| code            | deviceCode        |
| name            | deviceName        |
| label_code      | serialNumber      |
| jenis           | deviceType        |
| merk            | brand             |
| tahun_operasi   | year              |
| status          | status            |
| kondisi         | condition         |
| kapasitas       | kapasitas         |
| jenis_tegangan  | capReal           |
| ruangan_name    | room              |
| teknisi         | technicians       |

---

## 7. Device Type Categorization

### 7.1 Catu Daya
- Genset
- BATSTARTER (Battery Starter)
- BATBASAH (Battery Basah - VLA)
- BATKERING (Battery Kering - VRLA)
- Rectifier
- Inverter
- UPS
- MDP
- AVR
- TANGKIBBM
- DCPDB
- ACPDB
- DCPDBSTANDING
- ACPDBSTANDING
- ELECTRICALPANEL
- TRAFO
- ATS
- AMF

### 7.2 Non-Catu Daya
- ACSPLIT
- ACSTANDING
- OLT
- Switch
- DWDM
- Server
- PAC
- OTB
- Router
- Radio
- BRAS
- METROE (Metro Ethernet)
- NODEBROADBAND
- FTM (Fiber Termination Module)
- RTU (Remote Terminal Unit)
- ONT (Optical Network Terminal)
- OS
- OTN (Optical Transport Network)
- SDH (Synchronous Digital Hierarchy)
- FIRESUPPRESSION
- LEGACY
- ODF (Optical Distribution Frame)

---

## 8. Modernization Logic (On-The-Fly)

**Dihitung saat API dipanggil, tidak disimpan di database.**

```typescript
function hitungButuhModernisasi(deviceType: string, tahunOperasi: number): boolean {
  const umur = currentYear - tahunOperasi;
  
  // AC (semua jenis)
  if (['ACSPLIT', 'ACSTANDING'].includes(deviceType)) {
    return umur > 15;
  }
  
  // Rectifier
  if (deviceType === 'RECTIFIER') {
    return umur > 15;
  }
  
  // Battery Kering (VRLA)
  if (deviceType === 'BATKERING') {
    return umur > 10;
  }
  
  // Battery Basah (VLA)
  if (deviceType === 'BATBASAH') {
    return umur > 20;
  }
  
  // Genset
  if (deviceType === 'GENSET') {
    return umur > 25;
  }
  
  return false;
}
```

---

## 9. Map Popup Enhancement

### 9.1 Layout
```
┌─────────────────────────────────────────────────────────┐
│  📍 PALEMBANG CENTRUM                                   │
│  Jl. Kapten Anwar Sastro, Palembang | POP               │
│  11 perangkat                                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ Catu Daya ────────────────────────────────────┐    │
│  │  [Filter: ▼ Semua] [🔍 Cari...]                  │    │
│  │                                                   │    │
│  │  1. GENSET 01 - GENSET 1                        │    │
│  │     Code: TIF1-PGC-02-0001 | Merk: LEROY SOMER  │    │
│  │     Status: AKTIF | ⚠️ Butuh Modernisasi         │    │
│  │                                                   │    │
│  │  2. AC 01 R. RECTIFIER                          │    │
│  │     Code: TIF1-PGC-04-0000 | Merk: DAIKIN       │    │
│  │     Status: AKTIF                                │    │
│  │                                                   │    │
│  │  [Lihat 2 lainnya →]                             │    │
│  └───────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Non-Catu Daya ─────────────────────────────────┐    │
│  │  [Filter: ▼ Semua] [🔍 Cari...]                  │    │
│  │                                                   │    │
│  │  1. GPON 01-D1-PGC-2                            │    │
│  │     Code: TIF1-PGC-12-0002 | Merk: HUAWEI       │    │
│  │     Status: AKTIF                                │    │
│  │                                                   │    │
│  │  2. AC 02 R. ATS/AMF                            │    │
│  │     Code: TIF1-PGC-02-0008 | Merk: PANASONIC    │    │
│  │     Status: AKTIF | ⚠️ Butuh Modernisasi         │    │
│  │                                                   │    │
│  │  [Lihat 9 lainnya →]                             │    │
│  └───────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Optimasi Display
- Maksimal **5 items** per section (Catu Daya / Non-Catu Daya)
- Tombol "Lihat X lainnya →" → open panel/modal detail terpisah
- Lazy loading saat scroll

---

## 10. API Endpoints

### 10.1 Import Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/devices/import/preview` | Parse file & return preview stats |
| POST | `/api/devices/import` | Execute import (Upsert or Replace) |

### 10.2 Location Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/:id` | Get location with devices |
| GET | `/api/devices/by-location/:locationId` | Get devices by location (categorized) |

### 10.3 Template Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices/template` | Download XLSX template |

---

## 11. Database Changes

### 11.1 New Fields (Optional - untuk tracking import)
```prisma
model Device {
  // existing fields...
  technicians  String?   // dari kolom teknisi
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Location {
  // existing fields...
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 11.2 No Schema Change for Keterangan
- Kolom `keterangan` TIDAK ditambahkan ke schema
- Dihitung on-the-fly saat API response

---

## 12. File Processing

### 12.1 Supported Formats
- `.csv` - langsung parse
- `.xlsx` / `.xls` - convert ke JSON menggunakan xlsx library

### 12.2 Validation
```
if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
  throw new Error('Format file tidak valid. Gunakan .csv atau .xlsx');
}
```

### 12.3 Required Columns
- `code` (device code - primary identifier)
- `name` (device name)
- `sites_name` (location name)
- `jenis` (device type)
- `tahun_operasi` (year)

---

## 13. Transaction Handling

```typescript
await prisma.$transaction(async (tx) => {
  if (mode === 'REPLACE') {
    // 1. Delete all devices
    await tx.device.deleteMany({});
    
    // 2. Delete all locations
    await tx.location.deleteMany({});
  }
  
  // 3. Upsert hierarchy
  // 4. Upsert devices
}, {
  timeout: 60000, // 60 seconds timeout
  isolationLevel: 'Serializable'
});
```

### Rollback Strategy
- Jika ada error di tengah proses → automatic rollback
- Database tetap konsisten

---

## 14. Technical Stack Additions

### 14.1 Backend Dependencies
- `xlsx` - untuk parse file Excel
- `papaparse` atau `csv-parse` - untuk parse CSV
- `zod` - sudah ada, untuk validasi schema

### 14.2 Frontend Dependencies
- `xlsx` - untuk generate/download template
- `react-dropzone` atau custom drag-drop
- sudah ada: react-hook-form, zod, axios, lucide-react

---

## 15. Error Handling

| Error Type | User Message |
|------------|-------------|
| Invalid format | "Format file tidak valid. Gunakan .csv atau .xlsx" |
| Missing required columns | "File tidak memiliki kolom yang diperlukan: [list]" |
| Empty file | "File kosong atau tidak memiliki data" |
| Transaction failed | "Gagal mengimport data. Silakan coba lagi." |
| Network error | "Koneksi terputus. Periksa internet Anda." |

---

## 16. File Structure Changes

```
frontend/
├── src/
│   ├── components/
│   │   ├── import/                    # NEW
│   │   │   ├── ImportTab.tsx
│   │   │   ├── FileDropzone.tsx
│   │   │   ├── ImportPreview.tsx
│   │   │   ├── ModeSelector.tsx
│   │   │   └── ConfirmModal.tsx
│   │   ├── map/
│   │   │   ├── DevicePopup.tsx        # MODIFIED
│   │   │   └── DeviceSection.tsx     # NEW
│   │   └── modals/
│   │       └── DeviceListModal.tsx    # NEW
│   ├── services/
│   │   ├── importService.ts           # NEW
│   │   └── ...
│   ├── pages/
│   │   ├── DevicesPage.tsx           # MODIFIED - add tabs
│   │   └── ...
│   └── types/
│       └── index.ts                   # MODIFIED - add types

backend/
├── src/
│   ├── routes/
│   │   ├── devices.routes.ts         # MODIFIED - add import endpoints
│   │   ├── locations.routes.ts       # MODIFIED - add by-location endpoint
│   │   └── ...
│   ├── services/
│   │   ├── importService.ts         # NEW
│   │   ├── deviceService.ts         # NEW - import logic
│   │   └── ...
│   └── utils/
│       ├── fileParser.ts            # NEW - CSV/XLSX parser
│       └── modernization.ts         # NEW - modernization logic
├── prisma/
│   └── schema.prisma                 # NO CHANGE
```

---

## 17. Implementation Priority

1. **Phase 1: Backend Core**
   - File parser (CSV/XLSX)
   - Import preview endpoint
   - Import execute endpoint (with transaction)
   - Modernization calculation utility
   - GET devices by location endpoint

2. **Phase 2: Frontend Core**
   - Import tab UI
   - File dropzone
   - Preview modal
   - Mode selector + hard confirmation
   - Download template

3. **Phase 3: Map Enhancement**
   - Update DevicePopup component
   - Add categorization (Catu Daya / Non-Catu Daya)
   - Add filters per section
   - Add pagination (max 5 per section)
   - Device list modal

4. **Phase 4: Testing & Polish**
   - Error handling
   - Loading states
   - Toast notifications
   - Edge cases

---

## 18. Acceptance Criteria

- [ ] User dapat upload file CSV atau XLSX
- [ ] User dapat download template XLSX
- [ ] Preview menampilkan statistik yang akurat
- [ ] Mode Upsert correctly inserts/updates devices
- [ ] Mode Replace All truncates and re-inserts
- [ ] Hard confirmation modal works for Replace All
- [ ] Duplikat dalam file ditandai saat preview
- [ ] Map popup menampilkan devices dengan benar
- [ ] Devices terkategorisasi: Catu Daya & Non-Catu Daya
- [ ] Filter berfungsi per section
- [ ] Pagination (max 5) dengan "Lihat lainnya"
- [ ] "Butuh Modernisasi" dihitung on-the-fly
- [ ] Transaction rollback on error
- [ ] Error messages user-friendly
