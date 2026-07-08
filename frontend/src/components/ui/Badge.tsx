import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'muted' | 'accent' | 'info'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'muted', children, ...props }, ref) => {
    const variants = {
      success: 'badge-success',
      warning: 'badge-warning',
      danger: 'badge-danger',
      muted: 'badge-muted',
      accent: 'badge bg-blue-500/15 text-blue-400',
      info: 'badge bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'badge',
          variants[variant],
          className
        )}
        {...props}
      >
        <span className={cn(
          'w-1.5 h-1.5 rounded-full shadow-sm',
          variant === 'success' && 'marker-active bg-emerald-400',
          variant === 'warning' && 'marker-warning bg-amber-400',
          variant === 'danger' && 'marker-critical bg-red-400',
          variant === 'muted' && 'bg-slate-400',
          variant === 'accent' && 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
          variant === 'info' && 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]',
        )} />
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }
