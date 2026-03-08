"use client"

import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SprintPKRSummaryProps {
  sprintName: string
  pkrPercentage: number
  totalPromises: number
  keptPromises: number
  atRiskPromises: number
  missedPromises: number
  previousPKR?: number
}

export function SprintPKRSummary({
  sprintName,
  pkrPercentage,
  totalPromises,
  keptPromises,
  atRiskPromises,
  missedPromises,
  previousPKR,
}: SprintPKRSummaryProps) {
  const trendUp = previousPKR !== undefined && pkrPercentage > previousPKR
  const trendDown = previousPKR !== undefined && pkrPercentage < previousPKR
  const pkrStatus = pkrPercentage >= 90 ? "elite" : pkrPercentage >= 80 ? "acceptable" : "correction"

  const getStatusColor = () => {
    if (pkrStatus === "elite") return "bg-green-50 border-green-200"
    if (pkrStatus === "acceptable") return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  const getPercentageColor = () => {
    if (pkrStatus === "elite") return "text-green-700"
    if (pkrStatus === "acceptable") return "text-amber-700"
    return "text-red-700"
  }

  return (
    <div className={cn("rounded-lg border p-4 space-y-4", getStatusColor())}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">PKR Score</p>
          <h3 className="text-sm font-semibold text-foreground">{sprintName}</h3>
        </div>
        {trendUp && <TrendingUp className="w-4 h-4 text-green-600" />}
        {trendDown && <TrendingDown className="w-4 h-4 text-red-600" />}
      </div>

      {/* Main PKR Percentage */}
      <div className="flex items-baseline gap-2">
        <span className={cn("text-3xl font-bold", getPercentageColor())}>{pkrPercentage}%</span>
        {previousPKR !== undefined && (
          <span className={cn("text-xs font-medium", trendUp ? "text-green-600" : trendDown ? "text-red-600" : "text-gray-600")}>
            {trendUp ? "+" : ""}{pkrPercentage - previousPKR}%
          </span>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-xs font-semibold px-2.5 py-1 rounded uppercase",
          pkrStatus === "elite" && "bg-green-100 text-green-700",
          pkrStatus === "acceptable" && "bg-amber-100 text-amber-700",
          pkrStatus === "correction" && "bg-red-100 text-red-700"
        )}>
          {pkrStatus === "elite" && "Elite"}
          {pkrStatus === "acceptable" && "Acceptable"}
          {pkrStatus === "correction" && "Correction Needed"}
        </span>
      </div>

      {/* Promise Breakdown */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-inherit">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Kept</p>
          <p className="text-lg font-bold text-green-600">{keptPromises}</p>
          <p className="text-xs text-muted-foreground">{Math.round((keptPromises / totalPromises) * 100)}%</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">At Risk</p>
          <p className="text-lg font-bold text-amber-600">{atRiskPromises}</p>
          <p className="text-xs text-muted-foreground">{Math.round((atRiskPromises / totalPromises) * 100)}%</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Missed</p>
          <p className="text-lg font-bold text-red-600">{missedPromises}</p>
          <p className="text-xs text-muted-foreground">{Math.round((missedPromises / totalPromises) * 100)}%</p>
        </div>
      </div>

      {/* Total Promises */}
      <div className="flex items-center justify-between pt-2 border-t border-inherit">
        <span className="text-xs font-medium text-muted-foreground">Total Promises</span>
        <span className="font-semibold text-foreground">{totalPromises}</span>
      </div>

      {/* Warning if correction needed */}
      {pkrStatus === "correction" && (
        <div className="flex items-start gap-2 p-2 bg-red-100/50 rounded border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium">PKR below target. Focus on commitment accuracy.</p>
        </div>
      )}
    </div>
  )
}
