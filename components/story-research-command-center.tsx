"use client"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResearchMove {
  id: string
  title: string
  clientName: string
  dueDate: string
  impact: "high" | "medium" | "low"
  status: "define" | "clarifying" | "validating" | "locked"
}

interface StoryResearchCommandCenterProps {
  moves?: ResearchMove[]
  isLoading?: boolean
  onAddMove?: () => void
}

const columnConfig = {
  define: {
    title: "Define",
    borderColor: "border-t-[#007AFF]",
    description: "Initial research moves"
  },
  clarifying: {
    title: "Clarifying",
    borderColor: "border-t-[#5856D6]",
    description: "In progress"
  },
  validating: {
    title: "Validating",
    borderColor: "border-t-[#FF9500]",
    description: "Awaiting validation"
  },
  locked: {
    title: "Locked",
    borderColor: "border-t-[#34C759]",
    description: "Completed research"
  }
}

const impactConfig = {
  high: { bg: "bg-[#FFE5E5]", text: "text-[#C80000]", label: "High" },
  medium: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Medium" },
  low: { bg: "bg-[#F0F0F0]", text: "text-[#666666]", label: "Low" }
}

export function StoryResearchCommandCenter({
  moves = [],
  isLoading = false,
  onAddMove
}: StoryResearchCommandCenterProps) {
  // Group moves by status
  const movesByStatus = {
    define: moves.filter(m => m.status === "define"),
    clarifying: moves.filter(m => m.status === "clarifying"),
    validating: moves.filter(m => m.status === "validating"),
    locked: moves.filter(m => m.status === "locked")
  }

  // Calculate completion percentage
  const totalMoves = moves.length || 5
  const completedMoves = movesByStatus.locked.length
  const completionPercent = totalMoves > 0 ? Math.round((completedMoves / totalMoves) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E3F2FD]">
              <span className="text-sm font-semibold text-[#007AFF]">🎯</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-[#111111] mb-2">Research Mission</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest">Objective</p>
                <p className="text-sm text-[#374151] leading-relaxed">Define hero, core problem, and positioning before creation.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest mt-3">Success Criteria</p>
                <ul className="text-sm text-[#374151] space-y-1 mt-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Clear hero persona defined</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Painful problem articulated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Unique positioning statement drafted</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Completion Indicator */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Research Completion</p>
            <p className="text-2xl font-black text-[#111111] mt-1">{completionPercent}%</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{completedMoves} of {totalMoves || 5} key research moves</p>
          </div>
        </div>
        <div className="w-full h-1 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#007AFF] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Strategic Research Moves Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest px-1">Strategic Research Moves</h2>
        
        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(columnConfig) as Array<keyof typeof columnConfig>).map((status) => {
            const config = columnConfig[status]
            const statusMoves = movesByStatus[status]
            
            return (
              <div
                key={status}
                className={cn(
                  "flex flex-col rounded-lg border border-[#E5E5E7] bg-white overflow-hidden"
                )}
              >
                {/* Column Header */}
                <div className={cn(
                  "border-t-2 px-4 py-3 bg-white",
                  config.borderColor
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-xs uppercase text-[#6B7280] tracking-widest leading-none">
                        {config.title}
                      </h3>
                      <p className="text-xs text-[#9CA3AF] mt-1">{statusMoves.length}</p>
                    </div>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-3 space-y-3 min-h-[200px]">
                  {statusMoves.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center py-6">
                      <div className="space-y-2">
                        <p className="text-xs text-[#9CA3AF]">
                          {status === "define" ? "No research moves defined." : "Move something forward."}
                        </p>
                        {status === "define" && (
                          <div className="text-[10px] text-[#6B7280] space-y-1">
                            <p className="font-medium">Start by clarifying:</p>
                            <ul className="space-y-0.5 text-left inline-block">
                              <li>• Who is the hero?</li>
                              <li>• What painful problem?</li>
                              <li>• What belief must change?</li>
                            </ul>
                          </div>
                        )}
                        {status === "define" && onAddMove && (
                          <button
                            onClick={onAddMove}
                            className="mt-3 text-xs text-[#007AFF] hover:text-[#0051D5] font-medium flex items-center justify-center gap-1 w-full"
                          >
                            <Plus className="w-3 h-3" />
                            Add First Strategic Move
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    statusMoves.map((move) => (
                      <div
                        key={move.id}
                        className="p-3 rounded-lg border border-[#E5E5E7] bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all group cursor-pointer"
                      >
                        {/* Card Header with Impact Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-[#111111] leading-snug line-clamp-2 flex-1">
                            {move.title}
                          </h4>
                          <span className={cn(
                            "flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
                            impactConfig[move.impact].bg,
                            impactConfig[move.impact].text
                          )}>
                            {impactConfig[move.impact].label}
                          </span>
                        </div>

                        {/* Client Name */}
                        <p className="text-xs text-[#9CA3AF] mb-2 truncate">
                          {move.clientName}
                        </p>

                        {/* Due Date */}
                        {move.dueDate && (
                          <p className="text-xs text-[#6B7280]">
                            Due: {new Date(move.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#86868B] text-sm">Loading research moves...</div>
        </div>
      )}
    </div>
  )
}
