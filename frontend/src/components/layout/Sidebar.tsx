import { type ReactNode, useState } from 'react'
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
            <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center mb-4">
              <span className="text-white text-xs font-bold">IF</span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
