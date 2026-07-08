# Analisis Fitur Preview Marker (Tooltip Peta)

Berdasarkan gambar dan pengecekan kode pada file `LocationMarker.tsx`, berikut adalah hasil analisis saya mengenai fitur preview tersebut:

## 1. Analisis Bug (Warna Merah "NON-OPERATIONAL")
Pada gambar yang Anda berikan, semua perangkat menunjukkan status merah dengan tulisan **NON-OPERATIONAL**.
* **Penyebab:** Di dalam kode `LocationMarker.tsx`, logika pengecekan warnanya masih menggunakan aturan lama: `dev.status === 'active'`. Karena database kita sekarang menggunakan status `AKTIF`, maka kondisi ini selalu salah (False), sehingga sistem menganggap semua perangkat tidak aktif dan memberikan warna merah.

## 2. Kekurangan Fitur (Tidak Ada Indikator Modernisasi)
Di dalam preview tooltip ini, pengguna belum bisa melihat apakah sebuah perangkat membutuhkan modernisasi atau tidak. Padahal informasi ini sangat penting untuk diketahui secara cepat tanpa harus membuka tabel lengkap.

## 3. Analisis Estetika dan Desain UI
Secara keseluruhan desainnya sudah cukup rapi, namun kita bisa membuatnya lebih premium dan modern (*Wow Factor*):
* **Warna Status:** Perlu disesuaikan agar status `AKTIF`, `IDLE`, dsb memiliki gaya (*styling*) yang konsisten dengan bagian aplikasi lainnya (menggunakan *Badge*).
* **Scrollbar:** Terdapat scrollbar bawaan browser yang kurang cantik. Bisa dipercantik dengan kustomisasi CSS.
* **Layout Perangkat:** List perangkat bisa dibuat lebih padat dan elegan.

---

# Rencana Implementasi

1. Mengubah logika pengecekan status menjadi `['aktif', 'active', 'operational'].includes(dev.status?.toLowerCase())` di `LocationMarker.tsx`.
2. Mengganti tulisan baku "OPERATIONAL" dengan langsung menampilkan isi dari `dev.status`.
3. Menambahkan **Indikator Modernisasi** (berupa badge/ikon kecil berwarna oranye) di sebelah kanan status.
