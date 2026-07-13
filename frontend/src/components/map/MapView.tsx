import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, CircleMarker, Marker, Tooltip, Popup, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { Flame, LocateFixed, Map as MapIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import { useMapContext } from '../../contexts/MapContext'
import { isCatuDaya } from '../../utils/deviceType'
import { LocationMarker } from './LocationMarker'
import type { MapMarker } from '../../types'

function MapViewSync() {
  const map = useMap()
  const { mapCenter, mapZoom } = useMapContext()
  useEffect(() => {
    map.setView(mapCenter, mapZoom)
  }, [mapCenter, mapZoom, map])
  
  // Fix for map cut-off issue when container resizes
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  
  return null
}

function CoverAreaLayer({ data }: { data: any }) {
  const map = useMap()
  return (
    <GeoJSON 
      data={data}
      style={(feature: any) => {
        const name = feature?.properties?.name || '';
        let color = '#3b82f6'; // default
        let fillColor = '#3b82f6';
        
        if (name === 'JAMBI') {
          color = '#be185d'; fillColor = '#f43f5e'; // Pink/Red
        } else if (name === 'PALEMBANG') {
          color = '#15803d'; fillColor = '#22c55e'; // Green
        } else if (name === 'LAMPUNG') {
          color = '#1e3a8a'; fillColor = '#3b82f6'; // Blue
        } else if (name === 'BENGKULU') {
          color = '#4338ca'; fillColor = '#6366f1'; // Indigo/Purple
        } else if (name === 'PANGKAL PINANG') {
          color = '#a16207'; fillColor = '#eab308'; // Yellow
        }

        return {
          color,
          weight: 2,
          fillColor,
          fillOpacity: 0.35,
          className: 'modern-polygon',
        }
      }}
      ref={(ref) => {
        if (ref) {
          const bounds = ref.getBounds()
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] })
          }
        }
      }}
    />
  )
}

export function MapView() {
  const { markers, isLoading, mapStyle, filter, statusFilter, conditionFilter, brandFilter, search, setMapView, showCoverArea, setShowCoverArea } = useMapContext()
  const [isHeatmapMode, setIsHeatmapMode] = useState(false)
  const [userGPSLocation, setUserGPSLocation] = useState<[number, number] | null>(null)
  const [geoJsonData, setGeoJsonData] = useState<any>(null)

  useEffect(() => {
    fetch('/geojson/districts.json')
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error('Failed to load GeoJSON', err))
  }, [])

  const tileUrl = mapStyle === 'street'
    ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
    : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung Geolocation.")
      return
    }
    toast.loading("Mencari lokasi Anda...", { id: 'gps' })
    navigator.geolocation.getCurrentPosition((position) => {
      toast.success("Lokasi ditemukan!", { id: 'gps' })
      const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
      setUserGPSLocation(coords)
      setMapView(coords, 14)
    }, () => {
      toast.error("Gagal mendapatkan lokasi.", { id: 'gps' })
    })
  }

  const gpsIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 border-[3px] border-white shadow-xl"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)]">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const filteredMarkers = markers.map(loc => {
    const filteredDevices = loc.devices.filter(d => {
      const isCD = isCatuDaya(d.deviceType)
      if (filter === 'CATU_DAYA' && !isCD) return false
      if (filter === 'NON_CATU_DAYA' && isCD) return false
      
      const isGenset = ['genset mobile', 'genset mobil', 'dummy load'].includes(d.deviceType?.toLowerCase() || '')
      if (filter === 'GENSET_MOBILE' && !isGenset) return false
      
      if (statusFilter === 'MODERNISASI' && !d.butuhModernisasi) return false
      if (statusFilter !== 'ALL' && statusFilter !== 'MODERNISASI' && d.status !== statusFilter) return false
      if (conditionFilter !== 'ALL' && d.condition !== conditionFilter) return false
      if (brandFilter !== 'ALL' && d.brand !== brandFilter) return false

      if (search) {
        const q = search.toLowerCase()
        if (!loc.name.toLowerCase().includes(q) && 
            !(d.deviceName?.toLowerCase().includes(q)) &&
            !(d.deviceCode?.toLowerCase().includes(q)) &&
            !(d.deviceType?.toLowerCase().includes(q)) &&
            !(d.brand?.toLowerCase().includes(q)) &&
            !(d.condition?.toLowerCase().includes(q))) {
          return false
        }
      }
      return true
    })
    return { ...loc, devices: filteredDevices }
  }).filter(loc => loc.devices.length > 0)

  return (
    <div className="w-full h-full relative">
      <button 
        onClick={handleGPS}
        className="absolute bottom-6 right-4 sm:right-6 z-[1000] p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl border-[3px] sm:border-4 border-white dark:border-slate-800 transition-transform hover:scale-110 active:scale-95"
        title="Lacak Lokasi Saya"
      >
        <LocateFixed className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button 
        onClick={() => setIsHeatmapMode(!isHeatmapMode)}
        className={`absolute bottom-20 sm:bottom-24 right-4 sm:right-6 z-[1000] p-3 sm:p-4 rounded-full shadow-2xl border-[3px] sm:border-4 border-white dark:border-slate-800 transition-transform hover:scale-110 active:scale-95 ${isHeatmapMode ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 dark:bg-slate-700 text-slate-300'}`}
        title="Mode Heatmap Kerusakan"
      >
        <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button 
        onClick={() => setShowCoverArea(!showCoverArea)}
        className={`absolute bottom-[136px] sm:bottom-44 right-4 sm:right-6 z-[1000] p-3 sm:p-4 rounded-full shadow-2xl border-[3px] sm:border-4 border-white dark:border-slate-800 transition-transform hover:scale-110 active:scale-95 ${showCoverArea ? 'bg-cyan-600 text-white' : 'bg-slate-800 dark:bg-slate-700 text-slate-300'}`}
        title="Tampilkan Cover Area District"
      >
        <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <MapContainer center={[-3.5, 103.5]} zoom={7} className="w-full h-full" maxZoom={22}>
        <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.google.com/intl/id_id/help/terms_maps/">Google Maps</a>' maxZoom={22} maxNativeZoom={19} />
        <MapViewSync />
        
        {userGPSLocation && (
          <Marker position={userGPSLocation} icon={gpsIcon}>
            <Popup>Lokasi Anda Saat Ini</Popup>
          </Marker>
        )}

        {showCoverArea && geoJsonData && (
          <CoverAreaLayer data={geoJsonData} />
        )}

        {isHeatmapMode ? (
          filteredMarkers.map((loc) => {
            const brokenCount = loc.devices.filter(d => d.status !== 'active').length
            if (brokenCount === 0) return null
            const radius = Math.min(15 + (brokenCount * 3), 60)
            return (
              <CircleMarker 
                key={`heat-${loc.id}`} 
                center={[loc.latitude, loc.longitude]} 
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6, weight: 2 }} 
                radius={radius}
              >
                <Tooltip className="premium-tooltip" direction="top" opacity={1}>
                  <div className="font-bold text-slate-800 text-center p-2">
                    <p className="text-lg mb-1">{loc.name}</p>
                    <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">{brokenCount} Perangkat Bermasalah</span>
                  </div>
                </Tooltip>
              </CircleMarker>
            )
          })
        ) : (
          <MarkerClusterGroup chunkedLoading maxClusterRadius={60} iconCreateFunction={createClusterIcon}>
            {filteredMarkers.map((marker: MapMarker) => <LocationMarker key={marker.id} marker={marker} />)}
          </MarkerClusterGroup>
        )}
      </MapContainer>
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
