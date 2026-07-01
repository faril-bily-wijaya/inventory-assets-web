# Task 3: Create Base UI Components

**Location in Plan:** Phase 2, Task 3

## Context
Task 1 created the frontend project structure with TailwindCSS configured. Task 3 creates the reusable UI components and contexts.

## Dependencies (from Task 1)
- TailwindCSS configured with custom theme
- CSS variables for dark/light mode
- `clsx` and `tailwind-merge` installed

## Files to Create
1. `frontend/src/utils/cn.ts` - Class name utility
2. `frontend/src/contexts/ThemeContext.tsx` - Theme state management
3. `frontend/src/contexts/AuthContext.tsx` - Auth state management (stub from Task 1, enhance it)
4. `frontend/src/components/ui/Button.tsx`
5. `frontend/src/components/ui/Input.tsx`
6. `frontend/src/components/ui/Card.tsx`
7. `frontend/src/components/ui/Badge.tsx`
8. `frontend/src/components/ui/Modal.tsx`
9. `frontend/src/components/ui/Select.tsx`
10. `frontend/src/components/ui/DropdownMenu.tsx`

## Design System Reference
- Accent color: Cyan (#22D3EE dark, #0891B2 light)
- Border radius: sm=6px, DEFAULT=8px, md=12px, lg=16px
- Font: Plus Jakarta Sans
- Transitions: 150ms default

## Component Specifications

### cn.ts Utility
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### ThemeContext
```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme
    return stored || 'dark' // Dark mode default
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const applyTheme = (resolved: 'light' | 'dark') => {
      setResolvedTheme(resolved)
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    if (theme === 'system') {
      const systemTheme = getSystemTheme()
      applyTheme(systemTheme)
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

### Button Component
```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover',
      secondary: 'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
      ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
      danger: 'bg-danger text-white hover:opacity-90',
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-sm',
      md: 'px-4 py-2 text-sm rounded-sm',
      lg: 'px-6 py-3 text-base rounded',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
```

### Input Component
```typescript
// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3 py-2 bg-[var(--bg-card)] border rounded-sm text-[var(--text-primary)]',
              'placeholder-[var(--text-muted)] transition-colors duration-150',
              'focus:outline-none focus:ring-1',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error 
                ? 'border-danger focus:border-danger focus:ring-danger/30' 
                : 'border-[var(--border)] focus:border-accent focus:ring-accent/30',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
```

### Card Component
```typescript
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = 'md', children, ...props }, ref) => {
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-[var(--bg-card)] border border-[var(--border)] rounded-md',
          paddingStyles[padding],
          hover && 'hover:border-accent/50 hover:shadow-lg transition-all duration-150 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
export type { CardProps }
```

### Badge Component
```typescript
// src/components/ui/Badge.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'muted' | 'accent'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'muted', children, ...props }, ref) => {
    const variants = {
      success: 'bg-success-muted text-success',
      warning: 'bg-warning-muted text-warning',
      danger: 'bg-danger-muted text-danger',
      muted: 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
      accent: 'bg-accent-muted text-accent',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-success',
          variant === 'warning' && 'bg-warning',
          variant === 'danger' && 'bg-danger animate-pulse',
          variant === 'muted' && 'bg-[var(--text-muted)]',
          variant === 'accent' && 'bg-accent',
        )} />
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }
```

### Modal Component
```typescript
// src/components/ui/Modal.tsx
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className={cn(
          'relative w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl',
          'animate-in fade-in slide-in-from-bottom-4 duration-200',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5">
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Select Component
```typescript
// src/components/ui/Select.tsx
import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 bg-[var(--bg-card)] border rounded-sm text-[var(--text-primary)]',
            'transition-colors duration-150 focus:outline-none focus:ring-1',
            error 
              ? 'border-danger focus:border-danger focus:ring-danger/30' 
              : 'border-[var(--border)] focus:border-accent focus:ring-accent/30',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-danger">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps }
```

### DropdownMenu Components
```typescript
// src/components/ui/DropdownMenu.tsx
import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'
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

export function DropdownMenuTrigger({ children }: { children: ReactNode }) {
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

  return (
    <div ref={ref} onClick={() => context.setOpen(!context.open)}>
      {children}
    </div>
  )
}

export function DropdownMenuContent({ children, align = 'end' }: { children: ReactNode; align?: 'start' | 'end' }) {
  const context = useContext(DropdownMenuContext)!
  
  if (!context.open) return null

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[8rem] bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg py-1',
        'animate-in fade-in slide-in-from-top-2 duration-150',
        align === 'end' ? 'right-0' : 'left-0'
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 py-1.5 text-sm font-medium">{children}</div>
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-[var(--border)] my-1" />
}

export function DropdownMenuItem({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
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
```

### AuthContext (Enhanced from Task 1 stub)
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface User {
  id: string
  username: string
  email: string
  fullName?: string
  role: 'ADMIN' | 'USER'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    const { token: newToken, user: newUser } = response.data
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    
    setToken(newToken)
    setUser(newUser)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export api for use in services
export { api }
```

## Verification
After creating all files:
1. Run `npm run dev` to verify no TypeScript errors
2. Check that theme toggle works (dark/light mode)
3. Check that all components render properly

## Commit
```bash
git add src/contexts/ src/components/ui/ src/utils/
git commit -m "feat: add ThemeContext, AuthContext, and base UI components"
```
