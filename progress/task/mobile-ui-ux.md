# Task: Mobile UI/UX Improvements

## Task 1: Header/Navbar (Mobile)
- [x] Perbaiki flexbox pada header utama.
- [x] Sesuaikan ukuran logo infraflexia agar tidak menabrak ikon menu hamburger di mode mobile.
- [x] Beri jarak yang cukup untuk tombol-tombol di pojok kanan (Theme, Notifikasi, User).

## Task 2: Sidebar (Swipe & Drawer)
- [x] Ubah lebar sidebar di mode mobile menjadi maksimal 80vw (tidak full screen).
- [x] Tambahkan background overlay gelap di sisa layar.
- [x] Tambahkan event onTouchStart, onTouchMove, dan onTouchEnd untuk fitur *swipe to close*.

## Task 3: Filter Panel
- [x] Ubah komponen filter (Semua, Semua, All Location) agar fleksibel (bisa scroll horizontal atau menumpuk vertikal) di layar kecil.

## Task 4: Device Table (Daftar Perangkat)
- [x] Bungkus elemen tabel dengan div ber-class `overflow-x-auto` agar bisa di-scroll ke samping.
- [x] Pastikan ukuran kolom minimal (min-width) cukup agar teks tidak menumpuk aneh (seperti "YEAR & AGE").

## Task 5: Map Floating Buttons
- [x] Perkecil tombol aksi peta di pojok kanan bawah pada layar mobile (dari ukuran w-14 h-14 menjadi ukuran standar touch target seperti w-10 h-10 atau w-12 h-12).

## Task 6: Safe Area Padding (Bottom Bar Fix)
- [x] Tambahkan padding bawah (misal `pb-24`) pada kontainer halaman utama (khususnya untuk halaman Devices/Tabel) agar tombol pagination tidak tertutup oleh tombol Home/Gesture bar bawaan HP.
