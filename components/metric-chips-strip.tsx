"use client"

import { TrendingUp, AlertCircle, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricChipsProps {
  individualPKR: number
  tasksAtRisk: number
}

export function MetricChipsStrip({ individualPKR, tasksAtRisk }: MetricChipsProps) {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (percentage >= 80) return "bg-amber-50 text-amber-700 border-amber-200"
    return "bg-red-50 text-red-700 border-red-200"
  }

  return (
    <div className="sticky top-16 z-20 bg-white py-2 border-b border-[#E5E5E7] flex items-center gap-2 overflow-x-auto">
      {/* Individual PKR - Primary Metric */}
      <div className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap flex items-center gap-2 flex-shrink-0",
        getStatusColor(individualPKR)
      )}>
        <span className="w-2 h-2 rounded-full bg-current opacity-70" />
        Your PKR: {individualPKR}%
      </div>

      {/* Tasks at Risk */}
      {tasksAtRisk > 0 && (
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold border border-red-200 bg-red-50 text-red-700 whitespace-nowrap flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="w-3 h-3" />
          {tasksAtRisk} at risk
        </div>
      )}

      {/* Target Status */}
      <div className="px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 whitespace-nowrap flex items-center gap-2 flex-shrink-0">
        <Target className="w-3 h-3" />
        Target: 90%+
      </div>

      {/* Trend Indicator */}
      <div className="px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 whitespace-nowrap flex items-center gap-2 flex-shrink-0">
        <TrendingUp className="w-3 h-3" />
        +2.1% this sprint
      </div>
    </div>
  )
}
