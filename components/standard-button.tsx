"use client"

import { cn } from "@/lib/utils"
import { buttonVariants, buttonSizes } from "@/lib/component-styles"

interface StandardButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  isLoading?: boolean
}

export const StandardButton = ({
  variant = "primary",
  size = "md",
  className,
  disabled,
  isLoading,
  children,
  ...props
}: StandardButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2",
        buttonVariants[variant],
        buttonSizes[size],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  )
}
