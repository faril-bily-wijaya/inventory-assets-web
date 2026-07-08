# Analisis Perbaikan Sidebar Map

## Masalah yang Ditemukan
1. **Filter Teks Tak Terlihat**: Komponen `select` pada "Advanced Filters" (Status, Kondisi, Merk) tidak secara eksplisit diberikan class warna teks untuk mode terang (*light mode*). Akibatnya teks merender warna putih di atas background putih, dan hanya terlihat jika disorot.
2. **Filter Hierarki (Regional/District) Hilang**: Filter Regional, District, Cluster, dan STO yang kita kerjakan sebelumnya ternyata saya letakkan pada komponen `FilterPanel.tsx` yang sifatnya *orphan* (tidak digunakan oleh *layout* utama web). UI Sidebar yang sebenarnya dipakai oleh halaman peta adalah `DashboardSidebar.tsx`.

## Rencana Implementasi

1. **Memperbaiki Warna Teks di Filter (UI Fix)**
   - **File:** `frontend/src/components/sidebar/DashboardSidebar.tsx`
   - **Aksi:** Menambahkan class `text-slate-800` (untuk mode terang) pada semua komponen `<select>` di menu *Advanced Filters* agar tulisannya menjadi warna gelap dan mudah dibaca tanpa harus disorot.

2. **Memindahkan Filter Hierarki & STO ke Sidebar Utama**
   - **File:** `frontend/src/components/sidebar/DashboardSidebar.tsx`
   - **Aksi:** Menanamkan filter *Regional*, *District*, *Cluster*, dan *STO (Lokasi)* ke dalam *DashboardSidebar* menggunakan gaya desain yang sama (komponen `select` *dropdown* atau *accordion*).
   - Filter ini akan memanggil `locationService.getHierarchy()` untuk mendapatkan daftar lengkap Regional, District, dan Cluster. Sedangkan daftar STO (Lokasi) akan diambil langsung dari data peta.

Silakan berikan persetujuan Anda jika rencana ini sesuai, agar saya dapat memindahkan dan memperbaiki komponen sidebar tersebut.
