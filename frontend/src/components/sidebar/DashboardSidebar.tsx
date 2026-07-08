import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Zap, Server, Layers, PieChart as PieChartIcon, Download, Filter, BarChart3, Settings, LogOut, ChevronDown, ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useMapContext } from '../../contexts/MapContext'
import { useAuth } from '../../contexts/AuthContext'
import { isCatuDaya } from '../../utils/deviceType'
import { locationService } from '../../services/locationService'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { SearchableSelect } from '../ui/SearchableSelect'

export function DashboardSidebar() {
  const { markers, locations, filters, setFilters, mapStyle, setMapStyle, filter, setFilter, statusFilter, setStatusFilter, conditionFilter, setConditionFilter, brandFilter, setBrandFilter, search, setSearch, setShowAnalytics } = useMapContext()
  const { logout } = useAuth()
  const [showHelp, setShowHelp] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  // Hierarchy State
  const [areas, setAreas] = useState<any[]>([])
  const [regionals, setRegionals] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [clusters, setClusters] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState({
    area: true,
    regional: false,
    district: false,
    cluster: false,
    location: false,
  })

  // Location Search State
  const [areaSearch, setAreaSearch] = useState('')
  const [regionalSearch, setRegionalSearch] = useState('')
  const [districtSearch, setDistrictSearch] = useState('')
  const [clusterSearch, setClusterSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')

  useEffect(() => { loadHierarchy() }, [])

  const loadHierarchy = async () => {
    try {
      const data = await locationService.getHierarchy()
      setAreas(data.areas || [])
      setRegionals(data.regionals || [])
      setDistricts(data.districts || [])
      setClusters(data.clusters || [])
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

  // Calculate unique filters based on all raw markers
  const { availableBrands, availableStatuses, availableConditions } = useMemo(() => {
    const brands = new Set<string>()
    const statuses = new Set<string>()
    const conditions = new Set<string>()
    
    markers.forEach(loc => {
      loc.devices.forEach(d => {
        const isCD = isCatuDaya(d.deviceType)
        if (filter === 'CATU_DAYA' && !isCD) return
        if (filter === 'NON_CATU_DAYA' && isCD) return
        
        const isGenset = ['genset mobile', 'genset mobil', 'dummy load'].includes(d.deviceType?.toLowerCase() || '')
        if (filter === 'GENSET_MOBILE' && !isGenset) return
        
        if (d.brand) brands.add(d.brand)
        if (d.status) statuses.add(d.status)
        if (d.condition) conditions.add(d.condition)
      })
    })
    
    return { 
      availableBrands: Array.from(brands).sort(), 
      availableStatuses: Array.from(statuses).sort(),
      availableConditions: Array.from(conditions).sort()
    }
  }, [markers, filter])

  // Calculate filtered stats
  const stats = useMemo(() => {
    let total = 0
    let catuDaya = 0
    let nonCatuDaya = 0

    markers.forEach(loc => {
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

      filteredDevices.forEach(d => {
        if (isCatuDaya(d.deviceType)) { catuDaya++ } else { nonCatuDaya++ }
      })
      total += filteredDevices.length
    })
    return { total, catuDaya, nonCatuDaya }
  }, [markers, filter, statusFilter, conditionFilter, brandFilter, search])

  const chartData = [
    { name: 'Catu Daya', value: stats.catuDaya, color: '#f97316' }, 
    { name: 'Non-Catu', value: stats.nonCatuDaya, color: '#3b82f6' } 
  ]

  const handleSearchEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (stats.total > 0) {
        toast.success(`Ditemukan data perangkat!`)
      } else {
        toast.error("Tidak ada perangkat yang cocok.")
      }
    }
  }

  const exportGlobalCSV = () => {
    try {
      if (!markers || markers.length === 0) {
        toast.error("Tidak ada data untuk diekspor.")
        return
      }
      
      const rows = markers.flatMap(m => 
        m.devices.map((d: any) => ({
        "id": d.id || '',
        "device_code": d.deviceCode || '',
        "device_name": d.deviceName || '',
        "device_type": d.deviceType || '',
        "brand": d.brand || '',
        "model": d.model || '',
        "serial_number": d.serialNumber || '',
        "label_code": d.labelCode || '',
        "kapasitas": d.kapasitas || '',
        "satuan_kapasitas": d.satuanKapasitas || '',
        "year": d.year || '',
        "usia_perangkat": d.usiaPerangkat || '',
        "status": d.status || '',
        "condition": d.condition || '',
        "cap_real": d.capReal || '',
        "jenis_tegangan": d.jenisTegangan || '',
        "beban_arus": d.bebanArus || '',
        "satuan_beban": d.satuanBeban || '',
        "ruangan_code": d.ruanganCode || '',
        "ruangan_name": d.ruanganName || '',
        "ruangan_panjang": d.ruanganPanjang || '',
        "ruangan_lebar": d.ruanganLebar || '',
        "ruangan_tinggi": d.ruanganTinggi || '',
        "ruangan_luas": d.ruanganLuas || '',
        "rack_code": d.rackCode || '',
        "rack_name": d.rackName || '',
        "rack_panjang": d.rackPanjang || '',
        "rack_lebar": d.rackLebar || '',
        "rack_tinggi": d.rackTinggi || '',
        "rack_luas": d.rackLuas || '',
        "keterangan": d.keterangan || '',
        "butuh_modernisasi": d.butuhModernisasi ? "Ya" : "Tidak",
        "alasan_modernisasi": d.alasan || '',
        "uuid": d.uuid || '',
        "organization_uuid": d.organizationUuid || '',
        "organization_name": d.organizationName || '',
        "organization_sname": d.organizationSname || '',
        "area": m.hierarchy?.area || '',
        "regional": m.hierarchy?.regional || '',
        "district": m.hierarchy?.district || '',
        "cluster": m.hierarchy?.cluster || '',
        "location_id": d.locationId || m.id || '',
        "site_name": m.name || '',
        "site_code": m.siteCode || '',
        "address": m.address || '',
        "class_type": m.classType || '',
        "latitude": m.latitude || '',
        "longitude": m.longitude || '',
        "teknisi": m.teknisi || '',
        "created_at": d.createdAt ? new Date(d.createdAt).toLocaleString() : '',
        "updated_at": d.updatedAt ? new Date(d.updatedAt).toLocaleString() : ''
        }))
      )

      // Create Worksheet
      const worksheet = XLSX.utils.json_to_sheet(rows)
      
      // Auto-size columns slightly
      const colWidths = Object.keys(rows[0]).map(() => ({ wch: 20 }))
      worksheet['!cols'] = colWidths

      // Create Workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perangkat")
      
      // Generate file and trigger download
      const fileName = `infranexia_export_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success(`Berhasil mengekspor ${rows.length} perangkat dalam format Excel (XLSX).`)
    } catch (err) {
      console.error(err)
      toast.error("Gagal melakukan ekspor ke Excel.")
    }
  }

  return (
    <>
      <div className={`z-20 h-full flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isOpen ? 'w-[360px]' : 'w-0 overflow-hidden'}`}>
        <div className="w-[360px] flex flex-col h-full">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
        <div>
          <div className="flex flex-col">
            <div className="h-10 w-auto">
              <img src="/Logo.png" alt="Inventory Assets Logo" className="h-full w-auto object-contain" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Inventori Perangkat</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mb-6 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text" 
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchEnter}
            placeholder="Cari lokasi, perangkat, merk..." 
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:text-white transition-all shadow-sm"
          />
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <PieChartIcon className="w-3.5 h-3.5" /> Ringkasan Data
          </h3>
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.total}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total Perangkat</p>
            </div>
            <div className="w-20 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={35}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAnalytics(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold text-sm border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={exportGlobalCSV}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-sm border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="Unduh semua data yang sedang ter-filter"
            >
              <Download className="w-4 h-4" /> Ekspor (Semua)
            </button>
          </div>
        </div>
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Filter Lokasi
          </h3>
          <div className="flex flex-col gap-2">
            {/* Area */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button onClick={() => toggleSection('area')} className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">Area</span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expandedSections.area && 'rotate-180')} />
              </button>
              {expandedSections.area && (
                <div className="p-2 space-y-1 flex flex-col">
                  <div className="mb-1 relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input type="text" value={areaSearch} onChange={e => setAreaSearch(e.target.value)} placeholder="Cari Area..." className="w-full pl-7 pr-2 py-1.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-red-500" />
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                    {areas.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase())).map(a => (
                      <button key={a.id} onClick={() => handleFilterClick('areaId', a.id)} className={cn("w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors", filters.areaId?.includes(a.id) ? "bg-red-50 text-red-600 font-semibold dark:bg-red-900/20 dark:text-red-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400")}>{a.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Regional */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button onClick={() => toggleSection('regional')} className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">Regional</span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expandedSections.regional && 'rotate-180')} />
              </button>
              {expandedSections.regional && (
                <div className="p-2 space-y-1 flex flex-col">
                  <div className="mb-1 relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input type="text" value={regionalSearch} onChange={e => setRegionalSearch(e.target.value)} placeholder="Cari Regional..." className="w-full pl-7 pr-2 py-1.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-red-500" />
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                    {filteredRegionals.filter(r => r.name.toLowerCase().includes(regionalSearch.toLowerCase())).map(r => (
                      <button key={r.id} onClick={() => handleFilterClick('regionalId', r.id)} className={cn("w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors", filters.regionalId?.includes(r.id) ? "bg-red-50 text-red-600 font-semibold dark:bg-red-900/20 dark:text-red-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400")}>{r.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* District */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button onClick={() => toggleSection('district')} className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">District</span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expandedSections.district && 'rotate-180')} />
              </button>
              {expandedSections.district && (
                <div className="p-2 space-y-1 flex flex-col">
                  <div className="mb-1 relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input type="text" value={districtSearch} onChange={e => setDistrictSearch(e.target.value)} placeholder="Cari District..." className="w-full pl-7 pr-2 py-1.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-red-500" />
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                    {filteredDistricts.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase())).map(d => (
                      <button key={d.id} onClick={() => handleFilterClick('districtId', d.id)} className={cn("w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors", filters.districtId?.includes(d.id) ? "bg-red-50 text-red-600 font-semibold dark:bg-red-900/20 dark:text-red-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400")}>{d.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cluster */}
            <div className="border border-slate-200 dark:border-slate-700/50 rounded-lg overflow-hidden">
              <button onClick={() => toggleSection('cluster')} className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">Cluster</span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expandedSections.cluster && 'rotate-180')} />
              </button>
              {expandedSections.cluster && (
                <div className="p-2 space-y-1 flex flex-col">
                  <div className="mb-1 relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input type="text" value={clusterSearch} onChange={e => setClusterSearch(e.target.value)} placeholder="Cari Cluster..." className="w-full pl-7 pr-2 py-1.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-red-500" />
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                    {filteredClusters.filter(c => c.name.toLowerCase().includes(clusterSearch.toLowerCase())).map(c => (
                      <button key={c.id} onClick={() => handleFilterClick('clusterId', c.id)} className={cn("w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors", filters.clusterId?.includes(c.id) ? "bg-red-50 text-red-600 font-semibold dark:bg-red-900/20 dark:text-red-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400")}>{c.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location (STO/Site) */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button onClick={() => toggleSection('location')} className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">Location (STO/Site)</span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expandedSections.location && 'rotate-180')} />
              </button>
              {expandedSections.location && (
                <div className="p-2 space-y-1 flex flex-col">
                  <div className="mb-1 relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input type="text" value={locationSearch} onChange={e => setLocationSearch(e.target.value)} placeholder="Cari Location..." className="w-full pl-7 pr-2 py-1.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-red-500" />
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                    {locations.filter(loc => loc.name.toLowerCase().includes(locationSearch.toLowerCase())).map(loc => (
                      <button key={loc.id} onClick={() => handleFilterClick('locationId', loc.id)} className={cn("w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors truncate", filters.locationId?.includes(loc.id) ? "bg-red-50 text-red-600 font-semibold dark:bg-red-900/20 dark:text-red-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400")} title={loc.name}>{loc.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Advanced Filters
          </h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Status</label>
                <SearchableSelect 
                  value={statusFilter || 'ALL'}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'MODERNISASI', label: 'Perlu Modernisasi' },
                    ...availableStatuses.map(s => ({ value: s, label: s }))
                  ]}
                  defaultLabel="Semua Status"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Kondisi</label>
                <SearchableSelect 
                  value={conditionFilter || 'ALL'}
                  onChange={setConditionFilter}
                  options={availableConditions.map(c => ({ value: c, label: c }))}
                  defaultLabel="Semua Kondisi"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Merk / Brand</label>
              <SearchableSelect 
                value={brandFilter || 'ALL'}
                onChange={setBrandFilter}
                options={availableBrands.map(b => ({ value: b, label: b }))}
                defaultLabel="Semua Merk"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kategori Perangkat</h3>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Panduan Kategori"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-300" />
            </button>
          </div>

          {/* Help Popup */}
          {showHelp && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <div className="flex items-start justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Panduan Kategori</span>
                <button onClick={() => setShowHelp(false)} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
                    <Zap className="w-3 h-3" /> Catu Daya
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    GENSET, UPS, Rectifier, Trafo, MDP, ATS, AMF, Batere, ACPDB, DCPDB, Inverter, AVR, dll
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                    <Server className="w-3 h-3" /> Non-Catu Daya
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Switch, Router, BRAS, OLT, Metro E, Firewall, Server, Transmission, dll
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={() => setFilter('ALL')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${filter === 'ALL' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 shadow-sm ring-1 ring-red-100 dark:ring-red-900' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <span className="font-semibold text-sm">Semua Perangkat</span>
            </button>
            
            <button 
              onClick={() => setFilter('CATU_DAYA')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${filter === 'CATU_DAYA' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 shadow-sm ring-1 ring-orange-100 dark:ring-orange-900' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${filter === 'CATU_DAYA' ? 'bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300' : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-500'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Catu Daya</span>
              </div>
            </button>

            <button 
              onClick={() => setFilter('NON_CATU_DAYA')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${filter === 'NON_CATU_DAYA' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-900' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${filter === 'NON_CATU_DAYA' ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-500'}`}>
                  <Server className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Non-Catu Daya</span>
              </div>
            </button>

            <button 
              onClick={() => setFilter('GENSET_MOBILE')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${filter === 'GENSET_MOBILE' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 shadow-sm ring-1 ring-amber-100 dark:ring-amber-900' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${filter === 'GENSET_MOBILE' ? 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Genset Mobile</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="space-y-4 mt-8">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tampilan Peta</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setMapStyle('street')}
              className={`py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all ${mapStyle === 'street' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <MapPin className="w-3 h-3" />
              Jalan
            </button>
            <button 
              onClick={() => setMapStyle('satellite')}
              className={`py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all ${mapStyle === 'satellite' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <Layers className="w-3 h-3" />
              Satelit
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between">
        <Link to="/devices" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex-1" title="Manajemen Perangkat">
          <Server className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Perangkat</span>
        </Link>
        <Link to="/genset-mobile" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex-1" title="Genset Mobile">
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Genset</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex-1" title="Pengaturan">
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Settings</span>
        </Link>
        <button onClick={logout} className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-1" title="Keluar">
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Logout</span>
        </button>
      </div>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-5 h-12 bg-white dark:bg-slate-800 border-y border-r border-slate-200 dark:border-slate-700 shadow-md rounded-r-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 ${isOpen ? 'left-[360px]' : 'left-0'}`}
        title={isOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>
    </>
  )
}
