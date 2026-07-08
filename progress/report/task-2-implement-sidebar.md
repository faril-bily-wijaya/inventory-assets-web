# Task 2 Report: Implementasi UI Sidebar Dashboard

**Status**: Selesai ✅

## Apa yang telah dilakukan:
1. **Membuat utilitas baru `deviceType.ts`:** Mengimplementasikan fungsi `isCatuDaya` yang berfungsi mengidentifikasi perangkat catu daya berdasarkan tipe perangkat, sesuai referensi logika pada `map-inventory-v1`.
2. **Memperbarui `MapContext.tsx`:** Menambahkan UI state (seperti `mapStyle`, `filter`, `statusFilter`, `conditionFilter`, `brandFilter`, `search`) yang bisa diakses secara global, agar filter yang diatur di sidebar bisa berpengaruh ke dalam map.
3. **Membuat `DashboardSidebar.tsx`:**
   - Membangun antarmuka sidebar statis (lebar `360px`).
   - Menambahkan kotak pencarian (search input).
   - Menambahkan Ringkasan Data yang menampilkan `stats.total` beserta pie chart visual (dengan `recharts`) untuk membandingkan jumlah Catu Daya dan Non-Catu Daya.
   - Menambahkan "Advanced Filters" (Status, Kondisi, Merk) yang daftarnya dihitung secara dinamis dari `markers` yang ada (`availableBrands`, `availableStatuses`, `availableConditions`).
   - Mengimplementasikan filter kategori perangkat (Semua Perangkat, Catu Daya, Non-Catu Daya).
   - Menambahkan toggle style peta ("Jalan (Street)" & "Satelit").

Langkah berikutnya (Task 3) adalah mengintegrasikan pengaturan sidebar ini ke komponen `MapView.tsx` (misal, pengaplikasian filter ke marker di peta dan pengubahan base layer peta/tile berdasarkan preferensi style).
