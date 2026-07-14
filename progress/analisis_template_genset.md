# Analisis & Rencana Implementasi: Template Import Genset Mobile Fleksibel

## 1. Hasil Analisis Masalah Saat Ini

**Mengapa pin lokasi saling bertumpuk (membentuk spiral)?**
- Pada file `Book1.xlsx`, Anda menyediakan data **STO** dan **Distrik**.
- *Backend parser* khusus Genset saat ini diatur untuk mengabaikan koordinat (Latitude & Longitude) meskipun Anda memasukkannya ke dalam Excel.
- Saat sistem membaca STO (contoh: "Bengkulu Centrum"), ia akan mencari lokasi tersebut di database. Jika STO tersebut belum pernah ada, sistem akan membuat lokasi baru.
- Karena *parser* Genset tidak membaca Latitude & Longitude dari Excel, lokasi baru tersebut otomatis diberikan koordinat *fallback default* (`Latitude: -3.5`, `Longitude: 103.5`).
- Karena semua Genset di STO baru mendapatkan koordinat *fallback* yang persis sama, Leaflet (sistem peta frontend) menyebarkan pin-pin yang bertumpuk tersebut menjadi bentuk spiral.

**Apakah perubahan ini akan mengganggu fitur lain?**
- **Tidak.** Karena *parser* untuk *Genset Mobile* sudah dipisahkan dari *parser* perangkat umum (Default) di dalam `backend/src/utils/fileParser.ts`. Kita hanya perlu menyesuaikan logika di *parser* Genset saja tanpa menyentuh *parser* utama.

## 2. Rencana Solusi (Implementation Plan)

Saya akan memecah pekerjaan ini menjadi beberapa Task:

### Task 1: Menyesuaikan Backend Parser Genset Mobile
- Mengubah fungsi `parseXlsx` pada blok `importType === 'genset'` di file `backend/src/utils/fileParser.ts`.
- Menambahkan kemampuan untuk membaca kolom ekstra jika tersedia di Excel, yaitu:
  - `Latitude`
  - `Longitude`
  - `Area`
  - `Regional`
  - `Cluster`
- Dengan ini, jika Excel memiliki koordinat, sistem akan langsung menggunakannya (membuat lokasi fleksibel) dan tidak lagi menumpuk pin di tengah peta.

### Task 2: Membuat Endpoint & Fitur Unduh Template Khusus Genset
- Menambahkan *query parameter* (contoh: `?type=genset`) pada *endpoint* `GET /api/devices/import/template` di `backend/src/routes/devices.routes.ts`.
- Jika parameter tersebut ada, sistem akan men-*generate* template Excel khusus Genset (berisi: NO, Perangkat, Distrik, STO, Latitude, Longitude, MERK, Kapasitas, Kondisi, MYASSET ID, KETERANGAN).
- Mengubah tombol "Unduh Template" di *frontend* (`LocationTableModal.tsx` & `DashboardSidebar.tsx` / `ImportModal`) agar menyesuaikan tipe import yang sedang dipilih.

### Task 3: Pengujian & Deploy
- Melakukan verifikasi *parser* baru.
- Melakukan *push* ke repositori GitHub.
- Menjalankan *deploy* ke VPS secara otomatis.

---
**Mohon konfirmasi Anda:**
Apakah Anda setuju dengan rencana di atas? Jika setuju, saya akan memecahnya menjadi file `task` dan mulai mengerjakannya satu per satu sesuai dengan pedoman alur kerja (*workflow*) yang Anda minta!
