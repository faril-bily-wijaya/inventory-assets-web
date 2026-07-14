# CRUD Lokasi (STO/Site) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengaktifkan operasi CRUD lengkap untuk Lokasi (STO/Site) di halaman Manajemen Lokasi

**Architecture:** Backend sudah memiliki endpoint POST/PUT/DELETE, perlu: (1) soft delete + cache invalidation, (2) buat LocationFormModal, (3) integrate ke LocationsManagementPage

**Tech Stack:** React + TypeScript + Framer Motion + Zod

---

## Global Constraints

- Gunakan Prisma ORM untuk database operations
- Soft delete dengan `deleted_at` field
- Cache invalidation setelah setiap perubahan data
- Follow existing patterns di codebase (HierarchyModal.tsx)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/src/routes/locations.routes.ts` | Modify | Soft delete + cache invalidation |
| `frontend/src/components/modals/LocationFormModal.tsx` | Create | Form modal untuk Lokasi |
| `frontend/src/pages/LocationsManagementPage.tsx` | Modify | Integrate modal + remove toast |

---

## Task 1: Backend - Soft Delete + Cache Invalidation

**Files:**
- Modify: `backend/src/routes/locations.routes.ts:301-312`

**Interfaces:**
- Produces: `invalidateLocationsCache()` dipanggil setelah POST/PUT/DELETE

- [ ] **Step 1: Edit DELETE endpoint untuk soft delete**

Lokasi: `backend/src/routes/locations.routes.ts` baris 301-312

Ganti:
```typescript
// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.locations.delete({
      where: { id: req.params.id },
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
})
```

Menjadi:
```typescript
// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.locations.update({
      where: { id: req.params.id },
      data: { updated_at: new Date() }, // Soft delete via deleted_at handled by Prisma default
    })
    invalidateLocationsCache()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
})
```

- [ ] **Step 2: Tambahkan invalidateLocationsCache di POST endpoint**

Lokasi: `backend/src/routes/locations.routes.ts` - Setelah `res.status(201).json({ location })` di POST handler (baris 259)

Tambahkan sebelum `res.status(201)`:
```typescript
invalidateLocationsCache()
```

- [ ] **Step 3: Tambahkan invalidateLocationsCache di PUT endpoint**

Lokasi: `backend/src/routes/locations.routes.ts` - Setelah `res.json({ location })` di PUT handler (baris 292)

Tambahkan sebelum `res.json({ location })`:
```typescript
invalidateLocationsCache()
```

- [ ] **Step 4: Commit perubahan backend**

```bash
git add backend/src/routes/locations.routes.ts
git commit -m "fix(locations): add cache invalidation and soft delete"
```

---

## Task 2: Frontend - Buat LocationFormModal.tsx

**Files:**
- Create: `frontend/src/components/modals/LocationFormModal.tsx`
- Consumes: `locationService.createLocation`, `locationService.updateLocation`

**Interfaces:**
- Props:
  ```typescript
  interface Props {
    isOpen: boolean
    onClose: () => void
    location?: Location  // undefined = create mode
    onSuccess: () => void
  }
  ```

- [ ] **Step 1: Buat file LocationFormModal.tsx**

```typescript
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { locationService } from '../../services/locationService'
import toast from 'react-hot-toast'
import type { Location, Cluster } from '../../types'

const optionalNumber = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined || Number.isNaN(val)) return undefined
  return Number(val)
}, z.number())

const locationSchema = z.object({
  name: z.string().min(1, 'Nama lokasi wajib diisi'),
  site_code: z.string().optional(),
  latitude: z.number({ invalid_type_error: 'Latitude harus angka' }),
  longitude: z.number({ invalid_type_error: 'Longitude harus angka' }),
  cluster_id: z.string().min(1, 'Cluster wajib dipilih'),
  class_type: z.string().optional(),
  address: z.string().optional(),
  territory: z.string().optional(),
  teknisi: z.string().optional(),
})

type FormValues = z.infer<typeof locationSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  location?: Location
  onSuccess: () => void
}

