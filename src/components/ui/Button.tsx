import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'button inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'button-primary focus:ring-primary/50',
      secondary: 'button-secondary focus:ring-primary/50',
      outline: 'border-2 border-border-medium text-text-primary hover:border-primary hover:text-primary focus:ring-primary/50',
    }
    
    const sizes = {
      sm: 'text-sm px-3 py-2',
      md: 'text-base px-6 py-3',
      lg: 'text-lg px-8 py-4',
    }
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }