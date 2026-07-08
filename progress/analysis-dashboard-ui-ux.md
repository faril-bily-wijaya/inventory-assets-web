# Rencana Implementasi UI & UX Map Dashboard (Sesuai Referensi)

## Analisis UI & UX Referensi (map-inventory-v1)
Berdasarkan gambar referensi yang diberikan dan kode dari proyek referensi (`map-inventory-v1`), antarmuka Map Dashboard memiliki struktur berikut:

1.  **Sidebar Kiri (Fixed, Lebar 360px):**
    *   **Header Logo:** Menampilkan logo "InfraNexia" dan deskripsi.
    *   **Pencarian:** Terdapat input pencarian dengan ikon *search* di sebelah kiri.
    *   **Ringkasan Data:** Menampilkan angka Total Perangkat dan donat chart (menggunakan `recharts`) untuk membandingkan jumlah "Catu Daya" dan "Non-Catu Daya". Terdapat dua tombol: "Dashboard" dan "Ekspor (Semua)".
    *   **Advanced Filters:** Dropdown untuk memilih *Status*, *Kondisi*, dan *Merk / Brand*.
    *   **Kategori Perangkat:** Tombol toggle vertikal untuk filter "Semua Perangkat", "Catu Daya", dan "Non-Catu Daya", yang dilengkapi ikon (Zap untuk Catu Daya, Server untuk Non-Catu Daya).
    *   **Tampilan Peta:** Tombol toggle di bagian paling bawah sidebar untuk memilih tipe peta: "Jalan (Street)" atau "Satelit".

2.  **Area Utama (Map Container):**
    *   Map Leaflet (atau sejenis) mendominasi seluruh sisa ruang.
    *   Tombol *floating* tidak dominan di atas peta, berbeda dengan versi terkini di `Inventory-assets-program` yang menumpuk filter di atas peta (floating glass panel).
    *   Marker pada peta menampilkan pop-up/tooltip dengan info mendetail ketika di-klik/di-hover.
    *   Terdapat tombol utilitas tambahan pada peta seperti tombol lacak lokasi (GPS), dan mode Heatmap.

## Rencana Implementasi di `Inventory-assets-program`
Untuk menyesuaikan `DashboardPage.tsx` di `Inventory-assets-program`, berikut langkah-langkah implementasinya:

### Task 1: Refactoring Struktur Layout Dashboard
*   Mengubah `DashboardPage.tsx` dari struktur *floating panels* (`QuickStats`, `FilterPanel` yang berada di atas peta) menjadi struktur grid/flex dengan Sidebar di kiri (lebar tetap, misal `360px` atau `w-96`) dan MapArea mengambil sisa ruang (`flex-1`).
*   Menghilangkan/mengganti penggunaan komponen SidebarNav bawaan jika perlu, karena halaman Dashboard memiliki sidebar spesifik yang unik dari halaman lainnya, atau mengintegrasikan sidebar dashboard ke dalam struktur layout utama.
*   *Asumsi:* Sidebar dashboard khusus digunakan di halaman Dashboard saja.

### Task 2: Implementasi UI Sidebar Dashboard
*   Membuat atau memodifikasi komponen `DashboardSidebar` yang baru di `src/components/sidebar/DashboardSidebar.tsx`.
*   Mengimplementasikan elemen-elemen UI persis seperti referensi:
    *   Input *Search*.
    *   Card "Ringkasan Data" dengan integrasi `recharts` untuk PieChart Catu Daya vs Non-Catu Daya.
    *   Grid dua kolom untuk filter (Status & Kondisi).
    *   Satu kolom penuh untuk filter (Merk).
    *   Grup tombol "Kategori Perangkat" (Semua, Catu Daya, Non-Catu Daya) dengan styling aktif/non-aktif yang presisi.
    *   Toggle tipe peta (Jalan vs Satelit).

### Task 3: Integrasi Map Context dan UI Dashboard
*   Menghubungkan `DashboardSidebar` dengan global state atau filter state yang meneruskan filter ke `MapView`.
*   Menyesuaikan komponen `MapView` untuk mendukung peralihan tile "Satelit" dan "Street" berdasarkan toggle dari sidebar.
*   Memastikan data dari backend (menggunakan service yang ada di `Inventory-assets-program`) terikat (bind) dengan chart dan filter di UI baru.

## Persetujuan
Apakah rencana implementasi ini sudah sesuai dengan yang Anda harapkan? Jika Anda setuju, saya akan memecah pekerjaan ini menjadi task-task kecil dan mulai mengerjakannya.
