# Report: Mobile UI/UX Improvements (Task 1 & 2)

## Task 1: Header/Navbar (Mobile)
- Ditambahkan penyesuaian flexbox dengan property `shrink-0` pada beberapa elemen di `Header.tsx` untuk mencegah tombol hamburger menu terhimpit.
- Padding header dikurangi khusus untuk layar kecil (`px-3 sm:px-6`) agar ruang lebih lega.
- Tinggi logo gambar diperkecil secara proporsional (`h-6 sm:h-8`) di layar HP sehingga tidak menabrak tombol menu atau memotong area header.

## Task 2: Sidebar (Swipe & Drawer)
- Ditambahkan properti `max-w-[80vw]` pada sidebar di `Sidebar.tsx`, sehingga saat menu dibuka pada layar HP, sidebar hanya menempati maksimal 80% dari lebar layar.
- Mengimplementasikan fitur sensor gestur swipe:
  - `onTouchStart`, `onTouchMove`, dan `onTouchEnd` untuk menangkap arah sentuhan pengguna.
  - Jika pengguna menggeser layar ke arah kiri dengan jarak minimal 50px, maka fungsi `onClose` akan terpanggil otomatis untuk menutup sidebar dengan sangat mulus layaknya aplikasi mobile native.
