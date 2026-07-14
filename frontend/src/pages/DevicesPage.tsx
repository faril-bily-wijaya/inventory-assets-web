import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, List, Upload, Download } from 'lucide-react'
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
import { SidebarNav } from '../components/layout/SidebarNav'
import { Select } from '../components/ui/Select'
import { useMapContext } from '../contexts/MapContext'

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
  const [isExporting, setIsExporting] = useState(false)

  // Filters
  const { locations } = useMapContext()
  const [statusFilter, setStatusFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [statusFilter, conditionFilter, locationFilter])

  useEffect(() => { loadDevices() }, [pagination.page, statusFilter, conditionFilter, locationFilter])

  const loadDevices = async () => {
    try {
      setIsLoading(true)
      const filters: DeviceFilters = { 
        page: pagination.page, 
        limit: pagination.limit, 
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        condition: conditionFilter || undefined,
        locationId: locationFilter || undefined,
      }
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

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const filters: DeviceFilters = {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        condition: conditionFilter || undefined,
        locationId: locationFilter || undefined,
      }
      
      const blob = await deviceService.exportDevices(filters)
      
      // Create object url and trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Data_Perangkat_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Data berhasil diexport')
    } catch (error) {
      toast.error('Gagal mengexport data')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusVariant = (status: string) => {
    const s = status?.toUpperCase() || ''
    if (['AKTIF', 'OPERATIONAL', 'ACTIVE'].includes(s)) return 'success'
    if (['WARNING'].includes(s)) return 'warning'
    if (['CRITICAL', 'RUSAK'].includes(s)) return 'danger'
    return 'muted'
  }

  return (
    <PageContainer sidebar={<SidebarNav />}>
      <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24 sm:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard Perangkat</h1>
            <p className="text-[var(--text-muted)]">Manajemen perangkat inventaris</p>
          </div>
          {activeTab === 'list' && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => { setEditingDevice(null); setIsDeviceModalOpen(true) }}
              >
                Add Device
              </Button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl w-fit mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'list'
                ? 'bg-[var(--bg-card)] text-blue-500 shadow-sm border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
            }`}
          >
            <List className="w-4 h-4" />
            Daftar
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'import'
                ? 'bg-[var(--bg-card)] text-blue-500 shadow-sm border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Cari nama, tipe, lokasi, merk, rak..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="secondary" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 md:w-1/2">
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'MODERNISASI', label: 'Perlu Modernisasi' },
                  { value: 'AKTIF', label: 'Aktif' },
                  { value: 'IDLE', label: 'Idle' }
                ]}
              />
              <Select
                value={conditionFilter}
                onChange={e => setConditionFilter(e.target.value)}
                options={[
                  { value: '', label: 'Semua Kondisi' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'RUSAK', label: 'Rusak' }
                ]}
              />
              <Select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Locations' },
                  ...locations.map(l => ({ value: l.id, label: l.name }))
                ]}
              />
            </div>
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
          <div className="overflow-auto max-h-[calc(100vh-280px)] custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)] shadow-sm">
                  <th className="p-4 w-12 rounded-tl-lg">
                    <input
                      type="checkbox"
                      checked={selectedDevices.length === devices.length && devices.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border)] text-cyan-500 focus:ring-cyan-500/30 transition-all cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Code</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Name</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Type</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Brand & Model</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">SN & Label</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Year & Age</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Condition</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Ruangan & Rak</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Kelistrikan</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Keterangan</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Location</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Organization</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right rounded-tr-lg whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={15} className="p-12 text-center text-[var(--text-muted)]">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        <p>Memuat data perangkat...</p>
                      </div>
                    </td>
                  </tr>
                ) : devices.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="p-12 text-center text-[var(--text-muted)]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="w-8 h-8 opacity-20 mb-2" />
                        <p>Tidak ada perangkat yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  devices.map(device => (
                    <tr 
                      key={device.id} 
                      className="group hover:bg-cyan-500/5 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(device.id)}
                          onChange={() => handleSelect(device.id)}
                          className="w-4 h-4 rounded border-[var(--border)] text-cyan-500 focus:ring-cyan-500/30 transition-all cursor-pointer opacity-50 group-hover:opacity-100"
                        />
                      </td>
                      <td className="p-4 font-mono text-sm text-[var(--text-secondary)]">{device.deviceCode || '-'}</td>
                      <td className="p-4 text-sm font-medium text-[var(--text-primary)]">{device.deviceName || '-'}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{device.deviceType || '-'}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--text-primary)]">{device.brand || '-'}</span>
                          {device.model && <span className="text-xs opacity-75">{device.model}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        <div className="flex flex-col">
                          <span className="font-mono">{device.serialNumber || '-'}</span>
                          {device.labelCode && <span className="text-xs font-mono opacity-75">{device.labelCode}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        <div className="flex flex-col">
                          <span>{device.year || '-'}</span>
                          {device.usiaPerangkat !== undefined && <span className="text-xs opacity-75">{device.usiaPerangkat} Tahun</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] capitalize">
                        {device.condition?.toLowerCase() || '-'}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {device.ruanganName ? (
                          <div className="flex flex-col gap-1">
                            <div>
                              <span className="font-semibold">{device.ruanganName}</span>
                              {(device.ruanganPanjang || device.ruanganLebar || device.ruanganTinggi || device.ruanganLuas) && (
                                <div className="text-xs opacity-75">
                                  {device.ruanganPanjang || 0}x{device.ruanganLebar || 0}x{device.ruanganTinggi || 0}m, {device.ruanganLuas || 0}m²
                                </div>
                              )}
                            </div>
                            {device.rackName && (
                              <div className="pt-1 border-t border-[var(--border)] border-dashed">
                                <span className="font-semibold">{device.rackName}</span>
                                {(device.rackPanjang || device.rackLebar || device.rackTinggi || device.rackLuas) && (
                                  <div className="text-xs opacity-75">
                                    {device.rackPanjang || 0}x{device.rackLebar || 0}x{device.rackTinggi || 0}m, {device.rackLuas || 0}m²
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {(device.kapasitas || device.capReal || device.jenisTegangan || device.bebanArus) ? (
                          <div className="flex flex-col gap-0.5">
                            {device.kapasitas && <span className="font-semibold text-[var(--text-primary)]">Kapasitas: {device.kapasitas} {device.satuanKapasitas || ''}</span>}
                            {device.capReal && <span className="text-xs text-[var(--text-secondary)]">Real: {device.capReal}</span>}
                            {(device.jenisTegangan || device.bebanArus) && (
                              <span className="text-xs opacity-75 mt-1">
                                {device.jenisTegangan || '-'} | {device.bebanArus ? `${device.bebanArus} ${device.satuanBeban || 'A'}` : '-'}
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] max-w-xs" title={device.keterangan || device.alasan || ''}>
                        <div className="flex flex-col gap-1 items-start">
                          {device.butuhModernisasi && (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              title={device.alasan || 'Butuh Modernisasi'}
                            >
                              ⚠️ PERLU MODERNISASI
                            </span>
                          )}
                          {device.keterangan && <span className="truncate max-w-full">{device.keterangan}</span>}
                          {!device.butuhModernisasi && !device.keterangan && <span>-</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusVariant(device.status)}>
                          {device.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-muted)]">{device.location?.name || '-'}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {device.organizationSname ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-[var(--text-primary)]">{device.organizationSname}</span>
                            {device.organizationName && (
                              <span className="text-xs opacity-75">{device.organizationName}</span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button variant="secondary" size="sm" onClick={() => handleEdit(device)} className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4 text-[var(--text-secondary)]" />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(device)} className="h-8 w-8 p-0 bg-red-500/10 hover:bg-red-500 border-none group/btn">
                            <Trash2 className="w-4 h-4 text-red-500 group-hover/btn:text-white transition-colors" />
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
