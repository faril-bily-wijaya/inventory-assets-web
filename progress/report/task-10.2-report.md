# Laporan Task 10.2: Peningkatan Halaman Pengaturan (Settings Page)

## Apa yang telah dilakukan:
1. **Endpoint Backend**: Menambahkan dua endpoint baru di `backend/src/routes/auth.routes.ts`:
   - `PUT /api/auth/me`: Untuk memperbarui profil (Username, Email, Full Name).
   - `PUT /api/auth/me/password`: Untuk memperbarui password dengan validasi password lama.
2. **Konteks Auth Frontend**: Memperbarui `AuthContext.tsx` dengan menambahkan fungsi `updateProfile` yang juga akan memperbarui data *user* yang tersimpan di `localStorage` / `sessionStorage`.
3. **Desain Ulang SettingsPage**: 
   - Merombak struktur `SettingsPage.tsx` menjadi dua *Tabs*: **Profile Information** dan **Security**.
   - **Tab Profil**: Menyediakan form untuk mengedit `username`, `email`, dan `full_name`.
   - **Tab Keamanan**: Menyediakan form untuk mengubah password, dilengkapi dengan *toggle* visibilitas password (ikon mata) dan validasi kecocokan *confirm password*.
   - Menambahkan notifikasi *toast* (sukses/gagal) pada setiap form *submit*.

## Status: Selesai
