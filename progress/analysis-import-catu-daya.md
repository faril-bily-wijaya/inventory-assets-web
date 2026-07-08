# Analisis Isu: Data Upload CSV Tidak Tersortir dengan Benar (Catu Daya vs Non Catu Daya)

## Akar Masalah
Setelah melakukan penelusuran terhadap proses unggah CSV di *frontend* dan *backend*, ditemukan bahwa terdapat **ketidaksesuaian kriteria (keywords) antara frontend dan backend** dalam menentukan mana perangkat yang termasuk "Catu Daya" dan "Non Catu Daya".

1. Pada **Backend** (`backend/src/services/importService.ts`), terdapat daftar lengkap tipe catu daya:
   ```typescript
   export const CATU_DAYA_TYPES: readonly string[] = [
     'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
     'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
     'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
     'TRAFO', 'ATS', 'AMF',
   ]
   ```

2. Pada **Frontend** (`frontend/src/utils/deviceType.ts`), fungsi `isCatuDaya` yang digunakan untuk menyortir data di Dashboard/Peta menggunakan daftar keyword yang jauh lebih sedikit:
   ```typescript
   const catuDayaKeywords = ['GENSET', 'BATTERE', 'RECTIFIER', 'MDP', 'ATS', 'TANGKI', 'PDB', 'AVR', 'INVERTER', 'UPS']
   ```

**Dampaknya:**
Ketika mengunggah file CSV yang berisi perangkat dengan tipe seperti `BATSTARTER`, `BATKERING`, `TRAFO`, `AMF`, atau `ELECTRICALPANEL`, tipe tersebut tidak dikenali oleh frontend sebagai catu daya, sehingga akan disortir dan ditampilkan sebagai **Non-Catu Daya**.

## Rencana Implementasi (Tasks)

1. **Task 1: Sinkronisasi Konstanta Catu Daya di Frontend**
   - Memperbarui fungsi `isCatuDaya` di file `frontend/src/utils/deviceType.ts`.
   - Mengubah `catuDayaKeywords` agar menyertakan semua tipe yang didefinisikan pada `CATU_DAYA_TYPES` di backend untuk memastikan konsistensi sistem.

Mohon tinjau analisis di atas dan berikan persetujuan Anda untuk melanjutkan ke eksekusi!
