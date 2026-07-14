# Rencana Implementasi: Fitur CRUD Lokasi (STO/Site)

## Deskripsi Tujuan
Mengimplementasikan kemampuan Create, Read, Update, Delete (CRUD) untuk entitas **Lokasi (STO/Site)** melalui antarmuka web, sehingga pengguna tidak lagi dibatasi hanya pada import Excel untuk mengelola data koordinat dan informasi site.

## Analisis Sistem Saat Ini
- **Backend:** `locations.routes.ts` saat ini hanya melayani GET (mengambil data lokasi dan data peta). *Endpoint* untuk POST, PUT, dan DELETE belum tersedia.
- **Frontend (Services):** `locationService.ts` anehnya sudah memiliki definisi fungsi `createLocation`, `updateLocation`, dan `deleteLocation`, tetapi akan *error* (404 Not Found) jika digunakan karena *endpoint* backend-nya tidak ada.
- **Frontend (UI):** `LocationsManagementPage.tsx` saat ini menampilkan pesan *error* (toast) ketika pengguna menekan tombol Tambah/Edit/Hapus pada tab Lokasi.

## Rencana Perubahan & Pembuatan

### 1. Pembaruan Layanan API Backend (`backend/src/routes/locations.routes.ts`)
- Tambahkan *endpoint* `POST /` untuk membuat lokasi baru (menyimpan koordinat, clusterId, dll).
- Tambahkan *endpoint* `PUT /:id` untuk memperbarui data lokasi.
- Tambahkan *endpoint* `DELETE /:id` untuk menghapus lokasi.
- Selipkan fungsi pembersihan *cache* (`invalidateLocationsCache`) setiap kali ada perubahan data.

### 2. Pembuatan Komponen Modal Baru
- `frontend/src/components/modals/LocationFormModal.tsx`
  - Buat modal khusus yang berisi *form* lebih lengkap dibandingkan `HierarchyModal`.
  - Kolom masukan meliputi: Nama Lokasi, Kode STO/Site, Latitude, Longitude, Cluster (Dropdown), Class Type, Alamat, Wilayah (Territory), dan Teknisi.

### 3. Pembaruan Halaman UI (`frontend/src/pages/LocationsManagementPage.tsx`)
- Integrasikan `LocationFormModal.tsx`.
- Hubungkan fungsi Tambah, Edit, dan Hapus di tab "Lokasi (STO/Site)" agar tidak lagi memunculkan pesan peringatan "segera hadir", melainkan mengeksekusi operasi ke *backend*.
