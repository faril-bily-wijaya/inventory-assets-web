import { useState, useEffect } from 'react'
import { Server, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { deviceService } from '../../services/deviceService'
import { Card } from '../ui/Card'
import { cn } from '../../utils/cn'

export function QuickStats() {
  const [stats, setStats] = useState<{
    total: number
    byStatus: Record<string, number>
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
    { label: 'Active', value: stats?.byStatus?.active || 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Warning', value: stats?.byStatus?.warning || 0, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Critical', value: stats?.byStatus?.critical || 0, icon: AlertCircle, color: 'text-red-400' },
  ]

  return (
    <div className="p-4">
      <h3 className="text-xs font-medium uppercase text-[var(--text-muted)] mb-3">Quick Stats</h3>
      <div className="space-y-3">
        {items.map(item => {
          const Icon = item.icon
          return (
            <Card key={item.label} padding="sm" className="flex items-center gap-3">
              <div className={cn('p-2 rounded-md bg-[var(--bg-elevated)]', item.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{item.value}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
