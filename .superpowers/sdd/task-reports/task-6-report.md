# Task 6 Report: Bug Fixing Deployment, Database Relasi, Port Conflict & Authentication

## 1. Latar Belakang Masalah
Dalam sesi ini, kita melakukan proses penyelesaian beberapa masalah kritis (bug fixing) yang terjadi saat *deploy* aplikasi ke VPS (Virtual Private Server). Masalah tersebut mencakup error kompilasi TypeScript, konflik port dengan aplikasi yang sudah ada (`budget_system_and_bot`), hingga kegagalan otentikasi login.

## 2. Rincian Pekerjaan yang Telah Dilakukan

### A. Memperbaiki Error TypeScript Build di VPS (Prisma Relation Names)
* **Masalah:** Saat menjalankan `docker compose up -d --build` di VPS, proses build *backend* selalu gagal dengan error TypeScript seperti: `Object literal may only specify known properties, but 'cluster' does not exist in type 'locationsInclude<DefaultArgs>'. Did you mean to write 'clusters'?`.
* **Analisis:** Terjadi perbedaan antara hasil *generate* Prisma Client di VPS dengan di lokal. Di VPS, Prisma Client di-*generate* berdasarkan `schema.prisma` yang memiliki nama relasi berbentuk jamak (plural) seperti `clusters`, `districts`, dan `regionals` (kemungkinan dari hasil sinkronisasi database sebelumnya). Sedangkan kode API kita masih memanggil relasi dalam bentuk tunggal (singular) seperti `cluster`.
* **Tindakan:** 
  - Mengubah penamaan relasi di file `backend/prisma/schema.prisma` agar konsisten menggunakan bentuk jamak (plural).
  - Memperbaiki semua pemanggilan relasi di dalam *routes* (`devices.routes.ts`, `hierarchy.routes.ts`, `locations.routes.ts`) menjadi jamak (contoh: `cluster` -> `clusters`).
  - Menjalankan `npm run build` lokal untuk memastikan tidak ada lagi *type errors*, lalu mem-*push* perbaikan ke GitHub. 

### B. Mengatasi Konflik Port 80 dan 8080 (Docker Compose)
* **Masalah:** Setelah *build* berhasil, container gagal berjalan dengan error `address already in use` pada port 8080. Awalnya frontend juga mencoba menggunakan port 80.
* **Analisis:** VPS tersebut sudah menjalankan aplikasi web lain (`budget_system_and_bot`) yang secara aktif menggunakan port 80 untuk tampilan (frontend) dan port 8080 untuk API (backend). 
* **Tindakan:**
  - Mengubah file `docker-compose.yml` untuk menghindari konflik secara permanen.
  - **Backend:** Menghapus sepenuhnya konfigurasi `ports` untuk *backend*. *Backend* sekarang berjalan secara tersembunyi di jaringan internal Docker dan diakses oleh Nginx frontend, sehingga tidak perlu mengekspos port ke *host* VPS.
  - **Frontend:** Mengubah port yang diekspos menjadi port **3001** (setelah menganalisis hasil `sudo ufw status` dan `netstat` untuk memastikan port tersebut berstatus *ALLOW* di firewall lokal Ubuntu dan tidak sedang digunakan).

### C. Memperbaiki Gagal Login (401 Unauthorized)
* **Masalah:** Setelah aplikasi berhasil berjalan di port 3001, percobaan login menggunakan *username* `admin` dan *password* `admin123` selalu mendapatkan error `401 Unauthorized`.
* **Analisis:** Melakukan pengecekan langsung ke *database* Supabase menggunakan *query* SQL. Ditemukan bahwa *password hash* yang tersimpan di dalam database untuk akun `admin` ternyata tidak cocok dengan *hash* dari kata sandi `admin123`.
* **Tindakan:**
  - Melakukan *hashing* manual terhadap string `admin123` menggunakan `bcrypt`.
  - Menjalankan perintah SQL `UPDATE users SET password = '[new_hash]' WHERE username = 'admin'` langsung di database Supabase. Login berhasil berfungsi normal kembali.

### D. Perancangan Arsitektur Web Satu Port (Reverse Proxy)
* **Tindakan:** Menjelaskan kepada pengguna mengenai cara kerja arsitektur *Reverse Proxy* di Nginx. Aplikasi tidak membutuhkan 2 port terbuka untuk publik (seperti aplikasi sebelumnya), melainkan cukup 1 port saja (3001). Segala jenis pemanggilan API ke `/api/*` secara otomatis diarahkan ke *backend* oleh Nginx tanpa perlu mengekspos API secara langsung ke publik, meningkatkan efisiensi dan keamanan.

### E. Solusi Jangka Panjang untuk Akses Banyak User
* **Tindakan:** Karena port 3001 tertutup oleh *Firewall* bawaan penyedia *Cloud VPS*, pengguna tidak bisa mengakses aplikasi. Dibuatkan 3 rekomendasi solusi produksi:
  1. **Jalur Sub-Folder:** Memodifikasi konfigurasi Vite & Nginx agar aplikasi berjalan di sub-path (misal: `http://[IP]/inventory`).
  2. **Buka Port 3001:** Meminta izin kepada pemegang akun Cloud VPS untuk membuka port 3001 pada menu keamanan.
  3. **Sub-domain Asli:** Memanfaatkan layanan DNS domain resmi kantor/perusahaan.

## 3. Status Saat Ini
Semua bug *critical* telah tertangani. Aplikasi sudah berhasil di-*build* 100% tanpa error, terkoneksi dengan database, dan fitur login berjalan lancar. Pekerjaan di sisi kode aplikasi sementara dihentikan karena terhambat oleh masalah infrastruktur.

## 4. Daftar Tugas yang Belum Selesai (Pending Tasks)
Berikut adalah daftar hal-hal yang masih harus diselesaikan agar aplikasi ini dapat digunakan oleh publik secara penuh:

- [ ] **Membuka Akses Port 3001 di Cloud Provider:** Menunggu tim IT / pemegang akun *Cloud VPS* untuk membuka pengaturan **Inbound TCP Port 3001** di dashboard (Security Group / Cloud Firewall) agar aplikasi bisa diakses via IP langsung (`http://124.156.204.209:3001`).
- [ ] **(Alternatif) Implementasi Reverse Proxy / Sub-folder:** Jika opsi membuka port 3001 tidak memungkinkan, maka perlu mengonfigurasi Nginx utama VPS untuk *routing* trafik melalui URL sub-folder (`http://124.156.204.209/inventory`) atau sub-domain (`inventory.perusahaan.com`).
- [ ] **Pengujian oleh Banyak User (UAT):** Setelah URL / akses web tersedia untuk umum, perlu dilakukan simulasi login dan *User Acceptance Testing* dari beberapa perangkat sekaligus untuk memastikan sesi tidak bocor.
