import { useState, useEffect } from 'react'
import { Server, CheckCircle, AlertCircle } from 'lucide-react'
import { deviceService } from '../../services/deviceService'
import { cn } from '../../utils/cn'

export function QuickStats() {
  const [stats, setStats] = useState<{
    total: number
    byStatus: Record<string, number>
    byCategory?: Record<string, number>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const data = await deviceService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <h3 className="text-xs font-medium uppercase text-[var(--text-muted)] mb-3">Quick Stats</h3>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-[var(--bg-elevated)] rounded-md animate-pulse" />
        ))}
      </div>
    )
  }

  const items = [
    { label: 'Total', value: stats?.total || 0, icon: Server, color: 'text-cyan-400' },
    { label: 'Catu Daya', value: stats?.byCategory?.catuDaya || 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Non-Catu Daya', value: stats?.byCategory?.nonCatuDaya || 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Critical', value: stats?.byStatus?.critical || 0, icon: AlertCircle, color: 'text-red-400' },
  ]

  return (
    <div className="glass-panel rounded-xl p-4 shadow-xl">
      <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-secondary)] mb-4">Quick Stats</h3>
      <div className="space-y-3">
        {items.map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className={cn('p-2.5 rounded-xl shadow-inner bg-white dark:bg-black/20', item.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{item.value}</p>
                <p className="text-xs font-medium text-[var(--text-muted)]">{item.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
