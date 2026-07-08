import { useState, useEffect } from 'react'
import { MapPin, Server, Zap, ChevronRight, Loader2, AlertTriangle } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { DeviceSection } from './DeviceSection'
import { DeviceListModal } from './DeviceListModal'
import { importService } from '../../services/importService'
import type { MapMarker, LocationDevicesResponse } from '../../types'

interface Props {
  marker: MapMarker
}

export function DevicePopup({ marker }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [locationData, setLocationData] = useState<LocationDevicesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadLocationDevices()
  }, [marker.id])

  const loadLocationDevices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await importService.getLocationDevices(marker.id)
      setLocationData(data)
    } catch (err: any) {
      console.error('Failed to load location devices:', err)
      setError('Gagal memuat data device')
    } finally {
      setIsLoading(false)
    }
  }

  const variantMap = {
    active: 'success',
    warning: 'warning',
    critical: 'danger',
    inactive: 'muted'
  } as const

  const devicesNeedingModernization = marker.devices?.filter((d: any) => d.butuhModernisasi) || []
  const hasModernization = devicesNeedingModernization.length > 0

  return (
    <div className="min-w-[280px] max-w-[320px] p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm text-slate-200">{marker.name}</h3>
          <p className="text-xs text-slate-400">{marker.hierarchy.cluster}</p>
        </div>
        <Badge variant={variantMap[marker.worstStatus]}>{marker.worstStatus}</Badge>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs mb-4">
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{marker.hierarchy.district}, {marker.hierarchy.regional}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Server className="w-3 h-3 shrink-0" />
          <span>{marker.deviceCount} devices</span>
        </div>
        {hasModernization && (
          <div className="flex items-center gap-2 text-amber-400 font-semibold bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>{devicesNeedingModernization.length} perangkat butuh modernisasi</span>
          </div>
        )}
        {marker.classType && (
          <div className="text-slate-500">Class: {marker.classType}</div>
        )}
        {marker.siteCode && (
          <div className="text-slate-500">Site Code: <span className="font-mono text-cyan-400">{marker.siteCode}</span></div>
        )}
        {marker.teknisi && (
          <div className="text-slate-500 mt-2 p-2 bg-slate-800/50 rounded-md border border-slate-700">
            <span className="block text-xs font-semibold text-slate-300 mb-1">Teknisi:</span>
            {marker.teknisi}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-xs text-red-400 mb-2">{error}</p>
          <Button variant="secondary" size="sm" onClick={loadLocationDevices}>
            Coba Lagi
          </Button>
        </div>
      ) : locationData ? (
        <div className="space-y-4">
          {/* Catu Daya Section */}
          <DeviceSection
            title="Catu Daya"
            icon={<Zap className="w-4 h-4" />}
            devices={locationData.devices.catuDaya.items}
            variant="catu-daya"
            onViewMore={() => setIsModalOpen(true)}
          />

          {/* Non-Catu Daya Section */}
          <DeviceSection
            title="Non-Catu Daya"
            icon={<Server className="w-4 h-4" />}
            devices={locationData.devices.nonCatuDaya.items}
            variant="non-catu-daya"
            onViewMore={() => setIsModalOpen(true)}
          />

          {/* View All Button */}
          {(locationData.devices.catuDaya.total > 0 || locationData.devices.nonCatuDaya.total > 0) && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Lihat Semua ({locationData.devices.catuDaya.total + locationData.devices.nonCatuDaya.total})
            </Button>
          )}
        </div>
      ) : null}

      {/* Modal */}
      <DeviceListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locationName={marker.name}
        catuDaya={locationData?.devices.catuDaya.items || []}
        nonCatuDaya={locationData?.devices.nonCatuDaya.items || []}
      />
    </div>
  )
}
