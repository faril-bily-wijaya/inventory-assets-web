import { PageContainer } from '../components/layout/PageContainer'
import { MapView } from '../components/map/MapView'
import { FilterPanel } from '../components/sidebar/FilterPanel'
import { QuickStats } from '../components/sidebar/QuickStats'

export default function DashboardPage() {
  return (
    <PageContainer sidebar={<SidebarContent />}>
      <div className="h-full flex flex-col">
        <div className="flex-1 relative">
          <MapView />
        </div>
      </div>
    </PageContainer>
  )
}

function SidebarContent() {
  return (
    <>
      <QuickStats />
      <FilterPanel />
    </>
  )
}
