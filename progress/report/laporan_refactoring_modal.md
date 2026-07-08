# Laporan Pengerjaan: Refactoring Dropdown Modal Perangkat

## Task 1: Perbaikan Bug "No Cluster"
- Mengubah struktur pemanggilan properti relasi Prisma dari `l.cluster?.name` menjadi `l.clusters?.name` di file `DeviceModal.tsx`.
- Perubahan ini memperbaiki isu *typo* yang membuat nama kluster selalu gagal dipanggil (sehingga sistem selalu mencetak nilai cadangan "No Cluster").

## Task 2 & 3: Migrasi Dropdown Native ke SearchableSelect
- Menambahkan *import* untuk komponen `Controller` dari `react-hook-form` beserta `SearchableSelect` ke dalam modal *Create Device*.
- Menggabungkan elemen `control` dari hasil *destructuring* *hook* `useForm`.
- Membuang komponen pembungkus `<Select>` bawaan dan menggantinya dengan `<Controller>` dari *react-hook-form*.
- Menyambungkan atribut `field.value` dan `field.onChange` yang dihasilkan oleh *Controller* langsung ke komponen `<SearchableSelect>`.
- Mengonversi pemetaan opsi ke dalam format `{ value, label }` yang didukung oleh `SearchableSelect`.

## Kesimpulan
Dropdown pemilihan lokasi di form *Create/Edit Device* kini tampil seragam dengan gaya antarmuka utama, mendukung fungsi pencarian pintar, membatasi tinggi maksimum (sehingga tidak membentang melampaui ukuran modal), dan akhirnya menampilkan relasi nama kluster secara presisi.
