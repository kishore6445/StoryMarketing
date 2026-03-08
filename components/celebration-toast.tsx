"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface CelebrationToastProps {
  isVisible: boolean
  message: string
  type?: "shipped" | "milestone" | "streak"
}

export function CelebrationToast({ isVisible, message, type = "shipped" }: CelebrationToastProps) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
    if (isVisible) {
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!show) return null

  const getStyles = () => {
    switch (type) {
      case "milestone":
        return {
          bg: "from-purple-500 to-pink-500",
          icon: "🎯",
        }
      case "streak":
        return {
          bg: "from-emerald-500 to-teal-500",
          icon: "🔥",
        }
      default:
        return {
          bg: "from-emerald-500 to-green-600",
          icon: "✓",
        }
    }
  }

  const styles = getStyles()

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className={cn(
        "px-4 py-3 rounded-lg text-white font-bold shadow-2xl",
        "bg-gradient-to-r",
        styles.bg,
        "flex items-center gap-3"
      )}>
        <span className="text-2xl">{styles.icon}</span>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}
