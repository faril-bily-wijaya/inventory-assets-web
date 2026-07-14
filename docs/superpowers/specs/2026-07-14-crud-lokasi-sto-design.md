# Spesifikasi: CRUD Lokasi (STO/Site)

**Tanggal:** 2026-07-14
**Status:** Approved

## 1. Tujuan

Mengimplementasikan kemampuan CRUD lengkap untuk entitas **Lokasi (STO/Site)** pada halaman Manajemen Lokasi, sehingga pengguna dapat mengelola data site tanpa harus melalui upload Excel.

## 2. Cakupan

- Backend: Endpoint API untuk Create, Update, Delete lokasi
- Frontend: Komponen modal form dan integrasi ke halaman manajemen

## 3. Struktur Data

### Lokasi Entity Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Nama lokasi/STO |
| site_code | String | No | Kode STO/Site |
| latitude | Float | Yes | Koordinat latitude |
| longitude | Float | Yes | Koordinat longitude |
| cluster_id | UUID | Yes | Foreign key ke clusters |
| class_type | String | No | Tipe class (BASIC, dll) |
| address | String | No | Alamat lengkap |
| territory | String | No | Wilayah/Territori |
| teknisi | String | No | Nama teknisi |

## 4. API Endpoints (Backend)

### Backend: `backend/src/routes/locations.routes.ts`

#### POST /api/locations
- **Purpose:** Create lokasi baru
- **Request Body:**
```json
{
  "name": "STO Palembang",
  "site_code": "PLG01",
  "latitude": -2.9909,
  "longitude": 104.7564,
  "cluster_id": "uuid",
  "class_type": "BASIC",
  "address": "Jl. Merdeka No.1",
  "territory": "Sumbagsel",
  "teknisi": "Budi Santoso"
}
```
- **Response:** 201 Created dengan data lokasi

#### PUT /api/locations/:id
- **Purpose:** Update lokasi existing
- **Request Body:** Same as POST (partial update allowed)
- **Response:** 200 OK dengan data lokasi

#### DELETE /api/locations/:id
- **Purpose:** Soft delete lokasi (set deleted_at)
- **Response:** 200 OK

## 5. Frontend Components

### Component: `LocationFormModal.tsx`
- **Path:** `frontend/src/components/modals/LocationFormModal.tsx`
- **Props:**
  - `isOpen`: boolean
  - `onClose`: () => void
  - `location?`: Location (untuk mode edit)
  - `onSuccess`: () => void
- **Form Fields:**
  1. Nama Lokasi (Input, required)
  2. Kode STO/Site (Input, optional)
  3. Latitude (Input number, required)
  4. Longitude (Input number, required)
  5. Cluster (Select dropdown, required) - cascading dari hierarchy
  6. Class Type (Select dropdown, optional)
  7. Alamat (Textarea, optional)
  8. Territori (Input, optional)
  9. Teknisi (Input, optional)
- **Validation:** Zod schema

### Integration: `LocationsManagementPage.tsx`
- Update tab "Lokasi (STO/Site)"
- Handle Add → buka LocationFormModal
- Handle Edit → buka LocationFormModal dengan data
- Handle Delete → soft delete + refresh

## 6. Files to Modify/Create

| File | Action |
|------|--------|
| `backend/src/routes/locations.routes.ts` | Create/Update/Delete endpoints |
| `frontend/src/components/modals/LocationFormModal.tsx` | Create new |
| `frontend/src/pages/LocationsManagementPage.tsx` | Integrate modal |

## 7. Acceptance Criteria

- [ ] User dapat menambah lokasi baru melalui form modal
- [ ] User dapat edit lokasi existing
- [ ] User dapat hapus lokasi (soft delete)
- [ ] Perubahan langsung tersimpan ke database
- [ ] Tabel lokasi di-refresh setelah operasi CRUD
- [ ] Error handling untuk gagal create/update/delete
