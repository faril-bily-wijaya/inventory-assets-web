# Analisis Mendalam: Kenapa Map Masih Lambat?

## Akar Masalah
Anda benar! Web modern bisa menampilkan puluhan ribu data secara instan. Masalah di aplikasi ini bukan karena "tidak bisa", melainkan karena **arsitektur pengambilan datanya belum efisien**. Terdapat 3 "rem blong" yang menahan kecepatan loading saat ini:

1. **Jaringan/Database Remote (Supabase)**
   Karena Anda menggunakan database *cloud* (Supabase), setiap kali sistem melakukan *query* ke puluhan ribu lokasi kosong, ia harus mentransfer data besar lewat internet.
2. **Frontend yang Menunggu (*Blocking*)**
   Pada file `MapContext.tsx`, frontend menggunakan `Promise.all` untuk mengambil data marker peta (`map-data`) dan data master lokasi (untuk *dropdown*). Jika data dropdown lambat dimuat, peta ikut tertahan (*loading* terus) meskipun data peta-nya sendiri mungkin sudah selesai didownload!
3. **Tidak Ada Caching**
   Setiap kali halaman di-*refresh*, backend kembali mengambil data mentah dari database. Padahal, data perangkat/lokasi tidak berubah setiap detik.

## Rencana Implementasi Perbaikan Final (Tingkat Lanjut)

Untuk membuat *loading* menjadi instan (kurang dari 1 detik), kita akan menerapkan standar *web app* modern:

1. **Task 1: Memisahkan Loading Peta & Dropdown**
   - *Action:* Modifikasi `MapContext.tsx`.
   - *Detail:* Kita pecah `Promise.all` menjadi dua *request* terpisah. Peta akan dirender **langsung** setelah data peta selesai didownload, tanpa harus menunggu data master lokasi untuk *dropdown*.

2. **Task 2: Memangkas Lokasi Kosong di Database**
   - *Action:* Modifikasi `locations.routes.ts`.
   - *Detail:* Backend *hanya* akan melakukan _query_ lokasi yang memiliki perangkat (menambahkan kondisi `where: { devices: { some: { deleted_at: null } } }`). Ini membuang ribuan lokasi "hantu" dari database sebelum dikirim lewat jaringan internet.

3. **Task 3: Menambahkan Sistem Cache (Memory-Cache)**
   - *Action:* Modifikasi `locations.routes.ts` dan/atau membuat helper cache sederhana.
   - *Detail:* Saat web meminta data peta pertama kali, backend akan menyimpannya di memori RAM Server (cache). Jika Anda me-refresh halaman, backend langsung menembakkan data dari RAM (0 milidetik ke database!), membuatnya terasa **seketika**. Cache ini hanya akan di-reset (dihapus) secara otomatis jika ada *user* yang menambah/mengupdate/menghapus perangkat atau melakukan _import_.

Jika Anda setuju dengan 3 langkah di atas, saya akan mengeksekusi *plan* ini dan kecepatan web Anda akan berubah secara drastis!
