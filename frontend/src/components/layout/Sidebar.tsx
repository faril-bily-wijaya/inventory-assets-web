import { type ReactNode, useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

interface SidebarProps {
  children: ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ children, isOpen = true, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    if (isLeftSwipe && onClose) {
      onClose()
    }
  }

  const sidebarWidth = isCollapsed ? 80 : 280

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && onClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={false}
        animate={{ 
          width: sidebarWidth,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={cn(
          'glass-panel border-r-0 lg:border-r border-[var(--border)] flex flex-col',
          'fixed lg:relative inset-y-0 left-0 z-50 shadow-xl lg:shadow-none h-full',
          'transition-transform duration-300 ease-in-out max-w-[80vw]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Toggle button */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] h-16 shrink-0">
          <AnimatePresence mode="popLayout">
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-semibold tracking-wider text-[var(--text-muted)] uppercase"
              >
                Menu
              </motion.span>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2 mx-auto lg:mx-0">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2 lg:hidden">
                <X className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hidden lg:flex hover:bg-cyan-500/10 hover:text-cyan-500 transition-colors"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
          <div className={cn("transition-opacity duration-300", isCollapsed ? "opacity-0 invisible lg:opacity-100 lg:visible" : "opacity-100")}>
            {children}
          </div>
        </div>

      </motion.aside>
    </>
  )
}
