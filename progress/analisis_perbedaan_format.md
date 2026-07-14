# Analisis Perbedaan Format Template dan Export Excel

## Temuan Masalah

Dari hasil pengecekan dua file yang ada di folder `source_data` dan analisis kode yang bersangkutan, ditemukan bahwa ada **ketidaksesuaian (mismatch)** yang signifikan antara format tabel **Export**, **Template Import**, dan **Parser (Sistem Import)**.

1. **Export Function (`frontend/src/components/map/LocationTableModal.tsx`)**
   - Fitur export secara langsung mencetak properti objek `Device` dari database/frontend menjadi kolom Excel.
   - Kolom yang dihasilkan menggunakan bahasa Inggris dan snake_case/camelCase (misal: `device_code`, `device_name`, `device_type`, `year`, `brand`, dll).
   - Menghasilkan sekitar 50+ kolom (termasuk kolom UUID, ID, waktu created/updated).

2. **Template Import (`backend/src/routes/devices.routes.ts`)**
   - Template dibuat secara hardcoded di backend pada route `/api/devices/import/template`.
   - Menggunakan format penamaan kolom versi lokal (Bahasa Indonesia), misalnya: `code`, `name`, `jenis`, `tahun_operasi`, `merk`, `kondisi`, `sites_name`.
   - Hanya memiliki 23 kolom.

3. **File Parser (`backend/src/utils/fileParser.ts`)**
   - Saat pengguna mengunggah file, sistem parser akan memvalidasi kolom-kolom tertentu sebagai `REQUIRED_COLUMNS`, yaitu: `device_code`, `device_name`, `site_name`, `device_type`, `year`.
   - Parser mengharapkan data header berupa format bahasa Inggris (sama seperti format **Export**).
   - Parser tidak melakukan aliasing/pemetaan otomatis dari kolom versi Indonesia (`code`, `jenis`) ke versi Inggris (`device_code`, `device_type`) untuk parser *default*.

## Akibat dari Masalah Ini
- Jika pengguna mendownload **Template Import** dan mengisinya, sistem akan menolak/error saat di-upload karena kolom wajib seperti `device_code`, `site_name` tidak ditemukan (Template menggunakan `code` dan `sites_name`).
- Ironisnya, jika pengguna melakukan **Export**, lalu mengedit dan mengunggah kembali file Export tersebut, kemungkinan besar akan berhasil karena format Export lebih mirip dengan format yang diharapkan Parser.

---

## Rencana Perbaikan (Plan)

Pendapat yang sangat bagus! Mengurutkan kolom dimulai dari konteks lokasi (`area`, `regional`, dsb.) sangat intuitif bagi pengguna (user-friendly) karena aset fisik selalu terikat pada lokasi tertentu. Oleh karena itu, kita akan menerapkan **Satu Standar Urutan Kolom** untuk Export dan Template Import.

Berikut adalah urutan standar yang diusulkan:
1. **Lokasi & Hierarki**: `area`, `regional`, `district`, `cluster`, `site_name`, `site_code`, `address`, `latitude`, `longitude`, `class_type`, `teknisi`
2. **Identitas Perangkat**: `device_code`, `device_name`, `device_type`, `brand`, `model`, `serial_number`, `label_code`
3. **Spesifikasi & Listrik**: `kapasitas`, `satuan_kapasitas`, `jenis_tegangan`, `beban_arus`, `satuan_beban`, `cap_real`
4. **Umur & Status**: `year`, `usia_perangkat`, `status`, `condition`
5. **Penempatan Detail**: `ruangan_code`, `ruangan_name`, `ruangan_panjang`, `ruangan_lebar`, `ruangan_tinggi`, `ruangan_luas`, `rack_code`, `rack_name`, `rack_panjang`, `rack_lebar`, `rack_tinggi`, `rack_luas`
6. **Lainnya**: `keterangan` *(serta `id` dan kolom sistem lainnya diletakkan di paling akhir)*

**Langkah Implementasi:**

1. **Task 1: Memperbarui Template Import (`backend/src/routes/devices.routes.ts`)**
   - Mengubah nama kolom template agar sesuai dengan Parser (menggunakan `device_code`, `site_name`, dll).
   - Mengubah urutan kolom agar dimulai dari `area`, `regional`, dst seperti usulan di atas.

2. **Task 2: Memperbarui Export Data (`frontend/src/components/map/LocationTableModal.tsx`)**
   - Menyusun ulang urutan pemetaan objek (`rows.map`) pada fitur Export agar persis sama dengan urutan pada Template Import.

3. **Task 3: Validasi File Parser (`backend/src/utils/fileParser.ts`)**
   - Karena parser membaca data berdasarkan nama header (bukan urutan), parser akan tetap bekerja dengan baik. Kita hanya akan memastikan tidak ada validasi usang yang bertabrakan.

Silakan berikan persetujuan akhir jika Anda setuju dengan urutan dan rencana (plan) ini, agar saya dapat segera memecahnya ke dalam file Task dan mengeksekusinya.
