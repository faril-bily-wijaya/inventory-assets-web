import { useMemo, useState } from 'react'
import { Zap, Server, Search } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import type { DeviceWithModernization } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  locationName: string
  catuDaya: DeviceWithModernization[]
  nonCatuDaya: DeviceWithModernization[]
}

const TYPE_OPTIONS = [
  'Semua Jenis',
  'GENSET', 'BATTERY', 'RECTIFIER', 'INVERTER', 'UPS',
  'AC', 'OLT', 'SWITCH', 'ROUTER', 'DWDM', 'SERVER'
]

const STATUS_OPTIONS = ['Semua Status', 'AKTIF', 'IDLE', 'RUSAK']

export function DeviceListModal({ isOpen, onClose, locationName, catuDaya, nonCatuDaya }: Props) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(TYPE_OPTIONS[0])
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0])
  const [activeSection, setActiveSection] = useState<'catu-daya' | 'non-catu-daya'>('catu-daya')

  const filteredDevices = useMemo(() => {
    const devices = activeSection === 'catu-daya' ? catuDaya : nonCatuDaya
    return devices.filter(device => {
      const matchesSearch = search === '' ||
        device.deviceName.toLowerCase().includes(search.toLowerCase()) ||
        device.deviceCode.toLowerCase().includes(search.toLowerCase()) ||
        (device.serialNumber && device.serialNumber.toLowerCase().includes(search.toLowerCase()))

      const matchesType = typeFilter === 'Semua Jenis' ||
        device.deviceType.toUpperCase().includes(typeFilter)

      const matchesStatus = statusFilter === 'Semua Status' ||
        device.status.toUpperCase() === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [catuDaya, nonCatuDaya, search, typeFilter, statusFilter, activeSection])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locationName} size="xl">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          <button
            onClick={() => setActiveSection('catu-daya')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-t text-sm font-medium transition-colors',
              activeSection === 'catu-daya'
                ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Zap className="w-4 h-4" />
            Catu Daya
            <span className="px-1.5 py-0.5 bg-cyan-500/20 rounded text-xs">
              {catuDaya.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection('non-catu-daya')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-t text-sm font-medium transition-colors',
              activeSection === 'non-catu-daya'
                ? 'bg-teal-500/20 text-teal-400 border-b-2 border-teal-400'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Server className="w-4 h-4" />
            Non-Catu Daya
            <span className="px-1.5 py-0.5 bg-teal-500/20 rounded text-xs">
              {nonCatuDaya.length}
            </span>
          </button>
        </div>

        {/* Device List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {filteredDevices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Tidak ada device yang sesuai filter</p>
            </div>
          ) : (
            filteredDevices.map(device => (
              <div
                key={device.id}
                className={cn(
                  'p-4 rounded-lg border bg-slate-800/30 transition-colors',
                  activeSection === 'catu-daya' ? 'border-cyan-500/30' : 'border-teal-500/30',
                  device.butuhModernisasi && 'border-amber-500/50 bg-amber-500/10'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-200 truncate">
                        {device.deviceName}
                      </h4>
                      {device.butuhModernisasi && (
                        <Badge variant="warning" className="shrink-0">Modernisasi</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-2">
                      {device.deviceCode}
                      {device.serialNumber && ` | ${device.serialNumber}`}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded',
                        activeSection === 'catu-daya' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-teal-500/20 text-teal-400'
                      )}>
                        {device.deviceType}
                      </span>
                      {device.brand && <span>{device.brand}</span>}
                      {device.year && <span>{device.year}</span>}
                      {device.room && <span>{device.room}</span>}
                    </div>
                    {device.butuhModernisasi && device.alasan && (
                      <p className="mt-2 text-xs text-amber-400">
                        ⚠️ {device.alasan}
                      </p>
                    )}
                  </div>
                  <Badge variant={
                    device.status === 'active' ? 'success' :
                    device.status === 'warning' ? 'warning' :
                    device.status === 'critical' ? 'danger' : 'muted'
                  }>
                    {device.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
