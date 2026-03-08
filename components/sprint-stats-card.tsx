"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, AlertTriangle } from "lucide-react"

interface SprintStatsCardProps {
  label: string
  value: string | number
  subtext: string
  highlight?: boolean
  isWarning?: boolean
}

export function SprintStatsCard({ label, value, subtext, highlight, isWarning }: SprintStatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6 transition-all",
        highlight
          ? "bg-blue-50 border-blue-200 shadow-sm hover:shadow-md"
          : isWarning
            ? "bg-red-50 border-red-200 shadow-sm hover:shadow-md"
            : "bg-white border-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className={cn("text-sm font-medium", isWarning ? "text-red-700" : "text-gray-600")}>
          {label}
        </p>
        {highlight && <TrendingUp className="w-4 h-4 text-blue-600" />}
        {isWarning && <AlertTriangle className="w-4 h-4 text-red-600" />}
      </div>
      <p
        className={cn(
          "text-4xl font-bold mb-1",
          highlight ? "text-blue-900" : isWarning ? "text-red-900" : "text-gray-900"
        )}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  )
}
