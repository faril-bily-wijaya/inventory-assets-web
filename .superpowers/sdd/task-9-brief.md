# Task 9: Create Login and Dashboard Pages

**Location in Plan:** Phase 6, Task 9

## Context
Tasks 3-4 created components and layouts. Task 9 creates the Login and Dashboard pages.

## Files to Create
1. `frontend/src/pages/LoginPage.tsx`
2. `frontend/src/pages/DashboardPage.tsx`
3. `frontend/src/components/sidebar/FilterPanel.tsx`
4. `frontend/src/components/sidebar/QuickStats.tsx`

## LoginPage Component
```typescript
// src/pages/LoginPage.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LogIn } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true)
      setError(null)
      await login(data.username, data.password)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <span className="text-white font-bold text-2xl">IF</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inventory Assets</h1>
          <p className="text-[var(--text-muted)] mt-1">TIF Indonesia - Asset Management</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Sign in to your account</h2>

            {error && (
              <div className="p-3 bg-danger-muted border border-danger/30 rounded-md">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <Input label="Username" placeholder="Enter your username" error={errors.username?.message} {...register('username')} />
            <Input type="password" label="Password" placeholder="Enter your password" error={errors.password?.message} {...register('password')} />

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} leftIcon={!isLoading && <LogIn className="w-4 h-4" />}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-muted)]">Demo credentials: admin / admin123</p>
          </div>
        </Card>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">© 2024 TIF Indonesia. All rights reserved.</p>
      </div>
    </div>
  )
}
```

## DashboardPage Component
```typescript
// src/pages/DashboardPage.tsx
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
```

## FilterPanel Component
```typescript
// src/components/sidebar/FilterPanel.tsx
import { useState, useEffect } from 'react'
import { ChevronDown, Filter, Search, X } from 'lucide-react'
import { locationService } from '../../services/locationService'
import { cn } from '../../utils/cn'

export function FilterPanel() {
  const [regionals, setRegionals] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [clusters, setClusters] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState({ regional: true, district: false, cluster: false, status: false })

  useEffect(() => { loadHierarchy() }, [])

  const loadHierarchy = async () => {
    try {
      const data = await locationService.getHierarchy()
      setRegionals(data.regionals)
      setDistricts(data.districts)
      setClusters(data.clusters)
    } catch (error) { console.error('Failed to load hierarchy:', error) }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-accent" />
        <span className="font-medium text-sm">Filters</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input type="text" placeholder="Search..." className="input pl-9 text-sm" />
      </div>

      {/* Regional */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button onClick={() => toggleSection('regional')} className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]">
          <span className="text-sm font-medium">Regional</span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', expandedSections.regional && 'rotate-180')} />
        </button>
        {expandedSections.regional && (
          <div className="p-2 space-y-1">
            {regionals.map(r => <button key={r.id} className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-[var(--bg-elevated)]">{r.name}</button>)}
          </div>
        )}
      </div>

      {/* District */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button onClick={() => toggleSection('district')} className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]">
          <span className="text-sm font-medium">District</span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', expandedSections.district && 'rotate-180')} />
        </button>
        {expandedSections.district && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {districts.map(d => <button key={d.id} className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-[var(--bg-elevated)]">{d.name}</button>)}
          </div>
        )}
      </div>

      {/* Cluster */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <button onClick={() => toggleSection('cluster')} className="w-full flex items-center justify-between p-3 bg-[var(--bg-elevated)]">
          <span className="text-sm font-medium">Cluster</span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', expandedSections.cluster && 'rotate-180')} />
        </button>
        {expandedSections.cluster && (
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {clusters.map(c => <button key={c.id} className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-[var(--bg-elevated)]">{c.name}</button>)}
          </div>
        )}
      </div>
    </div>
  )
}
```

## QuickStats Component
```typescript
// src/components/sidebar/QuickStats.tsx
import { useState, useEffect } from 'react'
import { Server, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { deviceService } from '../../services/deviceService'
import { Card } from '../ui/Card'
import { cn } from '../../utils/cn'

export function QuickStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const data = await deviceService.getStats()
      setStats(data)
    } catch (error) { console.error('Failed to load stats:', error) }
    finally { setIsLoading(false) }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-[var(--bg-elevated)] rounded-md animate-pulse" />)}
      </div>
    )
  }

  const items = [
    { label: 'Total', value: stats?.total || 0, icon: Server, color: 'text-accent' },
    { label: 'Active', value: stats?.byStatus?.active || 0, icon: CheckCircle, color: 'text-success' },
    { label: 'Warning', value: stats?.byStatus?.warning || 0, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Critical', value: stats?.byStatus?.critical || 0, icon: AlertCircle, color: 'text-danger' },
  ]

  return (
    <div className="p-4">
      <h3 className="text-xs font-medium uppercase text-[var(--text-muted)] mb-3">Quick Stats</h3>
      <div className="space-y-3">
        {items.map(item => {
          const Icon = item.icon
          return (
            <Card key={item.label} padding="sm" className="flex items-center gap-3">
              <div className={cn('p-2 rounded-md bg-[var(--bg-elevated)]', item.color)}><Icon className="w-4 h-4" /></div>
              <div>
                <p className="text-lg font-semibold">{item.value}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
```

## Commit
```bash
git add src/pages/ src/components/sidebar/
git commit -m "feat: add LoginPage and DashboardPage"
```
