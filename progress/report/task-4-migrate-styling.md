# Task 4 Report: Migrasi Styling & Ikon Kustom Peta

**Status**: Selesai ✅

## Apa yang telah dilakukan:
1. **Pembaruan CSS Global:** Menambahkan CSS kustom dari `source-web/src/index.css` (kelas `custom-scrollbar`, overrides untuk pop-up premium Leaflet seperti `leaflet-popup-content-wrapper`, dan `custom-icon svg`) ke file `frontend/src/index.css`.
2. **Kustomisasi Leaflet DivIcon:** Memodifikasi `LocationMarker.tsx` dengan menghapus div bulat biasa dan menggantinya dengan ikon SVG khusus seperti pada referensi.
   - **Ikon Oranye (Zap/Petir):** Digunakan bila marker tersebut 100% perangkat Catu Daya.
   - **Ikon Biru (Server):** Digunakan bila marker tersebut 100% perangkat Non-Catu Daya.
   - **Ikon Indigo (Mixed/Campuran):** Digunakan jika dalam satu lokasi terdapat gabungan keduanya.
3. **Efek Animasi Pulse:** Jika properti `worstStatus` dari sebuah lokasi adalah `critical`, marker akan otomatis memiliki kelas `animate-pulse` dan `ring-4` berwarna merah untuk menarik perhatian user.

Selanjutnya adalah **Task 5**, yaitu mengubah Popup/Tooltip marker menjadi "Premium Tooltip" interaktif dan mengambil data alamat lengkap.
