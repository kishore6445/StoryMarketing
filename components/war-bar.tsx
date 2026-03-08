"use client"

import { cn } from "@/lib/utils"

interface WarBarProps {
  pkr: number
  trend: number
  atRisk: number
  overdue: number
  momentum?: number
  streak?: number
  target?: number
}

export function WarBar({ pkr, trend, atRisk, overdue, target = 90 }: WarBarProps) {
  const trendIsPositive = trend >= 0
  const hasUrgency = overdue > 0

  return (
    <div className={cn(
      "px-0 py-5 border-b bg-white",
      "border-[#E5E7EB]"
    )}>
      <div className="flex items-center justify-start gap-8">
        {/* PKR Number - 28px / 700 weight */}
        <div className="flex items-baseline gap-2">
          <span className="text-7xl font-black text-[#111111] leading-none tracking-tight" style={{ fontSize: "28px" }}>
            {pkr}%
          </span>
          {/* Trend - 14px / 600 */}
          <div className="text-sm font-semibold text-red-600 leading-tight">
            {trendIsPositive ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        </div>

        {/* Target text - 12px / 500 */}
        <span className="text-xs font-medium text-[#6B7280]">
          Target {target}%
        </span>

        {/* Overdue - 12px / 600 */}
        {hasUrgency && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-xs font-semibold text-[#DC2626]">
              {overdue} OVERDUE
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
