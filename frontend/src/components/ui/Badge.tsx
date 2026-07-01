import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'muted' | 'accent'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'muted', children, ...props }, ref) => {
    const variants = {
      success: 'bg-emerald-500/15 text-emerald-400',
      warning: 'bg-amber-500/15 text-amber-400',
      danger: 'bg-red-500/15 text-red-400',
      muted: 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
      accent: 'bg-cyan-500/15 text-cyan-400',
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
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-red-400 animate-pulse',
          variant === 'muted' && 'bg-[var(--text-muted)]',
          variant === 'accent' && 'bg-cyan-400',
        )} />
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }
