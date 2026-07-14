# Progress Ledger - Map Inventory Asset Management

## Project: TIF Indonesia - Map Inventory Asset Management

### Plan
docs/superpowers/plans/2026-06-30-map-inventory-implementation.md

---

## Tasks

| Task | Status | Commits | Notes |
|------|--------|---------|-------|
| Task 1 | COMPLETE | feat: setup frontend project | TailwindCSS v4 installed, build verified |
| Task 2 | COMPLETE | feat: create file validation utilities | 15 tests passing |
| Task 3 | COMPLETE | feat: create file parser | 10 tests passing |
| Task 4 | COMPLETE | feat: create import service | Mock Prisma tests passing |
| Task 5 | COMPLETE | feat: create import API endpoints | Upload/preview/template endpoints |
| Task 6 | COMPLETE | feat: create location devices endpoint | Catu daya categorization |
| Task 7 | COMPLETE | feat: create import types and service | Types and API service |
| Task 8 | COMPLETE | feat: create import components | FileDropzone, ModeSelector, etc |
| Task 9 | COMPLETE | feat: update devices page with tabs | Daftar/Import tabs |
| Task 10 | COMPLETE | feat: enhance map popup | DeviceSection, DeviceListModal |
| Task 11 | COMPLETE | feat: Docker configuration | docker-compose with network |

---

## Plan 2: Add UUID & Organization Fields
docs/superpowers/plans/2026-07-03-add-uuid-organization-fields-plan.md

| Task | Status | Commits | Notes |
|------|--------|---------|-------|
| Task 1 | COMPLETE | 0a80b68 | Prisma schema + migration created |
| Task 2 | IN_PROGRESS | - | Import service update |
| Task 2 | PENDING | - | Import service update |
| Task 3 | PENDING | - | Frontend types update |
| Task 4 | PENDING | - | DeviceModal update |
| Task 5 | PENDING | - | DevicesPage table update |
| Task 6 | PENDING | - | Template CSV update |

---

## Configuration References (from COMPLETE_REBUILD_SCRIPT.md)

### Supabase
- Project ID: `epqmzlnhculyqflbbulq`
- Database Password: `Inventoryassetsweb`
- Database URL: `postgresql://postgres:Inventoryassetsweb@db.epqmzlnhculyqflbbulq.supabase.co:5432/postgres`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc2OTI0OCwiZXhwIjoyMDk4MzQ1MjQ4fQ.X-f5ScV_h8v6kvw8zFk_06K3GD7M4jTXNwgz2nG-C0w`
- JWT Secret: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo`

### VPS
- IP: `124.156.204.209`
- SSH Password: `zpv-c6V-iYp-Vxw`
- Backend Port: `8080`

### GitHub
- Repo URL: `https://github.com/faril-bily-wijaya/inventory-assets-web.git`

### Default Login
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

### Database Tables (Already Created)
- users, regionals, districts, clusters, locations, devices

---

## Design System

### Color Palette
- Dark Mode Primary: `#0B1120`
- Dark Mode Accent: `#22D3EE` (Cyan)
- Light Mode Primary: `#F5F7FA`
- Light Mode Accent: `#0891B2` (Teal)
- Success: `#34D399` / `#059669`
- Warning: `#FBBF24` / `#D97706`
- Danger: `#F87171` / `#DC2626`

### Typography
- Font: Plus Jakarta Sans
- Monospace: JetBrains Mono

---

## Plan 3: CRUD Lokasi STO/Site
docs/superpowers/plans/2026-07-14-crud-lokasi-sto-plan.md
BASE commit: c894fa345ed724e41b5214135636a661c5ce6e02

| Task | Status | Commits | Notes |
|------|--------|---------|-------|
| Task 1 | COMPLETE | 11e6385 | Backend soft delete + cache invalidation |
| Task 2 | COMPLETE | fc772cf | Frontend LocationFormModal |
| Task 3 | COMPLETE | 22512a4 | Frontend integration |

---
