import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import type { DeviceWithModernization } from '../../types'

interface Props {
  title: string
  icon: React.ReactNode
  devices: DeviceWithModernization[]
  variant: 'catu-daya' | 'non-catu-daya'
  onViewMore?: () => void
}

const TYPE_OPTIONS = [
  'Semua Jenis',
  'GENSET', 'BATTERY', 'RECTIFIER', 'INVERTER', 'UPS',
  'AC', 'OLT', 'SWITCH', 'ROUTER', 'DWDM', 'SERVER'
]

const STATUS_OPTIONS = ['Semua Status', 'AKTIF', 'IDLE', 'RUSAK']

export function DeviceSection({ title, icon, devices, variant, onViewMore }: Props) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(TYPE_OPTIONS[0])
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0])

  const variantStyles = {
    'catu-daya': {
      header: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-400',
      card: 'border-cyan-500/30 hover:border-cyan-500/50',
      modernized: 'bg-amber-500/20 border-amber-500/50',
    },
    'non-catu-daya': {
      header: 'text-teal-400',
      badge: 'bg-teal-500/20 text-teal-400',
      card: 'border-teal-500/30 hover:border-teal-500/50',
      modernized: 'bg-amber-500/20 border-amber-500/50',
    },
  }

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = search === '' ||
        device.deviceName.toLowerCase().includes(search.toLowerCase()) ||
        device.deviceCode.toLowerCase().includes(search.toLowerCase())

      const matchesType = typeFilter === 'Semua Jenis' ||
        device.deviceType.toUpperCase().includes(typeFilter)

      const matchesStatus = statusFilter === 'Semua Status' ||
        device.status.toUpperCase() === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [devices, search, typeFilter, statusFilter])

  const displayDevices = filteredDevices.slice(0, 5)
  const hasMore = filteredDevices.length > 5

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className={cn('flex items-center gap-2', variantStyles[variant].header)}>
            {icon}
            <span className="font-medium">{title}</span>
          </span>
          <span className={cn('px-2 py-0.5 rounded text-xs', variantStyles[variant].badge)}>
            {devices.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[120px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Device List */}
          {displayDevices.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Tidak ada device</p>
          ) : (
            <div className="space-y-2">
              {displayDevices.map(device => (
                <div
                  key={device.id}
                  className={cn(
                    'p-3 rounded-lg border bg-slate-800/30 transition-colors',
                    variantStyles[variant].card,
                    device.butuhModernisasi && variantStyles[variant].modernized
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {device.deviceName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {device.deviceCode}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={
                        ['aktif', 'active', 'operational'].includes(device.status?.toLowerCase()) ? 'success' :
                        device.status === 'warning' ? 'warning' :
                        ['critical', 'rusak'].includes(device.status?.toLowerCase()) ? 'danger' : 'muted'
                        }
                      >  {device.status}
                      </Badge>
                      {device.butuhModernisasi && (
                        <Badge variant="warning" className="text-[10px]">Modernisasi</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {device.deviceType && <span>{device.deviceType}</span>}
                    {device.brand && <span>{device.brand}</span>}
                    {device.year && <span>{device.year}</span>}
                    {device.butuhModernisasi && device.alasan && (
                      <span className="text-amber-400">{device.alasan}</span>
                    )}
                  </div>
                </div>
              ))}

              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewMore}
                  className="w-full text-xs text-slate-400"
                >
                  Lihat {filteredDevices.length - 5} lainnya...
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
