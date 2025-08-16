import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-primary ml-1">*</span>}
          </label>
        )}
        <input
          className={cn(
            'input',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }