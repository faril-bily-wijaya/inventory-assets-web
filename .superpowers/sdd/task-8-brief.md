# Task 8: Create Map Components

**Location in Plan:** Phase 5, Task 8

## Context
Task 7 created API services. Task 8 creates map components using React-Leaflet.

## Dependencies (from Task 1)
- leaflet
- react-leaflet
- react-leaflet-cluster
- @types/leaflet

## Files to Create
1. `frontend/src/contexts/MapContext.tsx`
2. `frontend/src/components/map/MapView.tsx`
3. `frontend/src/components/map/LocationMarker.tsx`
4. `frontend/src/components/map/DevicePopup.tsx`
5. `frontend/src/components/map/MapControls.tsx`

## MapContext
```typescript
// src/contexts/MapContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { locationService } from '../services/locationService'
import type { MapMarker, Location } from '../types'

interface MapContextType {
  markers: MapMarker[]
  locations: Location[]
  selectedMarker: MapMarker | null
  isLoading: boolean
  error: string | null
  setSelectedMarker: (marker: MapMarker | null) => void
  refreshMapData: () => Promise<void>
  mapCenter: [number, number]
  mapZoom: number
  setMapView: (center: [number, number], zoom: number) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

const DEFAULT_CENTER: [number, number] = [-3.5, 103.5]
const DEFAULT_ZOOM = 7

export function MapProvider({ children }: { children: ReactNode }) {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)

  const refreshMapData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [mapMarkers, locs] = await Promise.all([
        locationService.getMapData(),
        locationService.getLocations(),
      ])
      setMarkers(mapMarkers)
      setLocations(locs)
    } catch (err) {
      setError('Failed to load map data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { refreshMapData() }, [])

  const setMapView = (center: [number, number], zoom: number) => {
    setMapCenter(center)
    setMapZoom(zoom)
  }

  return (
    <MapContext.Provider value={{ markers, locations, selectedMarker, isLoading, error, setSelectedMarker, refreshMapData, mapCenter, mapZoom, setMapView }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (!context) throw new Error('useMap must be used within MapProvider')
  return context
}
```

## MapView Component
```typescript
// src/components/map/MapView.tsx
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../../contexts/ThemeContext'
import { useMap } from '../../contexts/MapContext'
import { LocationMarker } from './LocationMarker'
import { MapControls } from './MapControls'

function MapViewSync() {
  const map = useMap()
  const { mapCenter, mapZoom } = useMap()
  useEffect(() => { map.setView(mapCenter, mapZoom) }, [mapCenter, mapZoom, map])
  return null
}

export function MapView() {
  const { resolvedTheme } = useTheme()
  const { markers, isLoading } = useMap()

  const tileUrl = resolvedTheme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)]">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer center={[-3.5, 103.5]} zoom={7} className="w-full h-full" zoomControl={false}>
        <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        <MapViewSync />
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon}>
          {markers.map(marker => <LocationMarker key={marker.id} marker={marker} />)}
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
```

## LocationMarker Component
```typescript
// src/components/map/LocationMarker.tsx
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMap } from '../../contexts/MapContext'
import type { MapMarker } from '../../types'
import { DevicePopup } from './DevicePopup'

interface Props { marker: MapMarker }

export function LocationMarker({ marker }: Props) {
  const { setSelectedMarker } = useMap()
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
    <Marker position={[marker.latitude, marker.longitude]} icon={icon} eventHandlers={{ click: () => setSelectedMarker(marker) }} status={marker.worstStatus}>
      <Popup><DevicePopup marker={marker} /></Popup>
    </Marker>
  )
}
```

## DevicePopup Component
```typescript
// src/components/map/DevicePopup.tsx
import type { MapMarker } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { MapPin, Server } from 'lucide-react'

interface Props { marker: MapMarker }

export function DevicePopup({ marker }: Props) {
  const variantMap = { active: 'success', warning: 'warning', critical: 'danger', inactive: 'muted' } as const
  return (
    <div className="min-w-[240px] p-2" style={{ color: '#1E293B' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-sm">{marker.name}</h3>
          <p className="text-xs text-gray-500">{marker.hierarchy.cluster}</p>
        </div>
        <Badge variant={variantMap[marker.worstStatus]}>{marker.worstStatus}</Badge>
      </div>
      <div className="space-y-1 text-xs mb-3">
        <div className="flex items-center gap-1 text-gray-600"><MapPin className="w-3 h-3" /><span>{marker.hierarchy.district}, {marker.hierarchy.regional}</span></div>
        <div className="flex items-center gap-1 text-gray-600"><Server className="w-3 h-3" /><span>{marker.deviceCount} devices</span></div>
        {marker.classType && <div className="text-gray-500">Class: {marker.classType}</div>}
      </div>
      {marker.devices.length > 0 && (
        <div className="border-t pt-2">
          <p className="text-xs font-medium mb-1">Devices:</p>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {marker.devices.slice(0, 3).map(d => (
              <div key={d.id} className="flex items-center justify-between text-xs">
                <span className="font-mono text-gray-700">{d.deviceCode}</span>
                <Badge variant={variantMap[d.status as keyof typeof variantMap]} className="text-[10px]">{d.status}</Badge>
              </div>
            ))}
            {marker.devices.length > 3 && <p className="text-xs text-gray-400">+{marker.devices.length - 3} more</p>}
          </div>
        </div>
      )}
      <Button variant="primary" size="sm" className="w-full mt-3 text-xs">View Details</Button>
    </div>
  )
}
```

## MapControls Component
```typescript
// src/components/map/MapControls.tsx
import { ZoomIn, ZoomOut, Layers, Maximize2 } from 'lucide-react'
import { useMap } from '../../contexts/MapContext'
import { Button } from '../ui/Button'
import { useState } from 'react'

export function MapControls() {
  const { setMapView, mapZoom } = useMap()
  const [showLayers, setShowLayers] = useState(false)

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden">
        <Button variant="ghost" size="sm" onClick={() => setMapView([-3.5, 103.5], mapZoom + 1)} className="rounded-none border-b border-[var(--border)] px-3 py-2"><ZoomIn className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => setMapView([-3.5, 103.5], mapZoom - 1)} className="rounded-none px-3 py-2"><ZoomOut className="w-4 h-4" /></Button>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden">
        <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)} className="rounded-none px-3 py-2"><Layers className="w-4 h-4" /></Button>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden">
        <Button variant="ghost" size="sm" onClick={() => setMapView([-3.5, 103.5], 7)} className="rounded-none px-3 py-2"><Maximize2 className="w-4 h-4" /></Button>
      </div>
      {showLayers && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg p-3 w-48">
          <p className="text-xs font-medium mb-2 text-[var(--text-secondary)]">Map Layers</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" defaultChecked className="accent-accent" />Markers</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-accent" />Heatmap</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" defaultChecked className="accent-accent" />Clusters</label>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Update App.tsx
Wrap routes with MapProvider:
```tsx
import { MapProvider } from './contexts/MapContext'

// In routes:
<MapProvider>
  <Routes>...</Routes>
</MapProvider>
```

## Commit
```bash
git add src/contexts/MapContext.tsx src/components/map/
git commit -m "feat: add map components with Leaflet integration"
```
