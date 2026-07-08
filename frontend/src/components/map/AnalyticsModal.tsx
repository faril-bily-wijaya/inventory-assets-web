import { BarChart3, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Label } from 'recharts'
import { useMapContext } from '../../contexts/MapContext'
import { isCatuDaya } from '../../utils/deviceType'
import { useMemo } from 'react'

export function AnalyticsModal() {
  const { showAnalytics, setShowAnalytics, markers, filter, statusFilter, conditionFilter, brandFilter, search } = useMapContext()

  const { stats, topLocations, statusPieData } = useMemo(() => {
    let total = 0
    let operational = 0
    let idle = 0
    let critical = 0
    let maintenance = 0

    const filteredLocations = markers.map(loc => {
      const filteredDevices = loc.devices.filter(d => {
        const isCD = isCatuDaya(d.deviceType)
        if (filter === 'CATU_DAYA' && !isCD) return false
        if (filter === 'NON_CATU_DAYA' && isCD) return false
        
        if (statusFilter !== 'ALL' && d.status !== statusFilter) return false
        if (conditionFilter !== 'ALL' && d.condition !== conditionFilter) return false
        if (brandFilter !== 'ALL' && d.brand !== brandFilter) return false

        if (search) {
          const q = search.toLowerCase()
          if (!loc.name.toLowerCase().includes(q) && 
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
        const s = d.status?.toLowerCase() || ''
        if (['aktif', 'active', 'operational'].includes(s)) operational++
        else if (['rusak', 'critical'].includes(s)) critical++
        else if (['maintenance', 'perbaikan'].includes(s)) maintenance++
        else idle++
      })
      total += filteredDevices.length

      return { name: loc.name, devices: filteredDevices, Total: filteredDevices.length }
    }).filter(loc => loc.devices.length > 0)

    const topLocations = [...filteredLocations]
      .sort((a, b) => b.Total - a.Total)
      .slice(0, 10)

    const statusPieData = [
      { name: 'Operational', value: operational, color: '#10b981' }, // emerald-500
      { name: 'Idle / Inactive', value: idle, color: '#3b82f6' }, // blue-500
      { name: 'Critical / Rusak', value: critical, color: '#f43f5e' }, // rose-500
    ]
    if (maintenance > 0) {
      statusPieData.push({ name: 'Maintenance', value: maintenance, color: '#f59e0b' }) // amber-500
    }
    
    // Filter out 0 values so they don't clutter the legend
    const filteredPieData = statusPieData.filter(d => d.value > 0)

    return { stats: { total }, topLocations, statusPieData: filteredPieData }
  }, [markers, filter, statusFilter, conditionFilter, brandFilter, search])

  return (
    <AnimatePresence>
      {showAnalytics && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 md:p-8"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-indigo-500" /> Dashboard Analitik Aset
                </h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Berdasarkan filter pencarian saat ini ({stats.total} Perangkat)</p>
              </div>
              <button onClick={() => setShowAnalytics(false)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all shadow-sm">
                <X className="w-5 h-5 dark:text-slate-300" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top 10 Lokasi Perangkat Terbanyak</h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topLocations} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="name" type="category" width={160} stroke="#64748b" tick={{fontSize: 10}} interval={0} />
                      <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'white', color: 'black', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="Total" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Rasio Status Perangkat</h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                        {statusPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        <Label 
                          value={stats.total} 
                          position="center" 
                          dy={-10}
                          className="text-4xl font-extrabold fill-slate-800 dark:fill-slate-100"
                        />
                        <Label 
                          value="Perangkat" 
                          position="center" 
                          dy={15}
                          className="text-xs font-semibold fill-slate-400"
                        />
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'white', color: 'black', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#475569' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
