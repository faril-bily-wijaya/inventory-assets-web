# Analisis dan Perencanaan Peningkatan Fitur Login & Akun Manajemen

Berdasarkan pengecekan pada backend dan frontend saat ini, berikut adalah analisis dan saran untuk menyempurnakan fitur-fitur tersebut:

## 1. Peningkatan Fitur Autentikasi
*   **Halaman Registrasi (Register Page):** Backend sudah memiliki endpoint `/api/auth/register`, namun frontend belum memiliki halamannya. Kita perlu membuat halaman registrasi agar pengguna baru bisa mendaftar.
*   **Toggle Visibilitas Password:** Menambahkan ikon "mata" pada input password di halaman Login dan Register untuk memunculkan/menyembunyikan teks sandi.

## 2. Peningkatan Halaman Pengaturan (Settings Page)
*   **Update Profil:** Saat ini halaman Settings hanya menampilkan data `Username`, `Email`, dan `Role` secara read-only. Kita perlu menambahkan form agar pengguna bisa memperbarui profil mereka (seperti `full_name`, `email`). Ini membutuhkan endpoint backend baru seperti `PUT /api/users/me`.
*   **Ubah Password (Change Password):** Menambahkan tab atau seksi khusus di halaman Settings agar pengguna dapat mengubah password mereka dengan memasukkan password lama dan password baru.

## 3. Manajemen Pengguna untuk Admin (User Management)
*   **Halaman Manajemen Akun (User Management Page):** Backend sudah menyediakan endpoint khusus admin (seperti `GET /api/users`, `PUT /api/users/:id/role`, `PUT /api/users/:id/active`, `DELETE /api/users/:id`). Namun, frontend belum memiliki halaman antarmuka untuk fitur ini.
*   Fitur ini akan memungkinkan pengguna dengan role `ADMIN` untuk melihat semua daftar akun, mengubah role menjadi Admin/User, mengaktifkan/menonaktifkan akun, serta menghapus akun yang tidak diperlukan.

## 4. UI/UX dan Animasi
*   Mendesain form Settings dengan menggunakan *Tabs* (Profil, Keamanan/Security) untuk navigasi yang lebih terstruktur dan premium.
*   Membuat desain tabel yang estetis (glassmorphism) untuk halaman User Management.

---
> [!IMPORTANT]
> **User Review Required**
> 1. Apakah Anda setuju dengan rancangan peningkatan ini?
> 2. Apakah Anda ingin menambahkan fitur unggah Foto Profil (Avatar) juga di halaman profil?
