# Laporan Task 9.1: Database Schema Overhaul

## Apa yang dilakukan:
1. **Pembaruan Skema Prisma (`backend/prisma/schema.prisma`)**
   - Menambahkan field baru ke tabel `locations`: `site_code`, `territory`, `teknisi`, `uuid`, `organization_uuid`, `organization_sname`.
   - Melakukan metode *flattening* untuk informasi ruangan dan rak langsung ke dalam tabel `devices` (`ruangan_code`, `ruangan_name`, `ruangan_panjang`, dll serta `rack_code`, `rack_name`, dll).
   - Menambahkan detail kelistrikan ke tabel `devices`: `label_code`, `satuan_kapasitas`, `jenis_tegangan`, `beban_arus`, `satuan_beban`, `keterangan`, `usia_perangkat`.
   - Mengubah nama kolom `room` menjadi `ruangan_name`.
   - Menambahkan `@unique` ke `name` di tabel `regionals` agar sinkron dengan index database.

2. **Eksekusi Migrasi**
   - Menjalankan `npx prisma db push --accept-data-loss` untuk menerapkan perubahan skema ke Supabase secara langsung tanpa peringatan interaktif mengenai penghapusan kolom `room`.
   - Menjalankan `npx prisma generate` untuk memperbarui tipe TypeScript Prisma Client.

## Status
Selesai (Completed). Basis data kini siap untuk menerima ke-43 kolom dari data mentah `data-perangkat.csv`.

## Next Step
- Melanjutkan ke Task 9.2: Memperbarui fungsi parser file (`fileParser.ts`) agar validasinya sesuai dengan perubahan skema di atas dan mampu membaca ke-43 kolom tersebut.
