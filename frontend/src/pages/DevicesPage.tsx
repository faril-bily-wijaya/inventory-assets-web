import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, List, Upload } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { deviceService, type DeviceFilters } from '../services/deviceService'
import type { Device } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { DeviceModal } from '../components/modals/DeviceModal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { ImportTab } from '../components/import/ImportTab'
import toast from 'react-hot-toast'

type TabType = 'list' | 'import'

export default function DevicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list')
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
    } catch (error) {
      toast.error('Failed to load devices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadDevices()
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedDevices(checked ? devices.map(d => d.id) : [])
  }

  const handleSelect = (id: string) => {
    setSelectedDevices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleEdit = (device: Device) => {
    setEditingDevice(device)
    setIsDeviceModalOpen(true)
  }

  const handleDelete = (device: Device) => {
    setDeletingDevice(device)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingDevice) return
    try {
      setIsDeleting(true)
      await deviceService.deleteDevice(deletingDevice.id)
      toast.success('Device deleted')
      loadDevices()
    } catch {
      toast.error('Failed to delete device')
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
      setDeletingDevice(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDevices.length === 0) return
    try {
      await deviceService.bulkDelete(selectedDevices)
      toast.success(`${selectedDevices.length} devices deleted`)
      setSelectedDevices([])
      loadDevices()
    } catch {
      toast.error('Failed to delete devices')
    }
  }

  const statusVariant = { active: 'success', warning: 'warning', critical: 'danger', inactive: 'muted' } as const

  return (
    <PageContainer>
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Devices</h1>
            <p className="text-[var(--text-muted)]">Manage inventory devices</p>
          </div>
          {activeTab === 'list' && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => { setEditingDevice(null); setIsDeviceModalOpen(true) }}
            >
              Add Device
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            Daftar
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' ? (
          <>
        <Card className="mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {selectedDevices.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-cyan-500/15 rounded-md">
            <span className="text-sm text-[var(--text-primary)]">{selectedDevices.length} selected</span>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>Delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDevices([])}>Clear</Button>
          </div>
        )}

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedDevices.length === devices.length && devices.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="accent-cyan-500"
                    />
                  </th>
                  <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Code</th>
                  <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Name</th>
                  <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Type</th>
                  <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Status</th>
                  <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Location</th>
                  <th className="p-4 text-left text-xs uppercase text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">Loading...</td>
                  </tr>
                ) : devices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">No devices found</td>
                  </tr>
                ) : (
                  devices.map(device => (
                    <tr key={device.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)]">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(device.id)}
                          onChange={() => handleSelect(device.id)}
                          className="accent-cyan-500"
                        />
                      </td>
                      <td className="p-4 font-mono text-sm">{device.deviceCode}</td>
                      <td className="p-4 text-sm">{device.deviceName}</td>
                      <td className="p-4 text-sm">{device.deviceType}</td>
                      <td className="p-4">
                        <Badge variant={statusVariant[device.status as keyof typeof statusVariant]}>
                          {device.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-muted)]">{device.location?.name || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(device)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(device)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
          </>
        ) : (
          <ImportTab />
        )}
      </div>

      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => { setIsDeviceModalOpen(false); setEditingDevice(null) }}
        device={editingDevice || undefined}
        onSuccess={loadDevices}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingDevice(null) }}
        onConfirm={confirmDelete}
        title="Delete Device"
        message={`Delete "${deletingDevice?.deviceName}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </PageContainer>
  )
}
