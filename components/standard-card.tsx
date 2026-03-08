"use client"

import { cn } from "@/lib/utils"
import { paddingVariants, spacing } from "@/lib/component-styles"

interface StandardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof paddingVariants
  children: React.ReactNode
}

export const StandardCard = ({
  padding = "comfortable",
  className,
  children,
  ...props
}: StandardCardProps) => {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg",
        paddingVariants[padding],
        "hover:shadow-md transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface StandardCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const StandardCardHeader = ({
  title,
  subtitle,
  action,
  className,
}: StandardCardHeaderProps) => {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-4", className)}>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
