# Report: Mobile UI/UX Improvements (Task 5)

## Task 5: Map Floating Buttons
- Mengurangi ukuran padding (dari `p-4` menjadi `p-3`), memperkecil ukuran ikon (dari `w-6` menjadi `w-5`), dan menipiskan ketebalan border tombol melayang (seperti tombol GPS, Heatmap, dan Cover Area) pada `MapView.tsx` khusus untuk layar HP.
- Mengatur ulang jarak susunan vertikalnya (bottom margin) agar tidak terlalu renggang, serta merapatkannya sedikit ke tepi kanan layar (`right-4`).
- Hasilnya, tombol-tombol peta kini terlihat jauh lebih proporsional di HP (tidak memakan layar), namun secara otomatis akan kembali ke ukuran besarnya yang semula jika dibuka di PC/Desktop.
