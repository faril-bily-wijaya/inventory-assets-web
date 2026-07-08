import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { locationService, type LocationFilters } from '../services/locationService'
import type { MapMarker, Location } from '../types'

export type FilterCategory = 'ALL' | 'CATU_DAYA' | 'NON_CATU_DAYA' | 'GENSET_MOBILE'
export type MapStyle = 'street' | 'satellite'

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
  filters: LocationFilters
  setFilters: (filters: LocationFilters) => void
  
  // Dashboard UI States
  mapStyle: MapStyle
  setMapStyle: (style: MapStyle) => void
  filter: FilterCategory
  setFilter: (filter: FilterCategory) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  conditionFilter: string
  setConditionFilter: (condition: string) => void
  brandFilter: string
  setBrandFilter: (brand: string) => void
  search: string
  setSearch: (search: string) => void
  showAnalytics: boolean
  setShowAnalytics: (show: boolean) => void
  showCoverArea: boolean
  setShowCoverArea: (show: boolean) => void
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
  const [filters, setFilters] = useState<LocationFilters>({})

  // Dashboard UI States
  const [mapStyle, setMapStyle] = useState<MapStyle>('street')
  const [filter, setFilter] = useState<FilterCategory>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [conditionFilter, setConditionFilter] = useState<string>('ALL')
  const [brandFilter, setBrandFilter] = useState<string>('ALL')
  const [search, setSearch] = useState<string>('')
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false)
  const [showCoverArea, setShowCoverArea] = useState<boolean>(false)

  const refreshMapData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load map data first to render the map immediately
      locationService.getMapData(filters)
        .then(mapMarkers => {
          setMarkers(mapMarkers)
          setIsLoading(false)
          
          // Auto update selected marker to reflect changes immediately
          setSelectedMarker(prev => {
            if (!prev) return null;
            return mapMarkers.find(m => m.id === prev.id) || prev;
          })
        })
        .catch(err => {
          setError('Failed to load map data')
          console.error(err)
          setIsLoading(false)
        })

      // Load locations list in the background for dropdowns
      locationService.getLocations(filters)
        .then(locs => {
          setLocations(locs)
        })
        .catch(err => {
          console.error('Failed to load locations list', err)
        })
    } catch (err) {
      setError('Failed to initialize map data request')
      console.error(err)
      setIsLoading(false)
    }
  }

  useEffect(() => { refreshMapData() }, [filters])

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
      setMapView,
      filters,
      setFilters,
      mapStyle,
      setMapStyle,
      filter,
      setFilter,
      statusFilter,
      setStatusFilter,
      conditionFilter,
      setConditionFilter,
      brandFilter,
      setBrandFilter,
      search,
      setSearch,
      showAnalytics,
      setShowAnalytics,
      showCoverArea,
      setShowCoverArea
    }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
}
