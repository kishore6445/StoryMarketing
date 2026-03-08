"use client"

import { TrendingUp, AlertCircle, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlCenterProps {
  individualPKR: number
  tasksAtRisk: number
  missedTasks: number
  trend: number
}

export function ControlCenterDashboard({
  individualPKR,
  tasksAtRisk,
  missedTasks,
  trend,
}: ControlCenterProps) {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", indicator: "bg-emerald-500" }
    if (percentage >= 80) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", indicator: "bg-amber-500" }
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", indicator: "bg-red-500" }
  }

  const pkrColors = getStatusColor(individualPKR)
  const trendIsPositive = trend >= 0

  return (
    <div className="grid grid-cols-4 gap-2.5 sticky top-16 z-20 bg-white py-2.5 px-4 border-b border-[#E5E5E7]">
      {/* Primary: Your PKR */}
      <div className={cn(
        "px-3 py-2.5 rounded-lg border-2 flex flex-col gap-1.5",
        pkrColors.bg,
        pkrColors.border
      )}>
        <div className="flex items-center gap-1">
          <div className={cn("w-2.5 h-2.5 rounded-full", pkrColors.indicator)} />
          <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wide">Your PKR</span>
        </div>
        <div className={cn("text-2xl font-black", pkrColors.text)}>
          {individualPKR}%
        </div>
      </div>

      {/* Trend */}
      <div className="px-3 py-2.5 rounded-lg border-2 border-blue-200 bg-blue-50 flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <TrendingUp className={cn("w-3.5 h-3.5", trendIsPositive ? "text-emerald-600" : "text-red-600")} />
          <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wide">Trend</span>
        </div>
        <div className={cn("text-2xl font-black", trendIsPositive ? "text-emerald-700" : "text-red-700")}>
          {trendIsPositive ? "+" : ""}{trend}%
        </div>
      </div>

      {/* At Risk */}
      {tasksAtRisk > 0 && (
        <div className="px-3 py-2.5 rounded-lg border-2 border-amber-200 bg-amber-50 flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wide">At Risk</span>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {tasksAtRisk}
          </div>
        </div>
      )}

      {/* Target */}
      <div className="px-3 py-2.5 rounded-lg border-2 border-blue-200 bg-blue-50 flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wide">Target</span>
        </div>
        <div className="text-2xl font-black text-blue-700">
          90%+
        </div>
      </div>
    </div>
  )
}
