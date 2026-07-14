import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, MapPin, Search } from 'lucide-react'
import { locationService } from '../services/locationService'
import { HierarchyModal } from '../components/modals/HierarchyModal'
import type { HierarchyType } from '../components/modals/HierarchyModal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { LocationFormModal } from '../components/modals/LocationFormModal'
import { PageContainer } from '../components/layout/PageContainer'
import { SidebarNav } from '../components/layout/SidebarNav'
import toast from 'react-hot-toast'
import type { Area, Regional, District, Cluster, Location } from '../types'

type TabType = 'area' | 'regional' | 'district' | 'cluster' | 'location'

export function LocationsManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('area')
  const [areas, setAreas] = useState<Area[]>([])
  const [regionals, setRegionals] = useState<Regional[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const hierarchy = await locationService.getHierarchy()
      setAreas(hierarchy.areas || [])
      setRegionals(hierarchy.regionals || [])
      setDistricts(hierarchy.districts || [])
      setClusters(hierarchy.clusters || [])
      
      const locs = await locationService.getLocations()
      setLocations(locs || [])
    } catch (error) {
      toast.error('Gagal mengambil data lokasi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = () => {
    if (activeTab === 'location') {
      setEditingItem(null)
      setIsLocationModalOpen(true)
      return
    }
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    if (activeTab === 'location') {
      setEditingItem(item)
      setIsLocationModalOpen(true)
      return
    }
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (item: any) => {
    if (activeTab === 'location') {
      const deviceCount = item._count?.devices || item.devices?.length || 0
      if (deviceCount > 0) {
        toast.error(`Tidak dapat menghapus ${item.name} karena masih memiliki ${deviceCount} perangkat.`)
        return
      }
      setDeletingItem(item)
      setIsDeleteModalOpen(true)
      return
    }
    // Check for children
    let hasChildren = false
    if (activeTab === 'area') hasChildren = item.regionals?.length > 0 || (item._count?.regionals || 0) > 0
    if (activeTab === 'regional') hasChildren = item.districts?.length > 0 || (item._count?.districts || 0) > 0
    if (activeTab === 'district') hasChildren = item.clusters?.length > 0 || (item._count?.clusters || 0) > 0
    if (activeTab === 'cluster') hasChildren = item.locations?.length > 0 || (item._count?.locations || 0) > 0

    if (hasChildren) {
      toast.error(`Tidak dapat menghapus ${item.name} karena masih memiliki sub-wilayah/lokasi di dalamnya.`)
      return
    }

    setDeletingItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    setIsDeleting(true)
    try {
      switch (activeTab) {
        case 'area':
          await locationService.deleteArea(deletingItem.id)
          break
        case 'regional':
          await locationService.deleteRegional(deletingItem.id)
          break
        case 'district':
          await locationService.deleteDistrict(deletingItem.id)
          break
        case 'cluster':
          await locationService.deleteCluster(deletingItem.id)
          break
        case 'location':
          await locationService.deleteLocation(deletingItem.id)
          break
      }
      toast.success(`${deletingItem.name} berhasil dihapus`)
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus data')
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
      setDeletingItem(null)
    }
  }

  const getParentOptions = () => {
    switch (activeTab) {
      case 'regional': return areas
      case 'district': return regionals
      case 'cluster': return districts
      default: return []
    }
  }

  const filteredData = () => {
    const query = searchQuery.toLowerCase()
    let data: any[] = []
    switch (activeTab) {
      case 'area': data = areas; break;
      case 'regional': data = regionals; break;
      case 'district': data = districts; break;
      case 'cluster': data = clusters; break;
      case 'location': data = locations; break;
    }
    if (!query) return data
    return data.filter(item => item.name.toLowerCase().includes(query))
  }

  const getParentName = (item: any) => {
    switch (activeTab) {
      case 'regional': return areas.find(a => a.id === item.area_id)?.name || '-'
      case 'district': return regionals.find(r => r.id === item.regional_id)?.name || '-'
      case 'cluster': return districts.find(d => d.id === item.district_id)?.name || '-'
      case 'location': return item.cluster?.name || clusters.find(c => c.id === item.clusterId)?.name || '-'
      default: return '-'
    }
  }

  const getChildCount = (item: any) => {
    switch (activeTab) {
      case 'area': return item._count?.regionals || item.regionals?.length || 0
      case 'regional': return item._count?.districts || item.districts?.length || 0
      case 'district': return item._count?.clusters || item.clusters?.length || 0
      case 'cluster': return item._count?.locations || item.locations?.length || 0
      case 'location': return item._count?.devices || item.devices?.length || 0
      default: return 0
    }
  }

  const getChildLabel = () => {
    switch (activeTab) {
      case 'area': return 'Regionals'
      case 'regional': return 'Districts'
      case 'district': return 'Clusters'
      case 'cluster': return 'Lokasi'
      case 'location': return 'Perangkat'
      default: return ''
    }
  }

  return (
    <PageContainer sidebar={<SidebarNav />}>
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-cyan-500" />
            Manajemen Lokasi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola master data hierarki dan lokasi STO/Site</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          {(['area', 'regional', 'district', 'cluster', 'location'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'location' ? 'Lokasi (STO/Site)' : tab}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              Memuat data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                <tr>
                  <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-300">Nama</th>
                  {activeTab !== 'area' && (
                    <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-300">Induk (Parent)</th>
                  )}
                  <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-300 text-center">Jumlah {getChildLabel()}</th>
                  <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData().length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredData().map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200">
                        {item.name}
                      </td>
                      {activeTab !== 'area' && (
                        <td className="py-3 px-6 text-slate-600 dark:text-slate-400">
                          {getParentName(item)}
                        </td>
                      )}
                      <td className="py-3 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                          {getChildCount(item)}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <HierarchyModal
        isOpen={isModalOpen && activeTab !== 'location'}
        onClose={() => setIsModalOpen(false)}
        type={activeTab as HierarchyType}
        initialData={editingItem}
        parentOptions={getParentOptions()}
        onSuccess={fetchData}
      />

      <LocationFormModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false)
          setEditingItem(null)
        }}
        location={editingItem as Location}
        onSuccess={fetchData}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data"
        message={`Apakah Anda yakin ingin menghapus ${deletingItem?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        isLoading={isDeleting}
      />
        </div>
      </div>
    </PageContainer>
  )
}
