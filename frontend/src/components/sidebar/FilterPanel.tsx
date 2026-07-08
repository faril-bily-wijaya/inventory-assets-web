import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { locationService } from '../../services/locationService'
import { cn } from '../../utils/cn'
import { useMapContext } from '../../contexts/MapContext'

export function FilterPanel() {
  const [areas, setAreas] = useState<any[]>([])
  const [regionals, setRegionals] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [clusters, setClusters] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState({
    area: true,
    regional: false,
    district: false,
    cluster: false,
    location: false,
  })

  const { filters, setFilters } = useMapContext()

  useEffect(() => { loadHierarchy() }, [])

  const loadHierarchy = async () => {
    try {
      const data = await locationService.getHierarchy()
      setAreas(data.areas || [])
      setRegionals(data.regionals || [])
      setDistricts(data.districts || [])
      setClusters(data.clusters || [])
      // Collect all locations from clusters
      const allLocations: any[] = []
      data.clusters?.forEach((cluster: any) => {
        if (cluster.locations) {
          cluster.locations.forEach((loc: any) => {
            allLocations.push(loc)
          })
        }
      })
      setLocations(allLocations)
    } catch (error) {
      console.error('Failed to load hierarchy:', error)
    }
  }

  // Cascading filters derived state
  const filteredRegionals = useMemo(() => {
    if (filters.areaId?.length) return regionals.filter(r => filters.areaId!.includes(r.area_id))
    return regionals
  }, [regionals, filters.areaId])

  const filteredDistricts = useMemo(() => {
    if (filters.regionalId?.length) return districts.filter(d => filters.regionalId!.includes(d.regional_id))
    if (filters.areaId?.length) {
      const validRegionals = new Set(filteredRegionals.map(r => r.id))
      return districts.filter(d => validRegionals.has(d.regional_id))
    }
    return districts
  }, [districts, filteredRegionals, filters.regionalId, filters.areaId])

  const filteredClusters = useMemo(() => {
    if (filters.districtId?.length) return clusters.filter(c => filters.districtId!.includes(c.district_id))
    if (filters.regionalId?.length || filters.areaId?.length) {
      const validDistricts = new Set(filteredDistricts.map(d => d.id))
      return clusters.filter(c => validDistricts.has(c.district_id))
    }
    return clusters
  }, [clusters, filteredDistricts, filters.districtId, filters.regionalId, filters.areaId])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleFilterClick = (type: 'areaId' | 'regionalId' | 'districtId' | 'clusterId' | 'locationId', id: string) => {
    const current = filters[type] || []
    const newArr = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    setFilters({ ...filters, [type]: newArr.length > 0 ? newArr : undefined })
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <span className="text-blue-500">☰</span>
          </div>
          <span className="font-bold text-sm uppercase tracking-widest text-[var(--text-secondary)]">Filters</span>
        </div>
        {(filters.areaId || filters.regionalId || filters.districtId || filters.clusterId || filters.locationId) && (
          <button onClick={handleClearFilters} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Area */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection('area')}
          className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">AREA</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.area && 'rotate-180')} />
        </button>
        {expandedSections.area && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {areas.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              areas.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleFilterClick('areaId', a.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    filters.areaId?.includes(a.id)
                      ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  )}
                >
                  {a.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Regional */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection('regional')}
          className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">REGIONAL</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.regional && 'rotate-180')} />
        </button>
        {expandedSections.regional && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {regionals.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              filteredRegionals.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleFilterClick('regionalId', r.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    filters.regionalId?.includes(r.id)
                      ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  )}
                >
                  {r.name}
                  {r.areas && <span className="text-xs text-[var(--text-muted)] ml-2">({r.areas.name})</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* District */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection('district')}
          className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">DISTRICT</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.district && 'rotate-180')} />
        </button>
        {expandedSections.district && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {districts.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              filteredDistricts.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleFilterClick('districtId', d.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    filters.districtId?.includes(d.id)
                      ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  )}
                >
                  {d.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Cluster */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection('cluster')}
          className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">CLUSTER</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.cluster && 'rotate-180')} />
        </button>
        {expandedSections.cluster && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {clusters.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              filteredClusters.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleFilterClick('clusterId', c.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    filters.clusterId?.includes(c.id)
                      ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  )}
                >
                  {c.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Location (STO/Site) */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">LOCATION (STO/SITE)</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.location && 'rotate-180')} />
        </button>
        {expandedSections.location && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {locations.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handleFilterClick('locationId', loc.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors truncate",
                    filters.locationId?.includes(loc.id)
                      ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  )}
                  title={loc.name}
                >
                  {loc.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
