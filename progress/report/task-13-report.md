# Laporan Task 13: Perbaikan Form Validasi (Save Changes Tidak Merespon)

## Apa yang telah dilakukan:
1. **Zod Preprocess untuk Angka Kosong**: 
   - Di `frontend/src/components/modals/DeviceModal.tsx`, kolom yang berjenis angka seperti Tahun (`year`), Usia Perangkat, dan Beban Arus kini dibungkus dengan *preprocess*. Jika pengguna mengosongkan kolom (atau jika dari awal datanya kosong), sistem akan menganggapnya `undefined` alih-alih `NaN` (Not a Number), sehingga lolos validasi `Zod`.
2. **Penanganan Null Value**:
   - Fungsi `reset()` diperbarui menggunakan ekspresi logika seperti `device.deviceCode || ''`. Apabila nilai dari backend adalah `null` (data aslinya belum diisi), form akan mengubahnya menjadi string kosong (`""`) alih-alih mengoper `null` ke form yang mana ditolak mentah-mentah oleh `Zod`.
3. **Notifikasi *Error* Otomatis**:
   - Ditambahkan callback `onError` pada fungsi `handleSubmit`. Jika tombol "Save Changes" ditekan tapi form masih memiliki peringatan error tersembunyi (misal karena user sedang *scroll* ke bawah dan ada input wajib di atas yang belum terisi), maka pop-up pesan *error* "Mohon lengkapi kolom yang wajib diisi (berwarna merah)" akan otomatis muncul.

## Status: Selesai
