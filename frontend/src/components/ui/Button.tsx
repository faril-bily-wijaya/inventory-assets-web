import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm'

    const variants = {
      primary: 'bg-cyan-500 text-white hover:bg-cyan-600',
      secondary: 'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
      ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
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
