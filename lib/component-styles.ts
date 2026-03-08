/**
 * Standardized Component Styles
 * Ensures consistency across the application following Jobs & Ive principles
 */

import { cn } from "./utils"

// Button Sizes - 3 standardized sizes only
export const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

// Button Variants - Primary, Secondary, Ghost
export const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 font-medium transition-colors",
  accent:
    "bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-colors",
  ghost:
    "text-foreground hover:bg-muted transition-colors",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors",
}

// Card Styles - Standardized card appearance
export const cardStyles = {
  base: "bg-card border border-border rounded-lg",
  padding: "p-6",
  hover: "hover:shadow-md transition-shadow",
}

// Spacing - 4px grid system
export const spacing = {
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
}

export const paddingVariants = {
  compact: "p-3",
  normal: "p-4",
  comfortable: "p-6",
  spacious: "p-8",
}

// Typography - 3 sizes only
export const typography = {
  h1: "text-4xl font-semibold tracking-tight",
  h2: "text-2xl font-semibold",
  h3: "text-lg font-semibold",
  body: "text-base",
  small: "text-sm",
  xs: "text-xs",
}

// Input Styles
export const inputStyles = {
  base: "bg-input border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
}

// Badge Styles
export const badgeVariants = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-foreground",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
}

// Create helper functions for consistent component construction
export function createButton(
  variant: keyof typeof buttonVariants = "primary",
  size: keyof typeof buttonSizes = "md"
) {
  return cn(
    "rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center justify-center",
    buttonVariants[variant],
    buttonSizes[size]
  )
}

export function createCard(padding: keyof typeof paddingVariants = "comfortable") {
  return cn(cardStyles.base, paddingVariants[padding], cardStyles.hover)
}

export function createBadge(variant: keyof typeof badgeVariants = "default") {
  return cn("px-2.5 py-0.5 rounded text-xs font-semibold", badgeVariants[variant])
}
