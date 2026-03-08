"use client"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface WritingMove {
  id: string
  title: string
  clientName: string
  dueDate: string
  priority: "high" | "medium" | "low"
  status: "outline" | "writing" | "editing" | "published"
}

interface StoryWritingCommandCenterProps {
  moves?: WritingMove[]
  isLoading?: boolean
  onAddMove?: () => void
}

const columnConfig = {
  outline: {
    title: "Outline",
    borderColor: "border-t-[#007AFF]",
    description: "Planning phase"
  },
  writing: {
    title: "Writing",
    borderColor: "border-t-[#5856D6]",
    description: "In progress"
  },
  editing: {
    title: "Editing",
    borderColor: "border-t-[#FF9500]",
    description: "Review & refinement"
  },
  published: {
    title: "Published",
    borderColor: "border-t-[#34C759]",
    description: "Live content"
  }
}

const priorityConfig = {
  high: { bg: "bg-[#FFE5E5]", text: "text-[#C80000]", label: "High" },
  medium: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Medium" },
  low: { bg: "bg-[#F0F0F0]", text: "text-[#666666]", label: "Low" }
}

export function StoryWritingCommandCenter({
  moves = [],
  isLoading = false,
  onAddMove
}: StoryWritingCommandCenterProps) {
  // Group moves by status
  const movesByStatus = {
    outline: moves.filter(m => m.status === "outline"),
    writing: moves.filter(m => m.status === "writing"),
    editing: moves.filter(m => m.status === "editing"),
    published: moves.filter(m => m.status === "published")
  }

  // Calculate completion percentage
  const totalMoves = moves.length || 4
  const publishedMoves = movesByStatus.published.length
  const completionPercent = totalMoves > 0 ? Math.round((publishedMoves / totalMoves) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E3F2FD]">
              <span className="text-sm font-semibold text-[#007AFF]">✍</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-[#111111] mb-2">Writing Mission</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest">Objective</p>
                <p className="text-sm text-[#374151] leading-relaxed">Create compelling content that resonates with the audience and drives engagement.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest mt-3">Success Criteria</p>
                <ul className="text-sm text-[#374151] space-y-1 mt-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Clear outline with key messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Compelling draft content created</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Edited and polished for publication</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Writing Progress Indicator */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Writing Completion</p>
          <p className="text-sm font-bold text-[#111111]">{completionPercent}%</p>
        </div>
        <div className="w-full h-1.5 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#007AFF] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-xs text-[#9CA3AF] mt-2">{publishedMoves} of {totalMoves} pieces published</p>
      </div>

      {/* Writing Moves Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Object.entries(columnConfig).map(([statusKey, config]) => {
          const statusMoves = movesByStatus[statusKey as keyof typeof movesByStatus]
          const isEmpty = statusMoves.length === 0

          return (
            <div key={statusKey} className="flex-1 min-w-[280px] flex flex-col bg-white rounded-lg border border-[#E5E5E7] overflow-hidden">
              {/* Column Header */}
              <div className={cn(
                "px-4 py-2.5 flex items-center justify-between border-t-2",
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

              {/* Column Content */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {isEmpty ? (
                  <div className="flex items-center justify-center py-12 text-center">
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-2">No content yet</p>
                      {statusKey === "outline" && (
                        <button
                          onClick={onAddMove}
                          className="text-xs text-[#007AFF] hover:text-[#0051D5] font-medium flex items-center gap-1 justify-center mx-auto"
                        >
                          <Plus className="w-3 h-3" />
                          Add First Piece
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  statusMoves.map((move) => {
                    const dueDate = new Date(move.dueDate)
                    const today = new Date()
                    const isOverdue = dueDate < today && move.status !== "published"
                    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                      <div
                        key={move.id}
                        className="p-3 rounded-lg border border-[#E5E7EB] bg-white hover:shadow-sm hover:border-[#D1D5DB] transition-all cursor-pointer group"
                      >
                        {/* Title */}
                        <p className="text-sm font-medium text-[#111111] line-clamp-2 mb-2">
                          {move.title}
                        </p>

                        {/* Client Name */}
                        <p className="text-xs text-[#9CA3AF] mb-2">
                          {move.clientName}
                        </p>

                        {/* Priority & Due Date */}
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                            priorityConfig[move.priority].bg,
                            priorityConfig[move.priority].text
                          )}>
                            {priorityConfig[move.priority].label}
                          </span>
                          <span className={cn(
                            "text-[10px] font-medium",
                            isOverdue ? "text-red-600" : daysUntilDue <= 3 ? "text-[#FF9500]" : "text-[#6B7280]"
                          )}>
                            {isOverdue ? "Overdue" : daysUntilDue <= 0 ? "Today" : `${daysUntilDue}d`}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Guidelines */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <h3 className="font-semibold text-sm text-[#111111] mb-3">Writing Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest mb-1.5">Tone</p>
            <p className="text-sm text-[#374151]">Authoritative, clear, and conversational</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest mb-1.5">Audience</p>
            <p className="text-sm text-[#374151]">Decision-makers and industry professionals</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest mb-1.5">Format</p>
            <p className="text-sm text-[#374151]">Blog posts, LinkedIn articles, emails</p>
          </div>
        </div>
      </div>
    </div>
  )
}
