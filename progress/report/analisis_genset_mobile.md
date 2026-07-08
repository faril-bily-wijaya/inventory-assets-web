# Analisis Data Genset Mobile & Dummy Load

Berdasarkan pembacaan file Excel `Dummy Load & Genset Mobile.xlsx`, berikut adalah temuan dari struktur dan isi data:

## 1. Struktur File Excel
File memiliki 4 *sheet*:
- **REKAP**: Berisi rangkuman seluruh data dari semua regional.
- **SBU, SBT, SBS**: Berisi data spesifik untuk masing-masing regional.

## 2. Kolom-kolom Utama (Field Mapping)
Data pada *sheet* regional (SBU, SBT, SBS) memiliki baris judul (*header*) pada baris kedua, dengan kolom:
1. **Perangkat**: Jenis perangkat, isinya antara `"Genset Mobile"`, `"Genset Mobil"`, atau `"Dummy Load"`. Ini akan dipetakan ke `device_type`.
2. **Distrik**: Nama distrik (misal: "BANDA ACEH", "Palembang"). Akan dipetakan ke hierarki `district`.
3. **STO**: Lokasi penitipan/basis perangkat (misal: "Lamteumen", "Palembang Centrum"). Akan dipetakan ke `location_id` (tabel `locations`).
4. **MERK**: (Khusus di SBU) Merek perangkat seperti "JHONDARE", "DEUTZ". Dipetakan ke `brand`.
5. **Kapasitas (KVA) / A**: Kapasitas perangkat. Untuk Genset biasanya berakhiran "KVA" atau angka saja (misal "20", "50", "15 kVa"). Untuk Dummy Load menggunakan Ampere (misal "300 A", "500 A"). Ini harus dipecah menjadi `kapasitas` (angka) dan `satuan_kapasitas` (KVA / A).
6. **Kondisi**: Status fisik perangkat ("Bagus", "Rusak"). Dipetakan ke `condition`.
7. **MYASSET ID**: ID aset dari sistem lain (misal "BELUM MASUK MY ASSET"). Bisa dipetakan ke `label_code` atau `uuid`.
8. **KETERANGAN**: Catatan tambahan (misal "Tidak ada battre starter"). Dipetakan ke `keterangan`.

## 3. Analisis Kebutuhan Arsitektur Data
- **Kecocokan Tabel Utama**: Data *Genset Mobile* dan *Dummy Load* **sangat cocok** untuk dimasukkan ke dalam tabel `devices` yang sudah ada. Kita tidak perlu membuat tabel baru khusus untuk perangkat ini.
- **Location / STO**: Meskipun Genset ini bersifat *mobile* (berpindah-pindah), di dalam Excel ia selalu dikaitkan dengan satu **STO** (sebagai *base* atau pangkalan utamanya). Oleh karena itu, skema `location_id` yang sekarang sudah sangat tepat.
- **Kapasitas & Satuan**: Kita perlu memastikan kolom `kapasitas` dan `satuan_kapasitas` (KVA / A) terisi dengan benar. Tabel `devices` kita sudah memiliki kolom-kolom ini.
- **Status (Aktif/Idle/Rusak)**: Kita bisa menurunkan kolom `status` sistem kita (OPERATIONAL, CRITICAL, INACTIVE) dari kolom `Kondisi` di Excel (Bagus -> OPERATIONAL, Rusak -> CRITICAL).

## 4. Kesimpulan Format & Bentuk Tabel
Kita **TIDAK PERLU** merombak skema basis data (*database*). Semua kolom yang dibutuhkan oleh *Genset Mobile* dan *Dummy Load* sudah terakomodasi di tabel `devices`. 

Yang perlu kita lakukan adalah:
1. Menyiapkan **skrip Importer khusus** atau menambahkan tipe ini ke logika import yang sudah ada agar format Excel ini bisa masuk dengan mulus ke tabel `devices`.
2. Jika diperlukan, membuat **Tampilan Khusus (View/Tab)** di *Frontend* (pada halaman Perangkat) untuk memfilter khusus "Genset Mobile" dan "Dummy Load", karena perangkat ini sering dipantau secara terpisah oleh manajemen.
