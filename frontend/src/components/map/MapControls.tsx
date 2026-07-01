import { ZoomIn, ZoomOut, Layers, Maximize2 } from 'lucide-react'
import { useMapContext } from '../../contexts/MapContext'
import { Button } from '../ui/Button'
import { useState } from 'react'

export function MapControls() {
  const { setMapView, mapZoom } = useMapContext()
  const [showLayers, setShowLayers] = useState(false)

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden">
        <Button variant="ghost" size="sm" onClick={() => setMapView([-3.5, 103.5], mapZoom + 1)} className="rounded-none border-b border-[var(--border)] px-3 py-2">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setMapView([-3.5, 103.5], mapZoom - 1)} className="rounded-none px-3 py-2">
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden">
        <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)} className="rounded-none px-3 py-2">
          <Layers className="w-4 h-4" />
        </Button>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden">
        <Button variant="ghost" size="sm" onClick={() => setMapView([-3.5, 103.5], 7)} className="rounded-none px-3 py-2">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
      {showLayers && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg p-3 w-48">
          <p className="text-xs font-medium mb-2 text-[var(--text-secondary)]">Map Layers</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-cyan-500" />
              Markers
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="accent-cyan-500" />
              Heatmap
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-cyan-500" />
              Clusters
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
