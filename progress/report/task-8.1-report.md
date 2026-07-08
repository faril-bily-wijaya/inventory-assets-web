# Laporan Task 8.1: Global Navigation Sidebar

## Apa yang dilakukan:
1. **Membuat Komponen Navigasi Baru (`SidebarNav.tsx`)**
   - Menggunakan `react-router-dom` (`NavLink`) untuk menangani perpindahan antar halaman tanpa memuat ulang (reload).
   - Menyediakan tautan ke `Dashboard`, `Devices`, dan `Settings`.
   - Menambahkan gaya visual (styling) dinamis berdasarkan status rute aktif (opsi yang aktif akan disorot warna cyan).

2. **Memperbarui Komponen Halaman**
   - Meneruskan `<SidebarNav />` ke properti `sidebar` milik komponen `PageContainer` di `DashboardPage.tsx` dan `DevicesPage.tsx`.

3. **Membuat Halaman Settings Baru (`SettingsPage.tsx`)**
   - Membuat halaman profil kosong yang mengambil data pengguna melalui `useAuth`.
   - Mengintegrasikan halaman ini ke dalam router utama di `App.tsx` agar URL `/settings` dapat diakses.

## Status:
Selesai dan berfungsi. Pengguna kini dapat menggunakan Sidebar untuk berpindah halaman secara dinamis.
