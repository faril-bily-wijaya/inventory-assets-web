# Laporan Task 9.4: Backend API CRUD Updates

## Apa yang dilakukan:
1. **Memperbarui Rute Perangkat (`backend/src/routes/devices.routes.ts`)**
   - Menambahkan field baru ke `deviceSchema` Zod (seperti `ruanganCode`, `ruanganLuas`, `labelCode`, `satuanKapasitas`, `jenisTegangan`, dll) yang akan diterima dari permintaan HTTP (POST dan PUT).
   - Memperbaiki `POST /api/devices` untuk menyisipkan nilai (*mapping*) secara eksplisit dari `camelCase` di _request body_ ke `snake_case` yang digunakan Prisma.
   - Memperbaiki `PUT /api/devices/:id` dengan logika yang sama.

2. **Memperbarui Rute Lokasi (`backend/src/routes/locations.routes.ts`)**
   - Menambahkan field baru ke `locationSchema` Zod (seperti `siteCode`, `territory`, `teknisi`, `uuid`, dll).
   - Memperbarui `GET /api/locations/map-data` agar mengembalikan `site_code` dan `teknisi` di dalam *markers* yang dikirimkan ke frontend (penting untuk tampilan popup baru).
   - Memperbaiki *bug* pada `POST` dan `PUT /api/locations` yang sebelumnya memberikan properti `camelCase` langsung ke operasi Prisma. Sekarang ia akan membuat objek pembaruan (*update object*) yang di-*mapping* secara eksplisit menjadi `snake_case`.
   - Menyesuaikan `GET /api/locations/:id/devices` untuk mengubah rujukan dari field lama `room` menjadi `ruangan_name`.

## Status
Selesai (Completed). Seluruh fungsionalitas CRUD di sisi backend sekarang mendukung skema yang diperluas dengan *flattened data* dan dapat diakses dengan baik oleh *frontend*.

## Next Step
- Melanjutkan ke Task 9.5: Memperbarui tipe (Types) pada Frontend agar sesuai dengan format *response* API yang baru.
