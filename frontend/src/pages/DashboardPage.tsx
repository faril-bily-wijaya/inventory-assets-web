import { useEffect } from 'react'
import { MapView } from '../components/map/MapView'
import { DashboardSidebar } from '../components/sidebar/DashboardSidebar'
import { AnalyticsModal } from '../components/map/AnalyticsModal'
import { LocationTableModal } from '../components/map/LocationTableModal'
import { useMapContext } from '../contexts/MapContext'

export default function DashboardPage() {
  const { refreshMapData } = useMapContext()

  useEffect(() => {
    refreshMapData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <DashboardSidebar />
      <div className="flex-1 relative z-0">
        <MapView />
      </div>
      <AnalyticsModal />
      <LocationTableModal />
    </div>
  )
}
