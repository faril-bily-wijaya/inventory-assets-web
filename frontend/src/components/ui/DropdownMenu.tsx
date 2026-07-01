import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined)

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: ReactNode
  asChild?: boolean
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownMenuContext)!
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        context.setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [context])

  const toggleOpen = () => context.setOpen(!context.open)

  if (asChild && ref.current) {
    return (
      <div ref={ref} onClick={toggleOpen}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} onClick={toggleOpen}>
      {children}
    </div>
  )
}

interface DropdownMenuContentProps {
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}

export function DropdownMenuContent({ children, align = 'end', className }: DropdownMenuContentProps) {
  const context = useContext(DropdownMenuContext)!

  if (!context.open) return null

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[8rem] bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg py-1',
        'animate-in fade-in slide-in-from-top-2 duration-150',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 py-1.5 text-sm">{children}</div>
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-[var(--border)] my-1" />
}

interface DropdownMenuItemProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext)!

  return (
    <div
      className={cn(
        'px-2 py-1.5 text-sm cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors',
        className
      )}
      onClick={() => {
        onClick?.()
        context.setOpen(false)
      }}
    >
      {children}
    </div>
  )
}