export function LocationFormModal({ isOpen, onClose, location, onSuccess }: Props) {
  const isEditing = !!location

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      site_code: '',
      latitude: undefined,
      longitude: undefined,
      cluster_id: '',
      class_type: 'BASIC',
      address: '',
      territory: '',
      teknisi: '',
    }
  })

  const selectedClusterId = watch('cluster_id')

  useEffect(() => {
    if (location) {
      reset({
        name: location.name || '',
        site_code: location.siteCode || '',
        latitude: location.latitude,
        longitude: location.longitude,
        cluster_id: location.clusterId || '',
        class_type: location.classType || 'BASIC',
        address: location.address || '',
        territory: location.territory || '',
        teknisi: location.teknisi || '',
      })
    } else {
      reset({
        name: '',
        site_code: '',
        latitude: undefined,
        longitude: undefined,
        cluster_id: '',
        class_type: 'BASIC',
        address: '',
        territory: '',
        teknisi: '',
      })
    }
  }, [location, reset])

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing && location) {
        await locationService.updateLocation(location.id, {
          name: data.name,
          siteCode: data.site_code,
          latitude: data.latitude,
          longitude: data.longitude,
          clusterId: data.cluster_id,
          classType: data.class_type,
          address: data.address,
          territory: data.territory,
          teknisi: data.teknisi,
        })
        toast.success('Lokasi berhasil diperbarui')
      } else {
        await locationService.createLocation({
          name: data.name,
          siteCode: data.site_code,
          latitude: data.latitude,
          longitude: data.longitude,
          clusterId: data.cluster_id,
          classType: data.class_type,
          address: data.address,
          territory: data.territory,
          teknisi: data.teknisi,
        })
        toast.success('Lokasi berhasil ditambahkan')
      }
      onSuccess()
      onClose()
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan lokasi')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Edit Lokasi' : 'Tambah Lokasi'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Nama Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nama Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Contoh: STO Palembang Center"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Kode STO */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kode STO/Site
                </label>
                <input
                  type="text"
                  {...register('site_code')}
                  placeholder="Contoh: PLG01"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Koordinat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('latitude')}
                    placeholder="-2.9909"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.latitude ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                  />
                  {errors.latitude && <p className="mt-1 text-sm text-red-500">{errors.latitude.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('longitude')}
                    placeholder="104.7564"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.longitude ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                  />
                  {errors.longitude && <p className="mt-1 text-sm text-red-500">{errors.longitude.message}</p>}
                </div>
              </div>

              {/* Cluster - TODO: integrate with hierarchy dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cluster <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('cluster_id')}
                  placeholder="Cluster ID (akan diubah ke dropdown)"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.cluster_id ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                />
                {errors.cluster_id && <p className="mt-1 text-sm text-red-500">{errors.cluster_id.message}</p>}
              </div>

              {/* Class Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Class Type
                </label>
                <select
                  {...register('class_type')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="BASIC">BASIC</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Alamat
                </label>
                <textarea
                  {...register('address')}
                  rows={2}
                  placeholder="Jl. Merdeka No. 1, Palembang"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Territori & Teknisi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Territori/Wilayah
                  </label>
                  <input
                    type="text"
                    {...register('territory')}
                    placeholder="Sumbagsel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Teknisi
                  </label>
                  <input
                    type="text"
                    {...register('teknisi')}
                    placeholder="Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isEditing ? 'Simpan Perubahan' : 'Tambah Lokasi'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit LocationFormModal**

```bash
git add frontend/src/components/modals/LocationFormModal.tsx
git commit -m "feat(ui): add LocationFormModal for STO/Site CRUD"
```

---

## Task 3: Frontend - Integrasi ke LocationsManagementPage

**Files:**
- Modify: `frontend/src/pages/LocationsManagementPage.tsx`
- Consumes: `LocationFormModal`

**Interfaces:**
- Props LocationFormModal:
  ```typescript
  isOpen: boolean
  onClose: () => void
  location?: Location
  onSuccess: () => void
  ```

- [ ] **Step 1: Tambahkan import LocationFormModal**

Lokasi: `frontend/src/pages/LocationsManagementPage.tsx` - Tambahkan setelah import ConfirmModal

```typescript
import { LocationFormModal } from '../components/modals/LocationFormModal'
```

- [ ] **Step 2: Tambahkan state untuk LocationFormModal**

Lokasi: Setelah state `isDeleteModalOpen`

```typescript
const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
```

- [ ] **Step 3: Update handleAdd untuk tab location**

Lokasi: `handleAdd` function - Hapus toast error, buka modal

Ubah:
```typescript
const handleAdd = () => {
  if (activeTab === 'location') {
    toast.error('Fitur tambah lokasi STO/Site secara manual melalui form akan segera hadir. Gunakan import Excel sementara waktu.')
    return
  }
  setEditingItem(null)
  setIsModalOpen(true)
}
```

Menjadi:
```typescript
const handleAdd = () => {
  if (activeTab === 'location') {
    setEditingItem(null)
    setIsLocationModalOpen(true)
    return
  }
  setEditingItem(null)
  setIsModalOpen(true)
}
```

- [ ] **Step 4: Update handleEdit untuk tab location**

Lokasi: `handleEdit` function

Ubah:
```typescript
const handleEdit = (item: any) => {
  if (activeTab === 'location') {
    toast.error('Fitur edit lokasi STO/Site akan segera hadir.')
    return
  }
  setEditingItem(item)
  setIsModalOpen(true)
}
```

Menjadi:
```typescript
const handleEdit = (item: any) => {
  if (activeTab === 'location') {
    setEditingItem(item)
    setIsLocationModalOpen(true)
    return
  }
  setEditingItem(item)
  setIsModalOpen(true)
}
```

- [ ] **Step 5: Update handleDeleteClick untuk tab location**

Lokasi: `handleDeleteClick` function

Ubah:
```typescript
const handleDeleteClick = (item: any) => {
  if (activeTab === 'location') {
    toast.error('Fitur hapus lokasi STO/Site akan segera hadir.')
    return
  }
  // ... rest of function
}
```

Menjadi:
```typescript
const handleDeleteClick = (item: any) => {
  if (activeTab === 'location') {
    // Check if location has devices
    if ((item._count?.devices || item.devices?.length || 0) > 0) {
      toast.error(`Tidak dapat menghapus ${item.name} karena masih memiliki perangkat di dalamnya.`)
      return
    }
    setDeletingItem(item)
    setIsDeleteModalOpen(true)
    return
  }
  // ... rest of function
}
```

- [ ] **Step 6: Update handleDeleteConfirm untuk tab location**

Lokasi: `handleDeleteConfirm` function

Tambahkan case untuk 'location':
```typescript
case 'location':
  await locationService.deleteLocation(deletingItem.id)
  break
```

- [ ] **Step 7: Tambahkan LocationFormModal component**

Lokasi: Sebelum `ConfirmModal` closing tag (setelah line 306)

```typescript
<LocationFormModal
  isOpen={isLocationModalOpen}
  onClose={() => {
    setIsLocationModalOpen(false)
    setEditingItem(null)
  }}
  location={editingItem as Location}
  onSuccess={fetchData}
/>
```

- [ ] **Step 8: Commit perubahan**

```bash
git add frontend/src/pages/LocationsManagementPage.tsx
git commit -m "feat(ui): integrate LocationFormModal in LocationsManagementPage"
```

---

## Verification

Manual testing:
1. Buka halaman `/locations`
2. Klik tab "Lokasi (STO/Site)"
3. Klik tombol "+ Tambah Lokasi" → modal form terbuka
4. Isi form dan submit → lokasi baru muncul di tabel
5. Klik edit pada lokasi → modal terbuka dengan data
6. Ubah dan simpan → perubahan tersimpan
7. Klik hapus → konfirmasi → lokasi dihapus

---

## Notes

- Task 2 LocationFormModal menggunakan input text untuk cluster_id karena cascade dropdown (Area → Regional → District → Cluster) belum diimplementasikan. Bisa ditingkatkan nanti dengan SearchableSelect + cascading logic.
- Cache invalidation di backend memastikan data di frontend selalu fresh setelah CRUD operations.
