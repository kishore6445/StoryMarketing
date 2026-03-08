"use client"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DesignMove {
  id: string
  title: string
  clientName: string
  dueDate: string
  assetType: "graphics" | "video" | "templates" | "guidelines"
  status: "planning" | "design" | "review" | "approved"
}

interface StoryDesignCommandCenterProps {
  moves?: DesignMove[]
  isLoading?: boolean
  onAddMove?: () => void
}

const columnConfig = {
  planning: {
    title: "Planning",
    borderColor: "border-t-[#8E8E93]",
    description: "Initial concepts"
  },
  design: {
    title: "Design",
    borderColor: "border-t-[#007AFF]",
    description: "Active design work"
  },
  review: {
    title: "Review",
    borderColor: "border-t-[#FF9500]",
    description: "Client approval"
  },
  approved: {
    title: "Approved",
    borderColor: "border-t-[#34C759]",
    description: "Final assets"
  }
}

const assetConfig = {
  graphics: { bg: "bg-[#E8F4FD]", text: "text-[#0051D5]", label: "Graphics" },
  video: { bg: "bg-[#F3E5FF]", text: "text-[#6A1B9A]", label: "Video" },
  templates: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Templates" },
  guidelines: { bg: "bg-[#F0F4FF]", text: "text-[#283593]", label: "Guidelines" }
}

export function StoryDesignCommandCenter({
  moves = [],
  isLoading = false,
  onAddMove
}: StoryDesignCommandCenterProps) {
  // Group moves by status
  const movesByStatus = {
    planning: moves.filter(m => m.status === "planning"),
    design: moves.filter(m => m.status === "design"),
    review: moves.filter(m => m.status === "review"),
    approved: moves.filter(m => m.status === "approved")
  }

  // Calculate completion percentage
  const totalMoves = moves.length || 4
  const approvedMoves = movesByStatus.approved.length
  const completionPercent = totalMoves > 0 ? Math.round((approvedMoves / totalMoves) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF3E0]">
              <span className="text-sm font-semibold text-[#E65100]">🎨</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Design Mission</h3>
            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">Create a comprehensive visual system that reflects the brand identity and ensures consistent application across all touchpoints.</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-start gap-1.5 text-xs text-[#515154]">
                <span className="text-[#6B7280] font-medium">✓</span>
                <span>Design system + brand guidelines</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-[#515154]">
                <span className="text-[#6B7280] font-medium">✓</span>
                <span>Graphics and marketing materials</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-[#515154]">
                <span className="text-[#6B7280] font-medium">✓</span>
                <span>Video assets and templates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Design Completion Indicator */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Design Completion</h3>
          <span className="text-sm font-bold text-[#1D1D1F]">{completionPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF9500] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-xs text-[#6B7280] mt-2">{approvedMoves} of {totalMoves} design assets approved</p>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 w-full py-0">
          {Object.entries(columnConfig).map(([status, config]) => {
            const statusMoves = movesByStatus[status as keyof typeof movesByStatus]
            const isEmptyColumn = statusMoves.length === 0

            return (
              <div
                key={status}
                className="flex-1 min-w-[280px] max-w-[300px] flex flex-col"
              >
                {/* Column Header */}
                <div className={cn(
                  "px-4 py-2.5 flex items-center justify-between border-b border-t-2",
                  "border-[#E5E5E7]",
                  config.borderColor,
                  "bg-white"
                )}>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold text-xs uppercase text-[#6B7280] tracking-widest leading-none">
                      {config.title}
                    </h3>
                    <span className="text-xs font-normal text-[#9CA3AF]">{statusMoves.length}</span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto">
                  {isEmptyColumn ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        {status === 'planning' ? 'Start by planning your design assets here.' : 'No assets yet.'}
                      </p>
                      {status === 'planning' && (
                        <button
                          onClick={onAddMove}
                          className="mt-3 text-xs font-medium text-[#007AFF] hover:text-[#0051D5] flex items-center justify-center gap-1 w-full"
                        >
                          <Plus className="w-3 h-3" />
                          Add Design Asset
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 p-3">
                      {statusMoves.map(move => {
                        const assetInfo = assetConfig[move.assetType]
                        const dueDate = new Date(move.dueDate)
                        const isOverdue = dueDate < new Date() && status !== 'approved'
                        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

                        return (
                          <div
                            key={move.id}
                            className="p-3 rounded-lg border border-[#E5E7EB] bg-white hover:shadow-sm hover:border-[#D1D5DB] transition-all cursor-pointer group"
                          >
                            {/* Asset Type Badge */}
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold mb-2",
                              assetInfo.bg,
                              assetInfo.text
                            )}>
                              {assetInfo.label}
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-medium text-[#1D1D1F] leading-tight mb-1 line-clamp-2">
                              {move.title}
                            </h4>

                            {/* Client Name */}
                            <p className="text-xs text-[#6B7280] mb-2 truncate">
                              {move.clientName}
                            </p>

                            {/* Due Date & Status */}
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-[11px] font-medium",
                                isOverdue ? "text-red-600" : "text-[#6B7280]"
                              )}>
                                {isOverdue ? (
                                  <span className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Overdue
                                  </span>
                                ) : daysUntilDue <= 3 && daysUntilDue > 0 ? (
                                  `${daysUntilDue}d left`
                                ) : (
                                  dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                )}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Design Guidelines Panel */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Design Guidelines</h3>
        <div className="space-y-2 text-sm text-[#515154]">
          <div className="flex gap-3">
            <span className="text-[#6B7280] font-semibold flex-shrink-0">Color:</span>
            <span>Primary blue (#007AFF), supports, neutrals. Ensure accessible contrast ratios.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[#6B7280] font-semibold flex-shrink-0">Typography:</span>
            <span>Geist Sans for headers/body. Font sizes 12px min for readability.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[#6B7280] font-semibold flex-shrink-0">Spacing:</span>
            <span>4px grid system. Use multiples for consistent rhythm throughout.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
