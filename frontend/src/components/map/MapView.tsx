import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../../contexts/ThemeContext'
import { useMapContext } from '../../contexts/MapContext'
import { LocationMarker } from './LocationMarker'
import { MapControls } from './MapControls'
import type { MapMarker } from '../../types'

function MapViewSync() {
  const map = useMap()
  const { mapCenter, mapZoom } = useMapContext()
  useEffect(() => {
    map.setView(mapCenter, mapZoom)
  }, [mapCenter, mapZoom, map])
  return null
}

export function MapView() {
  const { resolvedTheme } = useTheme()
  const { markers, isLoading } = useMapContext()

  const tileUrl = resolvedTheme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)]">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer center={[-3.5, 103.5]} zoom={7} className="w-full h-full" zoomControl={false}>
        <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        <MapViewSync />
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon}>
          {markers.map((marker: MapMarker) => <LocationMarker key={marker.id} marker={marker} />)}
        </MarkerClusterGroup>
      </MapContainer>
      <MapControls />
    </div>
  )
}

function createClusterIcon(cluster: any) {
  const L = (window as any).L
  const count = cluster.getChildCount()
  let worstStatus = 'active'
  cluster.getAllChildMarkers().forEach((m: any) => {
    if (m.options.status === 'critical') worstStatus = 'critical'
    else if (m.options.status === 'warning' && worstStatus !== 'critical') worstStatus = 'warning'
  })
  const colors: Record<string, string> = { active: '#22D3EE', warning: '#FBBF24', critical: '#F87171', inactive: '#6B7A8A' }
  const color = colors[worstStatus]
  const size = Math.min(40 + count * 2, 60)
  return L.divIcon({
    html: `<div style="background:${color};color:white;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,0.3);border:3px solid white;">${count}</div>`,
    className: 'custom-cluster',
    iconSize: [size, size],
  })
}
