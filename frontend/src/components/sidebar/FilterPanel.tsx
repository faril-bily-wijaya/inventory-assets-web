import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { locationService } from '../../services/locationService'
import { cn } from '../../utils/cn'

export function FilterPanel() {
  const [regionals, setRegionals] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [clusters, setClusters] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState({
    regional: true,
    district: false,
    cluster: false,
    status: false
  })

  useEffect(() => { loadHierarchy() }, [])

  const loadHierarchy = async () => {
    try {
      const data = await locationService.getHierarchy()
      setRegionals(data.regionals)
      setDistricts(data.districts)
      setClusters(data.clusters)
    } catch (error) {
      console.error('Failed to load hierarchy:', error)
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400">☰</span>
        <span className="font-medium text-sm text-[var(--text-primary)]">Filters</span>
      </div>

      {/* Regional */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection('regional')}
          className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]"
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">Regional</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.regional && 'rotate-180')} />
        </button>
        {expandedSections.regional && (
          <div className="p-2 space-y-1">
            {regionals.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              regionals.map(r => (
                <button
                  key={r.id}
                  className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                >
                  {r.name}
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
          <span className="text-sm font-medium text-[var(--text-primary)]">District</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.district && 'rotate-180')} />
        </button>
        {expandedSections.district && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {districts.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              districts.map(d => (
                <button
                  key={d.id}
                  className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
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
          <span className="text-sm font-medium text-[var(--text-primary)]">Cluster</span>
          <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', expandedSections.cluster && 'rotate-180')} />
        </button>
        {expandedSections.cluster && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {clusters.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No data available</p>
            ) : (
              clusters.map(c => (
                <button
                  key={c.id}
                  className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                >
                  {c.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
