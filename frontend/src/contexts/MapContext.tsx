import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
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
    <MapContext.Provider value={{
      markers,
      locations,
      selectedMarker,
      isLoading,
      error,
      setSelectedMarker,
      refreshMapData,
      mapCenter,
      mapZoom,
      setMapView
    }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const context = useContext(MapContext)
  if (!context) throw new Error('useMapContext must be used within MapProvider')
  return context
}
