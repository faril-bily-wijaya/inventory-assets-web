# Laporan Task 8.3: Devices Page Advanced Filters

## Apa yang dilakukan:
1. **Menambahkan Komponen Filter Lanjutan (`DevicesPage.tsx`)**
   - Menggunakan komponen `Select` yang sudah ada untuk menambahkan filter *Status* (Active, Warning, Critical, Inactive) dan *Lokasi* (Regional/Cluster).
   - Menyusun ulang antarmuka pencarian agar kolom teks, pilihan *Status*, dan *Lokasi* tampil responsif dan rapi secara sejajar atau vertikal tergantung resolusi layar.

2. **Integrasi ke Backend**
   - Menyimpan *state* untuk `statusFilter` dan `locationFilter`.
   - Menambahkan properti tersebut ke dalam objek `filters` yang diteruskan pada saat pemanggilan `deviceService.getDevices(filters)`.
   - Filter ini kini aktif dan akan langsung me-*reload* daftar perangkat saat diklik atau saat menekan tombol pencarian.

## Status:
Selesai dan berfungsi. Pengguna kini memiliki kemampuan pencarian tingkat lanjut di halaman `Devices` untuk mempermudah mencari perangkat yang rusak atau berada pada lokasi tertentu.
