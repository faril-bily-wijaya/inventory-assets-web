# Laporan Task 12: Perbaikan Form Edit Perangkat

## Apa yang telah dilakukan:
1. **Penerapan useEffect**: 
   - Menambahkan *hook* `useEffect` di dalam komponen `DeviceModal.tsx`.
   - Mengatur parameter *dependency* pada array `[device, reset]`, yang berarti efek ini akan terpanggil ulang jika prop `device` (data yang dipilih dari tombol Edit) berganti ke perangkat yang lain.
2. **Pemanggilan Reset Paksa**:
   - Di dalam `useEffect` tersebut, saya memanggil fungsi `reset(...)` dari pustaka `react-hook-form`. Fungsi ini akan menimpa seluruh kolom (field) di dalam modal dengan data spesifik milik perangkat yang sedang diklik.

## Status: Selesai
