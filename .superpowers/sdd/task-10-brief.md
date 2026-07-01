# Task 10: Create Device CRUD Components

**Location in Plan:** Phase 7, Task 10

## Context
Tasks 7-9 created services and pages. Task 10 creates device management modal and page.

## Files to Create
1. `frontend/src/components/modals/DeviceModal.tsx`
2. `frontend/src/components/modals/ConfirmModal.tsx`
3. `frontend/src/pages/DevicesPage.tsx`

## DeviceModal Component
```typescript
// src/components/modals/DeviceModal.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { deviceService } from '../../services/deviceService'
import { useMap } from '../../contexts/MapContext'
import type { Device, DeviceFormData } from '../../types'
import toast from 'react-hot-toast'

const deviceSchema = z.object({
  deviceCode: z.string().min(1, 'Device code is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  deviceType: z.string().min(1, 'Device type is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  kapasitas: z.string().optional(),
  year: z.number().optional(),
  room: z.string().optional(),
  status: z.enum(['active', 'warning', 'critical', 'inactive']),
  condition: z.string().optional(),
  capReal: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
})

type DeviceFormValues = z.infer<typeof deviceSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  device?: Device
  onSuccess?: () => void
}

export function DeviceModal({ isOpen, onClose, device, onSuccess }: Props) {
  const { locations } = useMap()
  const isEditing = !!device

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: device ? {
      deviceCode: device.deviceCode, deviceName: device.deviceName, deviceType: device.deviceType,
      brand: device.brand, model: device.model, serialNumber: device.serialNumber,
      kapasitas: device.kapasitas, year: device.year, room: device.room,
      status: device.status, condition: device.condition, capReal: device.capReal, locationId: device.locationId,
    } : { status: 'active' },
  })

  const onSubmit = async (data: DeviceFormValues) => {
    try {
      if (isEditing && device) {
        await deviceService.updateDevice(device.id, data)
        toast.success('Device updated successfully')
      } else {
        await deviceService.createDevice(data as any)
        toast.success('Device created successfully')
      }
      onSuccess?.()
      onClose()
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save device')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Device' : 'Add New Device'}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>{isEditing ? 'Save Changes' : 'Create Device'}</Button></>}
    >
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Device Code *" placeholder="DEV-001" error={errors.deviceCode?.message} {...register('deviceCode')} />
          <Input label="Device Name *" placeholder="Server Rack A1" error={errors.deviceName?.message} {...register('deviceName')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Device Type *" placeholder="Server, Router, Switch" error={errors.deviceType?.message} {...register('deviceType')} />
          <Select label="Status *" options={[{ value: 'active', label: 'Active' }, { value: 'warning', label: 'Warning' }, { value: 'critical', label: 'Critical' }, { value: 'inactive', label: 'Inactive' }]} {...register('status')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Brand" placeholder="Cisco, Dell, HP" {...register('brand')} />
          <Input label="Model" placeholder="PowerEdge R740" {...register('model')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Serial Number" placeholder="SN12345678" {...register('serialNumber')} />
          <Input label="Year" type="number" placeholder="2023" {...register('year', { valueAsNumber: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Kapasitas" placeholder="16GB RAM" {...register('kapasitas')} />
          <Input label="Room" placeholder="Server Room 1" {...register('room')} />
        </div>
        <Select label="Location *" options={[{ value: '', label: 'Select location...' }, ...locations.map(l => ({ value: l.id, label: `${l.name} (${l.cluster?.name})` }))]} error={errors.locationId?.message} {...register('locationId')} />
      </form>
    </Modal>
  )
}
```

