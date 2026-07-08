# Report Task 10: Genset Mobile Specialized Feature

## Deskripsi
Implementasi fitur khusus untuk manajemen Genset Mobile dan Dummy Load dengan menyediakan halaman antarmuka yang terdedikasi, serta modal *quick edit* yang memudahkan pemindahan lokasi (*STO*) dan pergantian status.

## Langkah yang Dilakukan:
1. **Backend Routing Update (`devices.routes.ts`)**
   - Mengubah logika pencarian tipe perangkat (`deviceType`) agar bisa menerima *multiple types* menggunakan pemisah koma (contoh: `Genset Mobile,Dummy Load`), dengan mengurai *string* menjadi fungsi *in* di Prisma.
2. **Halaman Khusus Genset (`GensetMobilePage.tsx`)**
   - Membuat halaman baru dengan struktur tabel yang berfokus pada informasi mobilitas (Lokasi / STO saat ini).
   - Menambahkan filter *dropdown* untuk Lokasi dan Status yang mencakup opsi "IDLE", "INTEGRASI", dll.
3. **Modal Edit Cepat (`QuickEditGensetModal.tsx`)**
   - Membuat pop-up khusus Genset yang memuat form minimalis, hanya terdiri dari pemilihan Lokasi STO, Status Operasional, dan Kondisi Fisik.
   - Pop-up ini langsung mengirimkan `updateDevice` ketika disimpan.
4. **Modifikasi Rute & Navigasi (`App.tsx`, `SidebarNav.tsx`, `DashboardSidebar.tsx`)**
   - Mengintegrasikan rute `/genset-mobile`.
   - Menambahkan ikon menu "Genset Mobile" dengan logo petir (`Zap`) agar mudah diakses.
5. **Penyesuaian UI Badge (`Badge.tsx`, `DeviceModal.tsx`)**
   - Menambahkan varian baru `info` untuk warna lencana biru terang khusus status "INTEGRASI".
   - Menambahkan `IDLE`, `INTEGRASI`, dan `RUSAK` ke dalam opsi *DeviceModal* secara global.

## Hasil
Manajemen perangkat *mobile* sekarang tidak lagi bercampur dengan ribuan perangkat diam. Admin bisa mengontrol logistik pergerakan genset dengan dua klik dari tabel *Genset Mobile*.
