# Task 2: Update Export Data

**Status**: `[x]` Selesai

**Tujuan**:
Memperbarui fitur Download CSV/Excel di dalam `frontend/src/components/map/LocationTableModal.tsx` agar output yang dihasilkan persis sesuai (identik dalam penamaan dan urutan) dengan Template Import.

**Langkah-langkah**:
- Buka file `frontend/src/components/map/LocationTableModal.tsx`.
- Cari fungsi `downloadCSV()` (atau fungsi export terkait).
- Ubah pemetaan objek di dalam `rows = selectedMarker.devices.map(d => ({ ... }))`.
- Sesuaikan urutan properti (keys) agar sama persis seperti di `templateData` yang ada di backend. Kolom-kolom ekstra (seperti id, uuid, created_at, updated_at) boleh dihapus, atau diletakkan di urutan paling belakang.
- Simpan perubahan.
