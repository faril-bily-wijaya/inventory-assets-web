# Laporan Task 10.1: Peningkatan Fitur Autentikasi

## Apa yang telah dilakukan:
1. **Halaman Registrasi (`RegisterPage.tsx`)**: Membuat halaman khusus untuk pengguna baru agar dapat mendaftarkan akun.
2. **Visibilitas Password**: Menambahkan ikon "mata" (*toggle*) pada field password di halaman Login dan Register untuk memudahkan pengguna melihat password yang diketik.
3. **Remember Me**: Menambahkan checkbox "Remember Me" di halaman Login, yang akan mengatur penyimpanan token di `localStorage` jika dicentang, atau di `sessionStorage` jika tidak.
4. **Context Update**: Memperbarui `AuthContext.tsx` untuk mendukung fungsi `register` dan modifikasi penyimpanan token berdasarkan preferensi *Remember Me*.
5. **Routing**: Menambahkan rute `/register` pada `App.tsx` agar halaman registrasi dapat diakses.

## Status: Selesai
