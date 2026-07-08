# Analisis Tampilan Modal "Create Device"

Berdasarkan *screenshot* dan pengecekan kode pada file `DeviceModal.tsx`:
1. **Masalah Utama:** Komponen dropdown untuk pemilihan "Location" saat ini masih menggunakan elemen `<Select>` bawaan HTML biasa. Karena jumlah lokasi (STO/Site) sangat banyak, daftar opsi memanjang ke bawah hingga menembus batas modal dan terlihat berantakan di layar.
2. **Keterbatasan HTML Select:** Elemen `<select>` murni sulit diatur tinggi maksimalnya (*max-height*) dan gaya visualnya sangat bergantung pada sistem operasi pengguna (berbeda-beda di setiap browser).
3. **Solusi yang Diperlukan:** Mengganti `<Select>` tersebut dengan komponen `SearchableSelect` yang telah kita buat sebelumnya.
4. **Tantangan Teknis:** Modal ini menggunakan pustaka `react-hook-form` (RHF) untuk manajemen data (*state*). Komponen `SearchableSelect` kita bukan elemen input standar, sehingga kita tidak bisa sekadar menggunakan sintaks `{...register('locationId')}`. Kita harus membungkusnya dengan komponen `<Controller>` dari RHF agar nilai yang dipilih bisa tersimpan ke dalam form dengan benar.
