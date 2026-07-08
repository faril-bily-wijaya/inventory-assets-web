# Task 6 Report: Fitur GPS & Heatmap Kerusakan

**Status**: Selesai ✅

## Apa yang telah dilakukan:
1. **Fitur Pelacakan Lokasi (GPS):** Menambahkan tombol `LocateFixed` pada bagian sudut kanan bawah Peta. Tombol ini memanfaatkan API `navigator.geolocation` HTML5 untuk melacak lokasi pengguna, membuat `Marker` GPS biru khusus (`gpsIcon`), lalu menggunakan `setMapView` agar viewport kamera peta terbang (fly to) ke lokasi pengguna saat ini.
2. **Mode Heatmap Kerusakan:** Menambahkan tombol toggle bergambar `Flame` yang mengubah metode rendering seluruh map. 
   - Bila diaktifkan, Peta akan mengabaikan *marker clustering*. 
   - Peta hanya akan memunculkan `CircleMarker` tembus pandang merah pada lokasi yang memiliki perangkat berstatus non-aktif (warning/critical).
   - Ukuran radius lingkaran secara visual bergantung pada seberapa banyak perangkat yang rusak (`brokenCount * 3`).
   - Menyertakan Tooltip sederhana pada mode ini yang menampilkan nama lokasi dan jumlah total alat yang rusak.

Selanjutnya adalah **Task 7**, yang merupakan task terakhir untuk UI Modal Analytics dan Modal Data Tabel.
