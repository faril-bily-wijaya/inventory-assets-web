# Laporan Task: Perbaikan Klasifikasi Catu Daya

## Status: Selesai
## Waktu: 2026-07-02

## Ringkasan Perubahan
1. **Modifikasi File**: `frontend/src/utils/deviceType.ts`
2. **Detail Perubahan**: 
   - Memperbarui fungsi `isCatuDaya` agar menyertakan semua kata kunci tipe perangkat (Catu Daya) sesuai spesifikasi desain `2026-07-01-import-data-design.md` (bagian 7.1 Catu Daya) dan backend `importService.ts`.
   - Menambahkan kata kunci baru: `'BATSTARTER', 'BATBASAH', 'BATKERING', 'TANGKIBBM', 'DCPDB', 'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL', 'TRAFO', 'AMF'`.
   - Mempertahankan kata kunci legacy/fallback yang lama (`'BATTERE', 'TANGKI', 'PDB'`) agar kompatibel dengan data yang mungkin masih ada sebelum spesifikasi baru.

## Dampak (Impact)
Sekarang, jika pengguna mengunggah CSV yang berisi tipe perangkat baru tersebut (misalnya `BATKERING` atau `TRAFO`), *frontend* akan dapat mendeteksinya secara tepat sebagai Catu Daya, dan menyortirnya dengan benar pada panel maupun di pop-up peta (Map View).
