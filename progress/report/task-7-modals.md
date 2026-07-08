# Task 7 Report: Analytics Modal & Location Table Modal

**Status**: Selesai ✅

## Apa yang telah dilakukan:
1. **Analytics Modal:** Membuat `AnalyticsModal.tsx` yang muncul menutupi layar dengan efek kaca (glassmorphism/backdrop blur) yang diakses dari tombol "Dashboard" di sidebar. 
   - Modal ini menggunakan `recharts` untuk menampilkan Top 10 Lokasi Perangkat Terbanyak menggunakan grafik batang (BarChart) secara dinamis sesuai filter pencarian yang aktif.
   - Menampilkan Pie Chart dengan proporsi "Operational" dan "Non-Operational" untuk ringkasan cepat.
2. **Location Table Modal:** Membuat `LocationTableModal.tsx` yang akan muncul jika sebuah marker pada Peta diklik. 
   - Modal ini merender tabel *full-screen* dengan detail setiap perangkat di lokasi spesifik (kode, tipe, merk, kapasitas, status).
   - Menambahkan tombol "Unduh CSV" berwarna hijau untuk mengunduh rekap detail perangkat dalam lokasi tersebut sebagai `.csv`.
3. **Penyambungan Global:** Menggabungkan kedua modal tersebut di `DashboardPage.tsx` agar terpisah secara *z-index* dan tidak mengganggu fungsionalitas peta di layer bawahnya. Menambahkan state `showAnalytics` ke dalam `MapContext`.

Seluruh implementasi fitur utama, UI/UX (termasuk ikon khusus peta, tooltip hover, GPS, Heatmap, dan modal detail) yang ada di versi lawas (`source-web`) telah sukses dimigrasikan ke proyek baru di atas basis arsitektur `React-Leaflet`, Tailwind v4, dan struktur komponen terbaru. Semua Task selesai dikerjakan! 🎉
