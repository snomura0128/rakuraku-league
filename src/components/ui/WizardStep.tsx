"use client"

import { cn } from "@/lib/utils"

interface WizardStepProps {
  title: string
  description?: string
  children: React.ReactNode
  isActive: boolean
  className?: string
}

export function WizardStep({ title, description, children, isActive, className }: WizardStepProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        {
          "opacity-100 translate-x-0": isActive,
          "opacity-0 translate-x-4 pointer-events-none absolute": !isActive,
        },
        className
      )}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-primary mb-2">{title}</h2>
        {description && <p className="text-text-secondary">{description}</p>}
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  )
}
