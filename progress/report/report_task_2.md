# Report Task 2: Update Export Data

**Waktu Selesai**: 2026-07-14

**Apa yang telah dilakukan**:
- Memperbarui fitur *Export ke Excel* (`downloadCSV`) pada file `frontend/src/components/map/LocationTableModal.tsx`.
- Menyusun ulang urutan atribut (keys) di dalam fungsi `rows.map()` agar berurutan secara persis dengan spesifikasi kolom standar baru, yang diawali dengan properti geolokasi (`area`, `regional`, `district`, `cluster`, `site_name`, `site_code`, `address`, `latitude`, `longitude`, `class_type`, `teknisi`), lalu diikuti dengan profil perangkat dan kelistrikan.
- Menempatkan kolom metadata *internal* (seperti `id`, `uuid`, `organization_uuid`, `created_at`, `updated_at`, `location_id`, `butuh_modernisasi`, `alasan_modernisasi`) di paling akhir deretan kolom tabel Excel agar tidak mengganggu fokus pengguna.
- Output hasil Export sekarang akan sejalan dan seragam dengan Template Import dan Parser Data.

**Status Keseluruhan**: Sukses!
Seluruh modifikasi telah selesai sesuai dengan *plan* penyelarasan format tabel antara Export dan Template.
