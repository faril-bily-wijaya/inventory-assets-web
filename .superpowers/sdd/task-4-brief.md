# Task 4: Create Layout Components

**Location in Plan:** Phase 2, Task 4

## Context
Task 3 created base UI components. Task 4 creates layout components that form the app shell.

## Files to Create
1. `frontend/src/components/layout/Header.tsx`
2. `frontend/src/components/layout/Sidebar.tsx`
3. `frontend/src/components/layout/ProtectedRoute.tsx`
4. `frontend/src/components/layout/PageContainer.tsx`

## Header Component
```typescript
// src/components/layout/Header.tsx
import { Sun, Moon, Bell, LogOut, User, Menu } from 'lucide-react'
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
    <header className="h-14 bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2 lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">IF</span>
          </div>
          <div>
            <h1 className="font-semibold text-[var(--text-primary)]">Inventory Assets</h1>
            <p className="text-xs text-[var(--text-muted)]">TIF Indonesia</p>
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
        <Button variant="ghost" size="sm" className="p-2 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="w-8 h-8 bg-accent-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-accent" />
              </div>
              <span className="hidden md:inline text-[var(--text-primary)]">
                {user?.fullName || user?.username}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div>
                <p>{user?.fullName || user?.username}</p>
                <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                <p className="text-xs text-accent mt-1">{user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-danger cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

## Sidebar Component
```typescript
// src/components/layout/Sidebar.tsx
import { ReactNode, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

interface SidebarProps {
  children: ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ children, isOpen = true, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          'bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-all duration-250 flex flex-col',
          'fixed lg:relative inset-y-0 left-0 z-50',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-72'
        )}
      >
        {/* Toggle button */}
        <div className="flex items-center justify-between p-2 border-b border-[var(--border)]">
          <span className={cn('text-sm font-medium', isCollapsed && 'hidden')}>
            Menu
          </span>
          <div className="flex items-center gap-1">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2 lg:hidden">
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar content */}
        <div className={cn('flex-1 overflow-y-auto', isCollapsed && 'hidden lg:block')}>
          {children}
        </div>

        {/* Collapsed icons for desktop */}
        {isCollapsed && (
          <div className="hidden lg:flex flex-col items-center py-4">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center mb-4">
              <span className="text-white text-xs font-bold">IF</span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
```

## ProtectedRoute Component
```typescript
// src/components/layout/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

## PageContainer Component
```typescript
// src/components/layout/PageContainer.tsx
import { ReactNode, useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface PageContainerProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function PageContainer({ children, sidebar }: PageContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenuButton={!!sidebar} />
      <div className="flex-1 flex overflow-hidden">
        {sidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            {sidebar}
          </Sidebar>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Update PageContainer to accept sidebar children properly
The PageContainer should pass sidebar content to the Sidebar component.

## Verification
1. Run `npm run dev`
2. Navigate to login page
3. Test theme toggle
4. Test responsive sidebar on mobile

## Commit
```bash
git add src/components/layout/
git commit -m "feat: add layout components (Header, Sidebar, ProtectedRoute, PageContainer)"
```
