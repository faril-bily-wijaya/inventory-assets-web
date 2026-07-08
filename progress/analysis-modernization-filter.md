# Analisis & Rencana Implementasi: Modernisasi & Filter Sidebar

Berdasarkan pengecekan, fitur perhitungan **Butuh Modernisasi** sebenarnya sudah diproses oleh backend (server). Namun, fitur tersebut **gagal tampil di layar** karena ada dua masalah:
1. **Di Peta (Pop-up)**: Terjadi ketidakcocokan format data (backend mengirim `device_type` sedangkan UI peta mencari `deviceType`). Akibatnya, pop-up peta tidak bisa merender status modernisasinya.
2. **Di Tabel Devices**: Kolom tabel `/devices` memang belum diprogram untuk menampilkan indikator modernisasi.

Sementara itu, untuk penambahan **Filter STO (Lokasi)** di Sidebar, kita perlu menambahkannya ke komponen `FilterPanel` dan menyambungkannya ke *query database* peta.

## Rencana Implementasi (Task List)

### Task 1: Memperbaiki Modernisasi di Peta (Map Pop-up)
- **File:** `backend/src/routes/locations.routes.ts`
- **Aksi:** Memperbaiki *mapping* variabel pada endpoint `GET /api/locations/:id/devices`. Variabel yang tadinya berformat *snake_case* akan diubah menjadi *camelCase* agar sesuai dengan standar antarmuka UI peta. Ini akan membuat daftar alat di pop-up peta kembali muncul lengkap dengan warna/label "Butuh Modernisasi".

### Task 2: Menambahkan Indikator Modernisasi di Tabel Devices
- **File Backend:** `backend/src/routes/devices.routes.ts`
- **Aksi Backend:** Memasukkan fungsi `hitungButuhModernisasi` ke dalam respons data tabel perangkat.
- **File Frontend:** `frontend/src/pages/DevicesPage.tsx`
- **Aksi Frontend:** Menambahkan _badge_ (label) peringatan berwarna peringatan (misalnya kuning/oranye) bertuliskan **"Butuh Modernisasi"** di dalam baris tabel, sehingga sangat mencolok bagi pengguna.

### Task 3: Menambah Filter "STO (Lokasi)" pada Sidebar Peta
- **File Frontend:** `frontend/src/components/sidebar/FilterPanel.tsx`
- **Aksi Frontend:** Menambahkan menu akordeon keempat bernama **"STO (Lokasi)"**. Daftar STO ini akan mengambil nama-nama lokasi yang tersedia.
- **File Context:** `frontend/src/contexts/MapContext.tsx`
- **Aksi Context:** Menyambungkan filter `locationId` ke _service_ map.
- **File Backend:** `backend/src/routes/locations.routes.ts`
- **Aksi Backend:** Menyesuaikan endpoint `GET /api/locations/map-data` agar apabila filter STO dipilih, peta langsung menge-zoom atau menyaring hanya ke satu titik koordinat STO tersebut.

Silakan tinjau rencana di atas. Jika Anda setuju, saya akan langsung mulai mengeksekusi *Task 1* hingga *Task 3* satu persatu.
