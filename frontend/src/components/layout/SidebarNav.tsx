import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Server, Settings, Zap, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils/cn'

export function SidebarNav() {
  const { user } = useAuth()

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/devices', label: 'Perangkat', icon: Server },
    { to: '/genset-mobile', label: 'Genset Mobile', icon: Zap },
    ...(user?.role === 'ADMIN' ? [{ to: '/users', label: 'User Management', icon: Users }] : []),
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="flex flex-col gap-2">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-500 shadow-sm border border-cyan-500/20'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{link.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
