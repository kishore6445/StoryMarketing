"use client"

import { cn } from "@/lib/utils"

interface CriticalZoneBannerProps {
  tasksDueToday: number
  overdueCount: number
}

export function CriticalZoneBanner({ tasksDueToday, overdueCount }: CriticalZoneBannerProps) {
  if (tasksDueToday === 0 && overdueCount === 0) return null

  const criticalCount = overdueCount + tasksDueToday

  return (
    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 transition-all rounded border-l-4 border-red-700 text-white text-left font-black text-sm leading-tight">
      CRITICAL: {criticalCount} TASK{criticalCount !== 1 ? "S" : ""} • SHIP FASTER
    </button>
  )
}
