# Task 3 Report: Integrasi Map Context & Filter

**Status**: Selesai ✅

## Apa yang telah dilakukan:
1. Mengubah komponen `MapView.tsx` agar menggunakan filter yang berasal dari `MapContext` (state dari sidebar baru).
2. Menghitung `filteredMarkers` secara lokal (client-side) di `MapView` berdasarkan:
   - Kategori Perangkat (Catu Daya vs Non-Catu Daya)
   - Status
   - Kondisi
   - Merk / Brand
   - Pencarian Teks
3. Menghubungkan map `TileLayer` dengan state `mapStyle` sehingga pengguna bisa mengganti tipe peta antara "Jalan (Street)" (Google Maps Street Tile) dan "Satelit" (Google Maps Satellite Tile).
4. Menghapus ketergantungan pada theme toggle untuk dark/light base map, sehingga peta selalu menggunakan tile Google Maps sesuai mode yang dipilih pada sidebar.

Seluruh tugas restrukturisasi UI/UX Dashboard untuk mencocokkan referensi sudah selesai diimplementasikan.
Semua fungsionalitas filter telah terintegrasi secara langsung, bekerja secara real-time pada saat panel filter diubah.
