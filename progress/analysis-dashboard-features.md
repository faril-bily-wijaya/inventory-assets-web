# Rencana Implementasi Fitur & UI/UX Lanjutan (Berdasarkan `source-web`)

## Analisis Fitur Referensi (`source-web/src/App.jsx`)
Setelah implementasi tata letak awal (sidebar statis), ada sejumlah fitur fungsional dan visual (UX) yang sangat krusial di versi `source-web` yang harus diduplikasi ke dalam proyek `Inventory-assets-program` agar sepenuhnya identik. Fitur-fitur tersebut meliputi:

1. **Custom Map Markers (Leaflet DivIcon)**:
   - Penggunaan ikon kustom berbasis SVG alih-alih marker standar, yaitu ikon *Zap* (oranye) untuk Catu Daya, ikon *Server* (biru) untuk Non-Catu Daya, dan ikon campuran (indigo).
   - Penggunaan marker animasi (pulse) jika terdapat perangkat berstatus *critical*.
2. **Heatmap Mode (Mode Kerusakan)**:
   - Tombol toggle bergambar *Flame* yang mengubah tampilan peta menjadi mode Heatmap.
   - Peta menampilkan `CircleMarker` berwarna merah yang ukurannya disesuaikan dengan jumlah perangkat yang bermasalah.
3. **GPS Tracking (Lacak Lokasi)**:
   - Tombol *LocateFixed* yang memanfaatkan HTML5 Geolocation API untuk mendapatkan koordinat pengguna saat ini, memunculkan marker GPS, dan menggeser peta ke lokasi tersebut.
4. **Tooltips Kustom (Premium Tooltip)**:
   - Tooltip informatif saat melakukan *hover* pada marker (atau klaster), yang menampilkan nama lokasi, alamat, metrik perangkat per kategori, serta pratinjau 10 perangkat teratas. Membutuhkan styling kustom.
5. **Modal Detail Lokasi (Table Modal)**:
   - Saat sebuah marker lokasi di-klik, alih-alih pop-up standar, muncul Modal Full Screen yang menampilkan tabel seluruh perangkat di lokasi tersebut beserta fitur Export ke CSV khusus lokasi itu.
6. **Modal Analytics Dashboard**:
   - Saat tombol "Dashboard" di sidebar diklik, akan memunculkan Modal Full Screen (Analytics Dashboard Modal) yang menampilkan Bar Chart (Top 10 Lokasi) dan Pie Chart (Rasio Status).
7. **Penggabungan Styling CSS (`source-web/src/index.css`)**:
   - Memasukkan kelas CSS kustom (`custom-scrollbar`, animasi `pulse`, dll) ke `frontend/src/index.css`.

## Rencana Implementasi

### Task 4: Migrasi Styling & Ikon Kustom Peta
*   Menyalin dan menyesuaikan kode `L.divIcon` dari `source-web/src/App.jsx` ke dalam `LocationMarker.tsx`.
*   Menambahkan ikon khusus Catu Daya, Non-Catu Daya, dan campuran berdasarkan isi perangkat (memerlukan modifikasi cara `MapView.tsx` mengirimkan prop `marker`).
*   Menggabungkan CSS kustom dari `source-web/src/index.css` ke `frontend/src/index.css`.

### Task 5: Tooltip Detail & Interaksi Marker
*   Mengganti pop-up standar Leaflet dengan `Tooltip` bergaya premium.
*   Mengambil data detail alamat (misalnya dengan Reverse Geocoding via Nominatim jika diperlukan) seperti pada referensi.

### Task 6: Fitur GPS & Heatmap
*   Membuat tombol "Lacak Lokasi" (GPS) dan mengintegrasikan fungsi `navigator.geolocation` di `MapView.tsx`.
*   Membuat tombol toggle "Heatmap", serta menambahkan logika rendering bersyarat `CircleMarker` jika mode Heatmap aktif.

### Task 7: Modal Analytics & Modal Tabel Lokasi
*   Membuat komponen `AnalyticsModal.tsx` yang dipanggil dari `DashboardSidebar.tsx`.
*   Membuat komponen `LocationTableModal.tsx` yang dipanggil ketika sebuah marker di-klik.

## Persetujuan
Apakah Anda setuju dengan rencana tahap lanjutan ini? Jika **setuju**, saya akan mulai membuat task 4 hingga task 7 di direktori `progress/task` dan mengerjakannya.
