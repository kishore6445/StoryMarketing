"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ComprehensivePKR } from "@/lib/pkr-calculator"
import { getPKRBadge, formatBufferTime } from "@/lib/pkr-calculator"

interface PKRMetricsDisplayProps {
  clientId?: string
  sprintId?: string
  userId?: string
  className?: string
}

export function PKRMetricsDisplay({ clientId, sprintId, userId, className }: PKRMetricsDisplayProps) {
  const [pkrData, setPkrData] = useState<ComprehensivePKR | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPKR()
  }, [clientId, sprintId, userId])

  const fetchPKR = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (clientId) params.append('clientId', clientId)
      if (sprintId) params.append('sprintId', sprintId)
      if (userId) params.append('userId', userId)
      params.append('type', 'comprehensive')

      const response = await fetch(`/api/pkr/calculate?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch PKR data')
      }

      const data = await response.json()
      setPkrData(data.pkr)
    } catch (err) {
      console.error('[v0] Error fetching PKR:', err)
      setError('Failed to load PKR metrics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("bg-white border border-[#E5E5E7] rounded-xl p-6 animate-pulse", className)}>
        <div className="h-6 bg-[#F5F5F7] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-[#F5F5F7] rounded"></div>
          <div className="h-4 bg-[#F5F5F7] rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error || !pkrData) {
    return (
      <div className={cn("bg-white border border-[#E5E5E7] rounded-xl p-6", className)}>
        <div className="flex items-center gap-2 text-[#86868B]">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error || 'No PKR data available'}</p>
        </div>
      </div>
    )
  }

  const internalBadge = getPKRBadge(pkrData.internal.pkr)
  const externalBadge = getPKRBadge(pkrData.external.pkr)
  const commitmentBadge = getPKRBadge(pkrData.commitmentQuality)

  return (
    <div className={cn("bg-white border border-[#E5E5E7] rounded-xl p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1C1C1E]">PKR Performance</h3>
          <p className="text-sm text-[#86868B] mt-0.5">Promises Kept Ratio</p>
        </div>
        <button
          onClick={fetchPKR}
          className="px-3 py-1.5 text-xs font-medium text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Internal PKR */}
      <div className="bg-[#F8F9FB] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#007AFF]"></div>
            <h4 className="text-sm font-semibold text-[#1C1C1E]">Internal Commitment</h4>
          </div>
          <span className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-md",
            internalBadge.level === 'elite' && "bg-emerald-100 text-emerald-700",
            internalBadge.level === 'good' && "bg-blue-100 text-blue-700",
            internalBadge.level === 'warning' && "bg-amber-100 text-amber-700",
            internalBadge.level === 'critical' && "bg-red-100 text-red-700"
          )}>
            {internalBadge.label}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#1C1C1E]">
            {pkrData.internal.pkr}%
          </span>
          <span className="text-sm text-[#86868B]">
            {pkrData.internal.onTime} of {pkrData.internal.total} on time
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[#86868B]">On Time:</span>
            <span className="font-semibold text-[#1C1C1E]">{pkrData.internal.onTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[#86868B]">Late:</span>
            <span className="font-semibold text-[#1C1C1E]">{pkrData.internal.late}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-[#86868B]">Overdue:</span>
            <span className="font-semibold text-[#1C1C1E]">{pkrData.internal.overdue}</span>
          </div>
        </div>
      </div>

      {/* External PKR */}
      <div className="bg-[#F0F9FF] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#34C759]"></div>
            <h4 className="text-sm font-semibold text-[#1C1C1E]">Client-Facing</h4>
          </div>
          <span className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-md",
            externalBadge.level === 'elite' && "bg-emerald-100 text-emerald-700",
            externalBadge.level === 'good' && "bg-blue-100 text-blue-700",
            externalBadge.level === 'warning' && "bg-amber-100 text-amber-700",
            externalBadge.level === 'critical' && "bg-red-100 text-red-700"
          )}>
            {externalBadge.label}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#1C1C1E]">
            {pkrData.external.pkr}%
          </span>
          <span className="text-sm text-[#86868B]">
            {pkrData.external.onTime} of {pkrData.external.total} delivered
          </span>
        </div>

        {pkrData.external.overdueToClient && pkrData.external.overdueToClient > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">
              {pkrData.external.overdueToClient} promise{pkrData.external.overdueToClient !== 1 ? 's' : ''} broken to client
            </span>
          </div>
        )}
      </div>

      {/* Commitment Quality Score */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#9370DB]" />
            <h4 className="text-sm font-semibold text-[#1C1C1E]">Commitment Quality</h4>
          </div>
          <span className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-md",
            commitmentBadge.level === 'elite' && "bg-emerald-100 text-emerald-700",
            commitmentBadge.level === 'good' && "bg-blue-100 text-blue-700",
            commitmentBadge.level === 'warning' && "bg-amber-100 text-amber-700",
            commitmentBadge.level === 'critical' && "bg-red-100 text-red-700"
          )}>
            {commitmentBadge.label}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#1C1C1E]">
            {pkrData.commitmentQuality}%
          </span>
        </div>

        <p className="text-xs text-[#86868B] leading-relaxed">
          {pkrData.commitmentQuality >= 90 
            ? "Excellent! Almost no rushed work after internal deadlines."
            : pkrData.commitmentQuality >= 80
            ? "Good commitment management with acceptable buffer usage."
            : pkrData.commitmentQuality >= 70
            ? "Warning: Frequent use of buffer time between internal and client deadlines."
            : "Critical: Too many rushed completions. Review deadline estimation."}
        </p>
      </div>

      {/* Buffer Analysis */}
      {pkrData.bufferAnalysis.averageBufferHours > 0 && (
        <div className="border-t border-[#E5E5E7] pt-4 space-y-2">
          <h4 className="text-xs font-semibold text-[#86868B] uppercase tracking-wide">Buffer Time Analysis</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F5F5F7] rounded-lg p-3">
              <p className="text-xs text-[#86868B] mb-1">Average Buffer</p>
              <p className="text-sm font-semibold text-[#1C1C1E]">
                {formatBufferTime(pkrData.bufferAnalysis.averageBufferHours)}
              </p>
            </div>
            <div className="bg-[#F5F5F7] rounded-lg p-3">
              <p className="text-xs text-[#86868B] mb-1">Largest Buffer</p>
              <p className="text-sm font-semibold text-[#1C1C1E]">
                {pkrData.bufferAnalysis.largestBufferDays} days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
