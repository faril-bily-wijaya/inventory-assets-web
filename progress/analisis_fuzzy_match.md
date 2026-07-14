# Analisis & Rencana Implementasi: Perbaikan Logika Pencarian Lokasi Otomatis (Fuzzy Match)

## Hasil Investigasi Mengapa Sistem Gagal Menempelkan Genset
Pertanyaan Anda sangat tepat! Mengapa sistem tidak menggunakan data perangkat yang sudah ada lokasinya?
Ternyata, sistem kita **SUDAH** mencoba melakukannya, tapi gagal total karena satu hal sepele: **Perbedaan Huruf Besar/Kecil (Case Sensitivity)** antara file Perangkat Utama dan file Genset!

Berikut bukti dari dalam database Anda:
1. Di file perangkat utama, Distrik Anda ditulis **"BENGKULU"** (huruf besar semua).
2. Di file Genset (`Book1.xlsx`), Distrik Anda ditulis **"Bengkulu"** (huruf kecil).
3. Karena perbedaan huruf ini, sistem kita menganggap bahwa itu adalah dua distrik yang berbeda! Sehingga sistem membuat Distrik baru bernama "Bengkulu".
4. Selain itu, nama STO di perangkat utama tersimpan sebagai **"MDF BENGKULU CENTRUM"**, sedangkan di Genset bernama **"Bengkulu Centrum"**.

Karena sistem menganggap Genset berada di Distrik yang berbeda ("Bengkulu" vs "BENGKULU"), sistem gagal mengaitkan "Bengkulu Centrum" dengan "MDF BENGKULU CENTRUM". Akhirnya, ia membuat lokasi baru dan melemparnya lagi ke spiral (-3.5, 103.5)!

## Rencana Perbaikan (Implementation Plan)

Kita harus membuat sistem pengenalan Area, Regional, Distrik, dan Cluster menjadi **Kebal Huruf Besar/Kecil (Case-Insensitive)**.

### Task 1: Membuat Map Pencarian Menjadi Case-Insensitive
- Mengubah logika di `backend/src/services/importService.ts` pada saat memuat `distByName`, `regByName`, `clusterByName`, `locByName`, dan `deviceByCode`.
- Mengubah *key* dari *Map* tersebut menjadi huruf kecil (menggunakan `.toLowerCase()`).
- Saat sistem membaca data Excel (seperti "Bengkulu" atau "BENGKULU"), sistem akan merubahnya menjadi "bengkulu" terlebih dahulu sebelum mencocokkannya ke *database*.

Dengan perbaikan ini, biarpun Anda menulis "BENGKULU", "Bengkulu", atau "bEnGkUlU", sistem akan tahu bahwa itu adalah Distrik yang sama. Sehingga, Genset "Bengkulu Centrum" akan berhasil menemukan STO "MDF BENGKULU CENTRUM" yang sudah punya koordinat benar.

### Task 2: Pengujian & Deploy
- Melakukan verifikasi *script* baru.
- Push ke GitHub dan jalankan VPS Deploy.
- Menghapus kembali data Distrik/Lokasi "Bengkulu" yang salah tadi dari database agar bersih.

---
Apakah Anda setuju dengan rencana perbaikan ini? Jika iya, saya akan segera mengeksekusi *task*-nya!
