# Task 2: Database Indexing & Soft Delete (Prisma)

**Tujuan:**
Menambahkan Index pada kolom *foreign key* untuk mempercepat *query* filter, serta memastikan *Soft Delete* berjalan konsisten di tabel `devices`.

**Status:**
- [x] Tambahkan `@@index` di `schema.prisma`
- [x] Push schema Prisma & migrate db
- [x] Pastikan query API hanya mengambil data yang belum dihapus (Soft Delete check)
