# Rencana Implementasi: Manajemen Master Data Lokasi

## Deskripsi Tujuan
Membuat antarmuka Manajemen Master Data Lokasi (Area, Regional, District, Cluster, dan STO/Site) yang memungkinkan operasi CRUD (Create, Read, Update, Delete) secara penuh melalui UI. Hal ini bertujuan untuk melepaskan ketergantungan pada proses *upload* Excel jika hanya ingin menambahkan atau mengoreksi data wilayah.

## Struktur Direktori Sesuai Aturan User
Sesuai instruksi alur kerja (workflow) Anda:
1. Rencana (file ini) telah dibuat di folder `progress`.
2. Folder `progress/task` dan `progress/report` akan digunakan untuk memecah tugas jika Anda menyetujui rencana ini.

## Analisis Sistem Saat Ini
- **Backend:** `hierarchy.routes.ts` dan `locations.routes.ts` sudah memiliki *endpoint* API untuk operasi CRUD lengkap. Namun, *cache* mungkin perlu dikelola (invalidate) jika terjadi perubahan hierarki yang berdampak besar.
- **Frontend (Services):** `locationService.ts` saat ini hanya memiliki fungsi untuk POST (Create) pada Area, Regional, District, Cluster, namun fungsi untuk PUT (Update) dan DELETE masih belum didefinisikan.
- **Frontend (UI):** Belum ada halaman khusus untuk Manajemen Lokasi.

## Rencana Perubahan & Pembuatan

### 1. Pembaruan Layanan API Frontend (`frontend/src/services/locationService.ts`)
- Tambahkan fungsi `updateArea`, `deleteArea`, `updateRegional`, `deleteRegional`, dll.

### 2. Halaman UI Baru (`frontend/src/pages/LocationsManagementPage.tsx`)
- Buat halaman baru dengan antarmuka berbasis **Tabs (Tab)** untuk memisahkan:
  - Tab Area
  - Tab Regional
  - Tab District
  - Tab Cluster
  - Tab Lokasi (STO/Site)
- Di setiap Tab akan menampilkan tabel data (menggunakan komponen standar yang ada).
- Di setiap Tab, tambahkan tombol **"+ Tambah"** yang akan membuka Modal form.

### 3. Pembuatan Modal CRUD
- `frontend/src/components/modals/HierarchyModal.tsx` 
  - Modal dinamis untuk menginput nama Area/Regional/District/Cluster.
  - Jika menambah Regional, otomatis akan ada *dropdown* pilihan Area (dan seterusnya ke bawah).

### 4. Integrasi ke Sistem
- `frontend/src/App.tsx`
  - Daftarkan *routing* baru: `<Route path="/locations" element={<LocationsManagementPage />} />`
- `frontend/src/components/sidebar/DashboardSidebar.tsx`
  - Tambahkan menu navigasi "Manajemen Lokasi" dengan ikon peta/database di bawah menu "Perangkat".
