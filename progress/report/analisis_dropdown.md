# Analisis Pembaruan Dropdown Sidebar

Berdasarkan permintaan untuk mengubah semua dropdown menjadi tipe *Searchable* (bisa diketik), berikut adalah analisisnya:

## Kondisi Saat Ini
1. **Filter Merk/Brand:** Sudah menggunakan *Searchable Combobox* (single-select).
2. **Filter Status & Kondisi:** Masih menggunakan elemen `<select>` bawaan HTML (single-select).
3. **Filter Lokasi (Area, Regional, District, Cluster, Location):** Saat ini menggunakan model *Accordion* (menu lipat ke bawah) yang mendukung **Multi-Select** (bisa memilih lebih dari satu lokasi sekaligus). 

## Rencana Perbaikan
Karena terdapat perbedaan tipe (Single-select vs Multi-select), perombakan ini memerlukan pembuatan komponen yang *reusable* (bisa dipakai berulang-ulang) agar kode tidak berantakan.

1. **Pembuatan Komponen `SearchableSelect`**
   - Akan dibuat komponen baru yang mendukung pencarian ketik.
   - Komponen ini akan digunakan untuk menggantikan `<select>` pada **Status** dan **Kondisi**.

2. **Penambahan Kolom Pencarian pada Filter Lokasi**
   - Karena filter lokasi saat ini berupa *Accordion* multi-select yang sudah bagus, mengubahnya menjadi *dropdown* biasa akan menghilangkan fitur "Pilih Banyak". 
   - Solusi terbaik: Mempertahankan bentuk *Accordion*, namun menyisipkan **Kotak Pencarian (Search Input)** tepat di dalam setiap menu yang terbuka, sehingga pengguna bisa mencari lokasi tertentu sebelum mengkliknya.
