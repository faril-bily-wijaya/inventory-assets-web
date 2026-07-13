# Report: Mobile UI/UX Improvements (Task 3, 4, 6)

## Task 3: Filter Panel
- Filter panel yang tadinya dipaksa menyamping (menggunakan `flex`) sekarang telah disesuaikan agar pada layar HP (mobile) menurun secara vertikal (`flex-col`), dan baru akan menyamping pada ukuran layar yang lebih besar (`sm:flex-row`). Hal ini akan mencegah teks di dalam kotak pilihan menjadi terpotong.

## Task 4: Device Table (Daftar Perangkat)
- Mengimplementasikan `whitespace-nowrap` pada seluruh elemen Header Table (`<th>`) dari daftar perangkat.
- Hal ini sangat penting untuk memastikan kolom-kolom seperti "YEAR & AGE" atau "SN & LABEL" tidak terlipat menjadi 3 baris ke bawah, melainkan tetap dalam satu baris horisontal yang rapi. Pengguna tetap bisa menggeser (scroll) tabel ke arah samping dengan nyaman.

## Task 6: Safe Area Padding (Bottom Bar Fix)
- Menambahkan padding bawah yang lebih besar (dari `p-6` menjadi `pb-24`) secara spesifik pada mode mobile di dalam container utama `DevicesPage.tsx`. 
- Penambahan ruang kosong ini akan mengangkat elemen pagination (teks "Showing..." dan tombol "Next/Previous") ke atas, sehingga tidak akan bertabrakan dengan indikator *Home* atau *Gesture Bar* di bagian bawah HP pengguna.
