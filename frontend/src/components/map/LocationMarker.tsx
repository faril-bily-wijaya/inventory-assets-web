import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, HardDrive, Layers } from 'lucide-react'
import { useMapContext } from '../../contexts/MapContext'
import type { MapMarker } from '../../types'
import { isCatuDaya } from '../../utils/deviceType'

interface Props {
  marker: MapMarker
}

// Custom icons using Leaflet DivIcon
const getCatuDayaIcon = (isCritical: boolean) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-lg text-white ${isCritical ? 'animate-pulse ring-4 ring-red-500 ring-opacity-50' : ''}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const getNonCatuDayaIcon = (isCritical: boolean) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg text-white ${isCritical ? 'animate-pulse ring-4 ring-red-500 ring-opacity-50' : ''}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const getMixedIcon = (isCritical: boolean) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 border-2 border-white shadow-lg text-white ${isCritical ? 'animate-pulse ring-4 ring-red-500 ring-opacity-50' : ''}"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

export function LocationMarker({ marker }: Props) {
  const { setSelectedMarker } = useMapContext()
  
  let catuDayaCount = 0;
  let nonCatuDayaCount = 0;
  marker.devices.forEach(d => {
    if (isCatuDaya(d.deviceType)) catuDayaCount++;
    else nonCatuDayaCount++;
  });

  const isCritical = marker.worstStatus === 'critical';
  
  let icon = getMixedIcon(isCritical);
  if (catuDayaCount > 0 && nonCatuDayaCount === 0) icon = getCatuDayaIcon(isCritical);
  else if (nonCatuDayaCount > 0 && catuDayaCount === 0) icon = getNonCatuDayaIcon(isCritical);

  return (
    <Marker
      position={[marker.latitude, marker.longitude]}
      icon={icon}
      eventHandlers={{ click: () => setSelectedMarker(marker) }}
    >
      <Tooltip className="premium-tooltip" direction="top" offset={[0, -35]} opacity={1}>
        <div className="p-1 min-w-[260px] max-w-[320px]">
          <h3 className="font-bold text-lg text-slate-800">{marker.name}</h3>
          <div className="flex items-start gap-1.5 mt-1 mb-3 pb-2 border-b">
            <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 leading-tight">
              {marker.address || `${marker.latitude.toFixed(6)}, ${marker.longitude.toFixed(6)}`}
            </p>
          </div>
          
          <div className="flex gap-2 mb-4">
            {catuDayaCount > 0 && (
              <div className="flex-1 bg-orange-50 p-2 rounded-lg border border-orange-100 text-center">
                <p className="text-xs text-orange-600 font-medium">Catu Daya</p>
                <p className="font-bold text-orange-700 text-lg">{catuDayaCount}</p>
              </div>
            )}
            {nonCatuDayaCount > 0 && (
              <div className="flex-1 bg-blue-50 p-2 rounded-lg border border-blue-100 text-center">
                <p className="text-xs text-blue-600 font-medium">Non-Catu</p>
                <p className="font-bold text-blue-700 text-lg">{nonCatuDayaCount}</p>
              </div>
            )}
          </div>
          
          <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar pointer-events-auto">
            {marker.devices.slice(0, 10).map((dev, i) => (
              <div key={i} className="mb-2 p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-700">{dev.deviceType}</p>
                  <div className="flex items-center gap-1.5">
                    {dev.butuhModernisasi && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-700 border border-amber-200" title={dev.alasan}>
                        Modernisasi
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${['aktif', 'active', 'operational'].includes(dev.status?.toLowerCase()) ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : ['inactive', 'idle'].includes(dev.status?.toLowerCase()) ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                      {dev.status || '-'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> {dev.brand || '-'} • {dev.deviceCode || '-'}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full mt-3 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            Klik Marker Untuk Tabel Lengkap ({marker.devices.length})
          </div>
        </div>
      </Tooltip>
    </Marker>
  )
}
