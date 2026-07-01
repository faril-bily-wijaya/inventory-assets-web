import { type HTMLAttributes, forwardRef } from 'react'
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
          hover && 'hover:border-cyan-500/50 hover:shadow-lg transition-all duration-150 cursor-pointer',
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
