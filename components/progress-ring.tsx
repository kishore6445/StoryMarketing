"use client"

import { cn } from "@/lib/utils"

interface ProgressRingProps {
  pkr: number
  target?: number
  momentum?: number
  trend?: number
}

export function ProgressRing({ pkr, target = 90, momentum = 0, trend = 0 }: ProgressRingProps) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pkr / 100) * circumference
  
  const isPKRHealthy = pkr >= target
  const trendIsPositive = trend >= 0

  // Determine gradient colors based on PKR health
  const getGradientId = () => {
    if (isPKRHealthy) return "gradient-healthy"
    if (pkr >= 80) return "gradient-warning"
    return "gradient-critical"
  }

  return (
    <div className="flex items-center gap-4">
      {/* Animated Progress Ring */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="gradient-healthy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="gradient-critical" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {/* Animated progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: isPKRHealthy ? "drop-shadow(0 0 8px rgba(5, 150, 105, 0.3))" : "none"
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn(
            "text-xl font-black",
            isPKRHealthy ? "text-emerald-600" : pkr >= 80 ? "text-amber-600" : "text-red-600"
          )}>
            {pkr}%
          </div>
          <div className="text-[10px] text-[#86868B] font-semibold">PKR</div>
        </div>
      </div>

      {/* Metadata Column */}
      <div className="flex flex-col gap-2">
        {/* Momentum */}
        {momentum > 0 && (
          <div className="text-xs">
            <span className="font-black text-emerald-600">{momentum}</span>
            <span className="text-[#86868B] font-medium"> shipped today</span>
          </div>
        )}

        {/* Trend */}
        <div className="text-xs">
          <span className={cn(
            "font-black",
            trendIsPositive ? "text-emerald-600" : "text-red-600"
          )}>
            {trendIsPositive ? "↑" : "↓"}{Math.abs(trend)}%
          </span>
          <span className="text-[#86868B] font-medium"> vs yesterday</span>
        </div>

        {/* Target */}
        <div className="text-xs text-[#86868B] font-semibold">
          Target {target}%
        </div>
      </div>
    </div>
  )
}
