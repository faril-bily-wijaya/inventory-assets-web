# Analisis Isu: Loading Peta Lambat & Tampilan Page Devices

## Akar Masalah Peta Lambat
Loading peta (map) memakan waktu yang lama karena ukuran muatan (payload) dari *backend* terlalu besar dan ada inefisiensi pada pengambilan data. Terdapat dua faktor utama:

1. **Pemanggilan Endpoint Berulang yang Berat**
   Pada `MapContext.tsx`, aplikasi memanggil dua endpoint secara bersamaan:
   - `GET /api/locations/map-data` (Untuk menampilkan marker di peta)
   - `GET /api/locations` (Digunakan hanya untuk dropdown pilihan lokasi di Device Modal)
   
   Masalahnya, **kedua** endpoint ini melakukan query ke database dengan parameter `include: { devices: true }`, yang berarti keduanya mengambil **seluruh** data perangkat beserta semua kolomnya dari database. Jika ada 50.000 perangkat, database harus melakukan _join_ dan serialisasi JSON untuk 50.000 perangkat secara ganda.

2. **Payload (Data) yang Terlalu Besar**
   Pada `GET /api/locations/map-data`, backend mengirimkan seluruh atribut perangkat ke frontend. Padahal, frontend (`MapView.tsx`) hanya menggunakan beberapa kolom saja untuk melakukan _filtering_ pada map:
   - `device_type`
   - `status`
   - `condition`
   - `brand`
   - `device_code`

## Kebutuhan Tambahan (Devices Page)
Meskipun payload di endpoint peta (`/api/locations/map-data`) dioptimasi/dikurangi, *user* menginginkan agar di halaman **Devices** (`/devices`), seluruh informasi dari tabel data tetap ditampilkan semua di dalam tabel (kecuali informasi nama orang/teknisi).

## Rencana Implementasi (Tasks)

1. **Task 1: Optimasi Endpoint `/api/locations`**
   - Hapus `include: { devices: true }` pada endpoint ini karena frontend hanya menggunakannya untuk menampilkan *dropdown* nama lokasi.

2. **Task 2: Optimasi Endpoint `/api/locations/map-data`**
   - Modifikasi `include: { devices: true }` menjadi `select` agar hanya mengirim kolom yang benar-benar dibutuhkan oleh peta (seperti `id`, `device_code`, `device_type`, `brand`, `status`, `condition`). Hal ini akan mengecilkan ukuran JSON secara drastis.

3. **Task 3: Menampilkan Seluruh Kolom pada Devices Page**
   - Memodifikasi file `frontend/src/pages/DevicesPage.tsx`.
   - Menambahkan seluruh kolom yang tersedia di schema perangkat (seperti `Merk`, `Model`, `Serial Number`, `Label Code`, `Kondisi`, `Cap Real`, dll) ke dalam UI tabel `DevicesPage`.
   - Memastikan nama teknisi tidak ditampilkan di tabel.

Silakan tinjau kembali update rencana perbaikan ini. Jika Anda setuju, saya akan memecahnya ke dalam *tasks* dan mengerjakannya.
