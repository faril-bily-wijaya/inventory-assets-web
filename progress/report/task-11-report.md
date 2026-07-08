# Laporan Task 11: Akses Cepat Edit & Hapus Perangkat di Tabel Modal

## Apa yang telah dilakukan:
1. **Penyesuaian Layering (Z-Index)**:
   - Komponen induk `<Modal>` (`frontend/src/components/ui/Modal.tsx`) telah ditingkatkan z-index-nya menjadi `z-[9999]` agar form Edit dan form Konfirmasi Hapus selalu muncul di atas layer modal tabel (`z-[2000]`).
2. **Penambahan Kolom dan Tombol Aksi**:
   - Di `LocationTableModal.tsx`, header tabel baru bernama **AKSI** telah ditambahkan di ujung kanan.
   - Pada setiap baris data, ditambahkan dua tombol ikon yang tersembunyi namun akan muncul saat *hover* (efek transisi). Yaitu ikon Pensil (Edit) dan Tong Sampah (Delete).
3. **Integrasi Logika Aksi**:
   - Saat pengguna menekan Edit, form `DeviceModal` akan terbuka dengan data yang sudah terisi (*pre-filled*). Jika disimpan (`onSuccess`), sistem otomatis memanggil fungsi `refreshMapData()` untuk mere-fetch dari *backend*.
   - Saat menekan Delete, modal konfirmasi (`ConfirmModal`) akan muncul agar tidak ada data yang terhapus secara tidak sengaja. Saat konfirmasi "Hapus" disetujui, perangkat otomatis terhapus dari tampilan secara *real-time*.

## Status: Selesai
