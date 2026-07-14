# Task 1: Update Backend Parser untuk Genset Mobile

**Tujuan:**
Mengubah `backend/src/utils/fileParser.ts` agar saat `importType === 'genset'`, ia juga membaca kolom:
- Latitude
- Longitude
- STO (dipetakan ke `site_name`)
- Area, Regional, Cluster (sebagai tambahan jika ada)

**Status:** DONE
