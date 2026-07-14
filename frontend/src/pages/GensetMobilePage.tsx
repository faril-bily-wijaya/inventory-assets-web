import { useState, useEffect } from 'react'
import { Zap, Search, MapPin, Plus, List, Upload, Edit } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { deviceService, type DeviceFilters } from '../services/deviceService'
import type { Device } from '../types'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Select'
import { ImportTab } from '../components/import/ImportTab'
import { useMapContext } from '../contexts/MapContext'
import toast from 'react-hot-toast'
import { QuickEditGensetModal } from '../components/modals/QuickEditGensetModal'
import { DeviceModal } from '../components/modals/DeviceModal'
import { SidebarNav } from '../components/layout/SidebarNav'
import { Button } from '../components/ui/Button'

export default function GensetMobilePage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'list' | 'import'>('list')
  
  // Quick Edit State
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  
  // Full Edit State
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)
  const [fullEditingDevice, setFullEditingDevice] = useState<Device | null>(null)
  
  const { locations } = useMapContext()

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [statusFilter, locationFilter])

  useEffect(() => { loadDevices() }, [pagination.page, statusFilter, locationFilter])

  const loadDevices = async () => {
    try {
      setIsLoading(true)
      const filters: DeviceFilters = { 
        page: pagination.page, 
        limit: pagination.limit, 
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        locationId: locationFilter || undefined,
        deviceType: 'Genset Mobile,Genset Mobil,Dummy Load'
      }
      const response = await deviceService.getDevices(filters)
      setDevices(response.devices)
      setPagination(response.pagination)
    } catch (error) {
      toast.error('Failed to load Genset Mobile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadDevices()
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPERATIONAL': return 'success'
      case 'IDLE': return 'warning'
      case 'INTEGRASI': return 'info'
      case 'RUSAK': return 'danger'
      case 'MAINTENANCE': return 'warning'
      default: return 'muted'
    }
  }

  return (
    <PageContainer sidebar={<SidebarNav />}>
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Genset Mobile</h1>
            <p className="text-[var(--text-muted)]">Manajemen pergerakan dan status operasional Genset Mobile</p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => { setFullEditingDevice(null); setIsDeviceModalOpen(true) }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Tambah Genset
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl w-fit mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'list'
                ? 'bg-[var(--bg-card)] text-cyan-500 shadow-sm border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
            }`}
          >
            <List className="w-4 h-4" />
            Daftar Genset
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'import'
                ? 'bg-[var(--bg-card)] text-cyan-500 shadow-sm border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' ? (
          <>
            {/* Filters */}
            <Card className="p-4 mb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <Input 
                      placeholder="Cari berdasarkan merk, SN, STO..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-9 w-full bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>
                </div>
                <div className="flex gap-4 lg:w-1/3">
                  <Select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 bg-white/50 dark:bg-slate-900/50"
                  >
                    <option value="">Semua Status</option>
                    <option value="IDLE">Idle</option>
                    <option value="INTEGRASI">Integrasi</option>
                    <option value="OPERATIONAL">Operational</option>
                    <option value="RUSAK">Rusak</option>
                  </Select>
                  <Select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="flex-1 bg-white/50 dark:bg-slate-900/50"
                  >
                    <option value="">Semua Lokasi (STO)</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                      <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Perangkat & ID</th>
                      <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Merk & Kapasitas</th>
                      <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Posisi STO</th>
                      <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Kondisi & Status</th>
                      <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Keterangan</th>
                      <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            <p>Memuat data genset mobile...</p>
                          </div>
                        </td>
                      </tr>
                    ) : devices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                          Tidak ada Genset Mobile yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      devices.map((device) => {
                        const loc = locations.find(l => l.id === device.locationId) || device.location
                        const distName = (loc as any)?.clusters?.districts?.name || 'Unknown District'
                        const regName = (loc as any)?.clusters?.districts?.regionals?.name || 'Unknown Regional'
                        return (
                          <tr key={device.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors group cursor-pointer" onClick={() => setEditingDevice(device)}>
                            <td className="p-4">
                              <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                                  <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                  <div>{device.deviceName}</div>
                                  {device.deviceCode && <div className="text-xs text-blue-500 font-mono mt-0.5">{device.deviceCode}</div>}
                                </div>
                              </div>
                              <div className="text-xs text-[var(--text-muted)] ml-10 mt-1">{device.deviceType}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-[var(--text-primary)]">{device.brand || '-'}</div>
                              <div className="text-xs text-[var(--text-muted)] mt-0.5">{device.kapasitas} {device.satuanKapasitas}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center text-[var(--text-primary)] gap-2">
                                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                                <span>{loc?.name || 'Unknown Location'}</span>
                              </div>
                              <div className="text-xs text-[var(--text-muted)] ml-6 mt-0.5">
                                {regName} &gt; {distName}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col items-start gap-1.5">
                                <Badge variant={device.condition?.toLowerCase() === 'bagus' ? 'success' : device.condition?.toLowerCase() === 'rusak' ? 'danger' : 'muted'}>
                                  {device.condition?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                                <Badge variant={getStatusColor(device.status)}>
                                  {device.status.toUpperCase()}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-4 max-w-[200px]">
                              <div className="text-xs text-[var(--text-muted)] truncate" title={device.keterangan || '-'}>
                                {device.keterangan || '-'}
                              </div>
                            </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                className="px-3 py-1.5 text-xs font-semibold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30 dark:hover:bg-cyan-900/50 rounded-lg transition-colors border border-cyan-200 dark:border-cyan-800"
                                onClick={(e) => { e.stopPropagation(); setEditingDevice(device); }}
                              >
                                Quick Edit
                              </button>
                              <button 
                                className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={(e) => { e.stopPropagation(); setFullEditingDevice(device); setIsDeviceModalOpen(true); }}
                                title="Edit Semua Data"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!isLoading && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
                  <div className="text-sm text-[var(--text-muted)]">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                  </div>
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
              )}
            </Card>
          </>
        ) : (
          <ImportTab importType="genset" />
        )}
      </div>

      {editingDevice && (
        <QuickEditGensetModal
          device={editingDevice}
          onClose={() => setEditingDevice(null)}
          onSuccess={() => {
            setEditingDevice(null)
            loadDevices()
          }}
        />
      )}

      {/* Full Device Modal for Create/Edit */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => { setIsDeviceModalOpen(false); setFullEditingDevice(null) }}
        device={fullEditingDevice || undefined}
        onSuccess={() => {
          setIsDeviceModalOpen(false)
          setFullEditingDevice(null)
          loadDevices()
        }}
      />
    </PageContainer>
  )
}
