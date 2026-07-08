# Task 7.1 Report: Sistem Desain & Tipografi (Global CSS)

## 1. Ringkasan Tugas
Fokus dari tugas ini adalah untuk mengubah fondasi desain utama aplikasi (tipografi, warna, dan gaya komponen dasar) di dalam file `index.css` agar terlihat lebih premium, elegan, dan *user-friendly*.

## 2. Rincian Implementasi
* **Tipografi:** Mengganti *font* "Plus Jakarta Sans" dengan **"Outfit"** dari Google Fonts. Font ini memberikan nuansa yang lebih lebar, bersih, dan sangat modern (sering digunakan oleh *startup* teknologi).
* **Palet Warna Premium:**
  - *Dark Mode:* Diubah menjadi gaya "Zinc 950" (Sangat gelap keabu-abuan `##09090B`) yang memberikan kontras lebih baik dan terasa mewah dibanding warna biru dongker sebelumnya.
  - *Light Mode:* Diubah sedikit lebih bersih dengan bayangan yang lebih lembut dan warna dasar putih terang dipadukan abu-abu cerah untuk latar (*elevated*).
  - *Warna Aksen:* Diperbarui dengan biru cerah (`#3B82F6`) yang memiliki efek gradasi (*gradient*) pada tombol *primary*.
* **Micro-Animations & Interaksi:**
  - Komponen `.btn-primary`, `.btn-danger`, dan `.card-hover` kini memiliki efek pergeseran kecil (*translateY*) dan pendaran bayangan (*box-shadow*) saat diarahkan *mouse* (hover) maupun saat diklik (active).
  - Semua transisi diperhalus dengan `cubic-bezier`.
* **Glassmorphism:**
  - Membuat *utility class* baru: `.glass` dan `.glass-panel` yang memanfaatkan properti `backdrop-filter: blur(16px)` untuk efek transparan layaknya kaca. (Akan diaplikasikan pada Header & Panel di tugas selanjutnya).

## 3. Status
✅ **SELESAI**
Fondasi desain baru telah terpasang. Perubahan visual yang sebenarnya pada tata letak aplikasi akan segera terlihat ketika kita mengimplementasikannya pada komponen-komponen React di Task berikutnya.

---
**Tugas Berikutnya:** Task 7.2 (Memperbarui komponen `Header.tsx` dan `Sidebar.tsx` untuk menggunakan Glassmorphism dan animasi *framer-motion*).
