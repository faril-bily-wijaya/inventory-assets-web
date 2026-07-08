# Laporan Task 10.3: Manajemen Pengguna untuk Admin (User Management Feature)

## Apa yang telah dilakukan:
1. **Halaman Manajemen Pengguna (`UsersManagementPage.tsx`)**:
   - Membuat antarmuka pengguna dengan desain tabel yang estetis (glassmorphism/premium design).
   - Menambahkan status loading dan *empty states*.
   - Tabel menampilkan daftar pengguna (Username, Email, Role, Status, Joined Date).
2. **Integrasi Endpoint Backend**:
   - Fungsi `fetchUsers`: Mengambil data dari `GET /api/users`.
   - Fungsi `handleRoleChange`: Memperbarui role pengguna menjadi `ADMIN` atau `USER` melalui `PUT /api/users/:id/role`.
   - Fungsi `handleStatusChange`: Mengaktifkan atau menonaktifkan pengguna melalui `PUT /api/users/:id/active`.
   - Fungsi `handleDelete`: Menghapus pengguna (soft delete / deactivate depending on backend implementation) melalui `DELETE /api/users/:id`.
3. **Pembaruan Navigasi**:
   - Mendaftarkan rute `/users` di `App.tsx`.
   - Menambahkan menu **User Management** di `SidebarNav.tsx` yang hanya muncul secara kondisional jika pengguna memiliki peran (role) `ADMIN`.

## Status: Selesai
