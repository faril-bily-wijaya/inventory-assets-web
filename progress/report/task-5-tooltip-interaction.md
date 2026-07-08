# Task 5 Report: Tooltip Detail & Interaksi Marker

**Status**: Selesai ✅

## Apa yang telah dilakukan:
1. Menghapus komponen `DevicePopup` beserta `react-leaflet` `Popup` bawaan, menggantikannya dengan `<Tooltip>` untuk mengaktifkan antarmuka berbasis hover.
2. Mengimplementasikan "Premium Tooltip" secara persis sesuai dengan `source-web/src/App.jsx`.
3. Tooltip sekarang merender data real-time perangkat:
   - Nama Lokasi & Alamat (menggunakan `marker.address`).
   - Ringkasan Jumlah Catu Daya & Non-Catu Daya pada lokasi.
   - 10 daftar perangkat pertama di lokasi tersebut yang memunculkan tipe perangkat, status "OPERATIONAL" atau "NON-OPERATIONAL" berlabel warna, beserta icon hard-drive yang menampilkan merk dan kapasitas perangkat.
4. Menambahkan tombol / footer indikasi di tooltip: "Klik Marker Untuk Tabel Lengkap".

Selanjutnya adalah **Task 6**, yang bertugas menambahkan fungsi mode pelacak Lokasi (GPS) dan mode Heatmap Kerusakan.
