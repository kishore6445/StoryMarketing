"use client"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoMove {
  id: string
  title: string
  clientName: string
  dueDate: string
  videoType: "hero" | "testimonial" | "tutorial" | "explainer"
  status: "concept" | "production" | "editing" | "final"
}

interface StoryVideoCommandCenterProps {
  moves?: VideoMove[]
  isLoading?: boolean
  onAddMove?: () => void
}

const columnConfig = {
  concept: {
    title: "Concept",
    borderColor: "border-t-[#8E8E93]",
    description: "Planning phase"
  },
  production: {
    title: "Production",
    borderColor: "border-t-[#5856D6]",
    description: "Recording & capture"
  },
  editing: {
    title: "Editing",
    borderColor: "border-t-[#FF9500]",
    description: "Post-production"
  },
  final: {
    title: "Final",
    borderColor: "border-t-[#34C759]",
    description: "Ready to deploy"
  }
}

const videoTypeConfig = {
  hero: { bg: "bg-[#FFE5E5]", text: "text-[#C80000]", label: "Hero" },
  testimonial: { bg: "bg-[#E8F5E9]", text: "text-[#1B5E20]", label: "Testimonial" },
  tutorial: { bg: "bg-[#F3E5FF]", text: "text-[#6A1B9A]", label: "Tutorial" },
  explainer: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Explainer" }
}

export function StoryVideoCommandCenter({
  moves = [],
  isLoading = false,
  onAddMove
}: StoryVideoCommandCenterProps) {
  // Group moves by status
  const movesByStatus = {
    concept: moves.filter(m => m.status === "concept"),
    production: moves.filter(m => m.status === "production"),
    editing: moves.filter(m => m.status === "editing"),
    final: moves.filter(m => m.status === "final")
  }

  // Calculate completion percentage
  const totalMoves = moves.length || 4
  const finalMoves = movesByStatus.final.length
  const completionPercent = totalMoves > 0 ? Math.round((finalMoves / totalMoves) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3E5FF]">
              <span className="text-sm font-semibold text-[#6A1B9A]">🎬</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Video Production Mission</h3>
            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">Produce engaging video content that tells the brand story and drives audience engagement across platforms.</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-start gap-1.5 text-xs text-[#515154]">
                <span className="text-[#6B7280] font-medium">✓</span>
                <span>Hero & brand videos</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-[#515154]">
                <span className="text-[#6B7280] font-medium">✓</span>
                <span>Testimonials & case studies</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-[#515154]">
                <span className="text-[#6B7280] font-medium">✓</span>
                <span>Tutorials & explainers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Production Indicator */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Production Complete</h3>
          <span className="text-sm font-bold text-[#1D1D1F]">{completionPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5856D6] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-xs text-[#6B7280] mt-2">{finalMoves} of {totalMoves} videos finalized</p>
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
                        {status === 'concept' ? 'Plan your video assets here.' : 'No videos yet.'}
                      </p>
                      {status === 'concept' && (
                        <button
                          onClick={onAddMove}
                          className="mt-3 text-xs font-medium text-[#007AFF] hover:text-[#0051D5] flex items-center justify-center gap-1 w-full"
                        >
                          <Plus className="w-3 h-3" />
                          Add Video Project
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 p-3">
                      {statusMoves.map(move => {
                        const videoInfo = videoTypeConfig[move.videoType]
                        const dueDate = new Date(move.dueDate)
                        const isOverdue = dueDate < new Date() && status !== 'final'
                        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

                        return (
                          <div
                            key={move.id}
                            className="p-3 rounded-lg border border-[#E5E7EB] bg-white hover:shadow-sm hover:border-[#D1D5DB] transition-all cursor-pointer group"
                          >
                            {/* Video Type Badge */}
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold mb-2",
                              videoInfo.bg,
                              videoInfo.text
                            )}>
                              {videoInfo.label}
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

      {/* Video Production Guidelines */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Production Standards</h3>
        <div className="space-y-2 text-sm text-[#515154]">
          <div className="flex gap-3">
            <span className="text-[#6B7280] font-semibold flex-shrink-0">Format:</span>
            <span>16:9 HD minimum (1920x1080). Vertical versions for social media.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[#6B7280] font-semibold flex-shrink-0">Audio:</span>
            <span>Clear dialogue at -3dB. Music at -20dB. Include captions for accessibility.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[#6B7280] font-semibold flex-shrink-0">Branding:</span>
            <span>Consistent intro/outro sequences. Brand guidelines adherence required.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
