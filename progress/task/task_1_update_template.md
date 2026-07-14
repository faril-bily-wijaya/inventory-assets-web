# Task 1: Update Template Import

**Status**: `[x]` Selesai

**Tujuan**:
Memperbarui endpoint `/api/devices/import/template` di `backend/src/routes/devices.routes.ts` agar mengeluarkan file Excel dengan:
1. Nama kolom (header) dalam bahasa Inggris sesuai standar parser (`device_code`, `site_name`, dsb).
2. Urutan kolom dimulai dari informasi lokasi (`area`, `regional`, dsb) lalu detail perangkat, spesifikasi, dan status.

**Langkah-langkah**:
- Buka file `backend/src/routes/devices.routes.ts`.
- Cari endpoint `// GET /api/devices/import/template`.
- Ubah objek `templateData` dengan susunan properti yang baru.
- Simpan perubahan.
