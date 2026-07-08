import { Sun, Moon, Bell, LogOut, User, Menu, Settings } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/DropdownMenu'

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="h-16 glass z-40 px-6 flex items-center justify-between shadow-sm relative">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2 lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="h-8 md:h-10 w-auto">
              <img src="/Logo.png" alt="Inventory Assets Logo" className="h-full w-auto object-contain" />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1">Inventori Perangkat</p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2" title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}>
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-[var(--text-muted)]">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="w-8 h-8 bg-cyan-500/15 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="hidden md:inline text-[var(--text-primary)]">
                {user?.fullName || user?.username}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div>
                <p className="text-[var(--text-primary)]">{user?.fullName || user?.username}</p>
                <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                <p className="text-xs text-cyan-400 mt-1">{user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="text-[var(--text-primary)]">
              <div className="w-full cursor-pointer flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
