# Analisis & Rencana Implementasi: Perbaikan Composite Key Hierarki

## Penemuan Bug (Mengapa Palembang ada di Bengkulu)
Anda menemukan sebuah *bug* yang sangat menarik dan bersembunyi di balik sistem! 

Di file Genset (`Book1.xlsx`), Anda **tidak mengisi kolom Cluster**. Akibatnya, sistem otomatis memberikan nama `'CLUSTER DEFAULT'` untuk semua baris Genset tersebut.

Namun, sistem pemetaan (*Map*) di kode kita saat ini **hanya menggunakan nama Cluster sebagai kunci pencariannya**.
Artinya, ketika sistem membaca "Palembang Centrum", ia melihat clusternya adalah `'CLUSTER DEFAULT'`. Sistem kemudian mencari di database: *"Apakah ada cluster bernama CLUSTER DEFAULT?"*.
Sistem menemukannya! Tapi, `'CLUSTER DEFAULT'` pertama yang ditemukan oleh sistem ternyata adalah miliknya distrik **Bengkulu** (karena Bengkulu diproses di baris pertama). 

Akibatnya:
1. **Semua Genset dari seluruh kota** (Palembang, Jambi, Aceh, dll) dimasukkan secara paksa ke dalam satu `'CLUSTER DEFAULT'` yang sama, yaitu milik Bengkulu.
2. Karena mereka dianggap satu Cluster dengan Bengkulu, mereka semua **mengambil koordinat fallback dari Bengkulu (-3.8, 102.2667)**!

Inilah sebabnya mengapa "Palembang Centrum" dan 30+ lokasi lainnya mendarat di Bengkulu. 

## Rencana Perbaikan (Implementation Plan)

Kita harus membuat sistem pemetaan hierarki (Regional, Distrik, Cluster) menggunakan **Kunci Kombinasi (Composite Key)**.

### Task 1: Update Logika Pemetaan di `importService.ts`
- `areaByName` tetap menggunakan nama area.
- `regByName` akan menggunakan gabungan ID Area + Nama Regional.
- `distByName` akan menggunakan gabungan ID Regional + Nama Distrik.
- `clusterByName` akan menggunakan gabungan ID Distrik + Nama Cluster.
- Dengan cara ini, `'CLUSTER DEFAULT'` milik Palembang akan dibedakan dari `'CLUSTER DEFAULT'` milik Bengkulu.

### Task 2: Pengujian, Deploy, & Pembersihan Database
- *Push* perbaikan ini ke GitHub dan jalankan *deploy* ke VPS.
- Saya akan membuat dan menjalankan *script* untuk menghapus semua lokasi yang salah sasaran akibat *bug* `'CLUSTER DEFAULT'` ini agar Anda bisa meng-*import* ulang dengan bersih.

---
**Mohon konfirmasinya:**
Apakah Anda setuju dengan rencana perbaikan *Composite Key* ini? Setelah Anda setuju, saya akan langsung mengeksekusinya!