## ConfirmModal Component
```typescript
// src/components/modals/ConfirmModal.tsx
import { AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', isLoading = false }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={<><Button variant="secondary" onClick={onClose} disabled={isLoading}>{cancelText}</Button><Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>{confirmText}</Button></>}>
      <div className="flex gap-4">
        <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-danger-muted' : 'bg-warning-muted'}`}>
          <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-danger' : 'text-warning'}`} />
        </div>
        <p className="text-[var(--text-secondary)]">{message}</p>
      </div>
    </Modal>
  )
}
```

## DevicesPage Component
```typescript
// src/pages/DevicesPage.tsx
import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { deviceService, DeviceFilters } from '../services/deviceService'
import type { Device } from '../../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { DeviceModal } from '../components/modals/DeviceModal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import toast from 'react-hot-toast'

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { loadDevices() }, [pagination.page])

  const loadDevices = async () => {
    try {
      setIsLoading(true)
      const filters: DeviceFilters = { page: pagination.page, limit: pagination.limit, search: searchTerm || undefined }
      const response = await deviceService.getDevices(filters)
      setDevices(response.devices)
      setPagination(response.pagination)
    } catch (error) { toast.error('Failed to load devices') }
    finally { setIsLoading(false) }
  }

  const handleSearch = () => { setPagination(prev => ({ ...prev, page: 1 })); loadDevices() }
  const handleSelectAll = (checked: boolean) => { setSelectedDevices(checked ? devices.map(d => d.id) : []) }
  const handleSelect = (id: string) => { setSelectedDevices(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]) }
  const handleEdit = (device: Device) => { setEditingDevice(device); setIsDeviceModalOpen(true) }
  const handleDelete = (device: Device) => { setDeletingDevice(device); setIsDeleteModalOpen(true) }
  const confirmDelete = async () => {
    if (!deletingDevice) return
    try { setIsDeleting(true); await deviceService.deleteDevice(deletingDevice.id); toast.success('Device deleted'); loadDevices() }
    catch { toast.error('Failed to delete device') }
    finally { setIsDeleting(false); setIsDeleteModalOpen(false); setDeletingDevice(null) }
  }

  const statusVariant = { active: 'success', warning: 'warning', critical: 'danger', inactive: 'muted' } as const

  return (
    <PageContainer>
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold">Devices</h1><p className="text-[var(--text-muted)]">Manage inventory devices</p></div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingDevice(null); setIsDeviceModalOpen(true) }}>Add Device</Button>
        </div>

        <Card className="mb-6"><div className="flex gap-4"><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="flex-1" /><Button variant="secondary" onClick={handleSearch}><Search className="w-4 h-4" /></Button></div></Card>

        {selectedDevices.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-accent-muted rounded-md">
            <span className="text-sm">{selectedDevices.length} selected</span>
            <Button variant="danger" size="sm" onClick={() => { deviceService.bulkDelete(selectedDevices); setSelectedDevices([]); loadDevices() }}>Delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDevices([])}>Clear</Button>
          </div>
        )}

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[var(--border)]">
                <th className="p-4"><input type="checkbox" checked={selectedDevices.length === devices.length && devices.length > 0} onChange={e => handleSelectAll(e.target.checked)} className="accent-accent" /></th>
                <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Code</th>
                <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Name</th>
                <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Type</th>
                <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Status</th>
                <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Location</th>
                <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Actions</th>
              </tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr> :
                 devices.length === 0 ? <tr><td colSpan={7} className="p-8 text-center">No devices found</td></tr> :
                 devices.map(device => (
                  <tr key={device.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)]">
                    <td className="p-4"><input type="checkbox" checked={selectedDevices.includes(device.id)} onChange={() => handleSelect(device.id)} className="accent-accent" /></td>
                    <td className="p-4 font-mono text-sm">{device.deviceCode}</td>
                    <td className="p-4">{device.deviceName}</td>
                    <td className="p-4">{device.deviceType}</td>
                    <td className="p-4"><Badge variant={statusVariant[device.status as keyof typeof statusVariant]}>{device.status}</Badge></td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">{device.location?.name}</td>
                    <td className="p-4"><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => handleEdit(device)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(device)}><Trash2 className="w-4 h-4 text-danger" /></Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>Next</Button>
            </div>
          </div>
        </Card>
      </div>

      <DeviceModal isOpen={isDeviceModalOpen} onClose={() => { setIsDeviceModalOpen(false); setEditingDevice(null) }} device={editingDevice || undefined} onSuccess={loadDevices} />
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeletingDevice(null) }} onConfirm={confirmDelete} title="Delete Device" message={`Delete "${deletingDevice?.deviceName}"?`} isLoading={isDeleting} />
    </PageContainer>
  )
}
```

## Commit
```bash
git add src/components/modals/ src/pages/DevicesPage.tsx
git commit -m "feat: add device management with CRUD operations"
```
