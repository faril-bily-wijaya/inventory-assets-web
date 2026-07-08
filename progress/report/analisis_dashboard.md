# Analisis Fitur Dashboard Analitik Aset

Berdasarkan *screenshot* yang diberikan dan pemeriksaan kode pada file `AnalyticsModal.tsx`, berikut adalah hasil analisis mengenai fitur *Dashboard* saat ini:

## 1. Analisis Visual (Berdasarkan Screenshot)

- **Bar Chart (Top 10 Lokasi):**
  - **Masalah Utama:** Label pada sumbu Y (nama lokasi seperti "MDF BENGKULU CENTRUM", "PALEMBANG CENTRUM") terlihat tumpang tindih, terpotong, atau memaksa turun baris secara tidak wajar. Hal ini karena batasan lebar teks yang disetel terlalu kecil (`width={100}`) sehingga teks memakan ruang *chart*.
  - Warna bar ungu (`#4f46e5`) terlihat cukup bagus dan *modern*, namun bisa ditambahkan sedikit radius pada ujung bar agar lebih elegan (saat ini sudah ada radius tapi mungkin kurang terlihat).
- **Pie/Donut Chart (Rasio Status):**
  - Pemilihan warna sudah baik (Hijau untuk *Operational*, Merah untuk *Non-Operational*).
  - Terdapat ruang kosong di tengah (*donut hole*) yang sangat luas. Ini bisa dimanfaatkan untuk menampilkan total perangkat atau angka statistik penting agar ruang tidak terbuang sia-sia.
  - Saat ini label hanya mengandalkan *Legend* di bagian bawah.

## 2. Analisis Kode (AnalyticsModal.tsx)

- Data *Dashboard* sepenuhnya *real-time* dan reaktif terhadap filter yang sedang aktif di *Sidebar* (seperti filter Catu Daya, Status, Kondisi). Ini adalah pendekatan yang sangat baik secara arsitektur!
- Logika penyusunan data (`useMemo`) menghitung ulang total, memisahkan status (aktif/rusak), dan mengambil 10 lokasi teratas.
- **Konfigurasi BarChart:**
  ```tsx
  <BarChart data={topLocations} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
  ```
  Nilai `width={100}` dan `left: 20` adalah penyebab label bertumpuk. Kita perlu memperbesar lebar area label agar nama lokasi yang panjang tidak rusak.

- **Konfigurasi PieChart:**
  Terdapat `innerRadius={60}` dan `outerRadius={100}`. Ruang di tengah (*center*) ini kosong.

## 3. Rekomendasi Perbaikan (UX/UI)
1. **Perbaiki Margin & Lebar Y-Axis BarChart:** Ubah `width` pada `YAxis` menjadi lebih lebar (misal `150` atau `180`) agar nama lokasi tidak berantakan, serta tambahkan sedikit jarak di margin.
2. **Tambahkan Label di Tengah Donut Chart:** Menambahkan label persentase atau teks "Total Perangkat" di bagian tengah Donut Chart agar visualnya terasa lebih penuh dan *insightful*.
3. **Tambahkan Custom Tooltip:** Mempercantik kotak info (*tooltip*) saat bar atau donut di-*hover* agar terlihat lebih rapi.
