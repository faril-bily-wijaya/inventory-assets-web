import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMapContext } from '../../contexts/MapContext'
import type { MapMarker } from '../../types'
import { DevicePopup } from './DevicePopup'

interface Props {
  marker: MapMarker
}

export function LocationMarker({ marker }: Props) {
  const { setSelectedMarker } = useMapContext()
  const colors = { active: '#22D3EE', warning: '#FBBF24', critical: '#F87171', inactive: '#6B7A8A' }
  const color = colors[marker.worstStatus]

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);${marker.worstStatus === 'critical' ? 'animation:pulse 1.5s infinite;' : ''}"></div><style>@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0.7);}50%{box-shadow:0 0 0 10px rgba(248,113,113,0);}}</style>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })

  return (
    <Marker
      position={[marker.latitude, marker.longitude]}
      icon={icon}
      eventHandlers={{ click: () => setSelectedMarker(marker) }}
    >
      <Popup>
        <DevicePopup marker={marker} />
      </Popup>
    </Marker>
  )
}
