"use client"

import { useState } from "react"
import { Plus, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface LearningItem {
  id: string
  title: string
  clientName: string
  category: "insight" | "decision" | "action"
  priority: "high" | "medium" | "low"
  status: "documented" | "implemented" | "reinforced" | "archived"
}

interface StoryLearningCommandCenterProps {
  items?: LearningItem[]
  isLoading?: boolean
  onAddItem?: () => void
}

const statusConfig = {
  documented: {
    title: "Documented",
    borderColor: "border-t-[#6B7280]",
    description: "Learning captured"
  },
  implemented: {
    title: "Implemented",
    borderColor: "border-t-[#007AFF]",
    description: "Applied to process"
  },
  reinforced: {
    title: "Reinforced",
    borderColor: "border-t-[#F97316]",
    description: "Repeated & tested"
  },
  archived: {
    title: "Archived",
    borderColor: "border-t-[#34C759]",
    description: "Knowledge base"
  }
}

const categoryColors = {
  insight: { bg: "bg-[#F3E8FF]", text: "text-[#6D28D9]", label: "Insight" },
  decision: { bg: "bg-[#DBEAFE]", text: "text-[#0369A1]", label: "Decision" },
  action: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", label: "Action" }
}

const priorityConfig = {
  high: { bg: "bg-[#FFE5E5]", text: "text-[#C80000]", label: "High" },
  medium: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Medium" },
  low: { bg: "bg-[#F0F0F0]", text: "text-[#666666]", label: "Low" }
}

export function StoryLearningCommandCenter({
  items = [],
  isLoading = false,
  onAddItem
}: StoryLearningCommandCenterProps) {
  // Group items by status
  const itemsByStatus = {
    documented: items.filter(i => i.status === "documented"),
    implemented: items.filter(i => i.status === "implemented"),
    reinforced: items.filter(i => i.status === "reinforced"),
    archived: items.filter(i => i.status === "archived")
  }

  // Calculate completion percentage
  const totalItems = items.length || 6
  const archivedItems = itemsByStatus.archived.length
  const completionPercent = totalItems > 0 ? Math.round((archivedItems / totalItems) * 100) : 0

  // Calculate category breakdown
  const insights = items.filter(i => i.category === "insight").length
  const decisions = items.filter(i => i.category === "decision").length
  const actions = items.filter(i => i.category === "action").length

  if (isLoading) {
    return <div className="py-12 text-center text-[#86868B]">Loading Story Learning data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0FDF4]">
              <span className="text-sm font-semibold text-[#34C759]">📚</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-[#111111] mb-2">Learning Mission</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest">Objective</p>
                <p className="text-sm text-[#374151] leading-relaxed">Convert data and experience into actionable knowledge for continuous improvement.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest mt-3">Success Criteria</p>
                <ul className="text-sm text-[#374151] space-y-1 mt-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>All key insights documented</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Learnings applied to next cycle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#34C759] font-bold mt-0.5">✓</span>
                    <span>Knowledge base updated</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Completion Indicator */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Learning Archival</p>
            <p className="text-2xl font-black text-[#111111] mt-1">{completionPercent}%</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{archivedItems} of {totalItems || 6} learnings archived</p>
          </div>
        </div>
        <div className="w-full h-1 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#34C759] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Learning Category Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Insights</p>
          <p className="text-2xl font-black text-[#111111]">{insights}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Key findings</p>
        </div>
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Decisions</p>
          <p className="text-2xl font-black text-[#111111]">{decisions}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Changes made</p>
        </div>
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Actions</p>
          <p className="text-2xl font-black text-[#111111]">{actions}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Improvements</p>
        </div>
      </div>

      {/* Learning Journey Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest px-1">Learning Journey</h2>
        
        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
            const config = statusConfig[status]
            const statusItems = itemsByStatus[status]
            
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
                      <p className="text-xs text-[#9CA3AF] mt-1">{statusItems.length}</p>
                    </div>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {statusItems.length > 0 ? (
                    statusItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-[#E5E5E7] rounded-lg p-3 space-y-2 hover:border-[#007AFF] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-[#111111] leading-tight flex-1">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[#6B7280]">{item.clientName}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            categoryColors[item.category].bg,
                            categoryColors[item.category].text
                          )}>
                            {categoryColors[item.category].label}
                          </span>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            priorityConfig[item.priority].bg,
                            priorityConfig[item.priority].text
                          )}>
                            {priorityConfig[item.priority].label}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-xs text-[#9CA3AF]">No {config.title.toLowerCase()} learnings yet</p>
                      {status === "documented" && (
                        <button
                          onClick={onAddItem}
                          className="mt-3 text-xs text-[#007AFF] hover:text-[#0051D5] font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add First Learning
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Learning Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Documentation Standards</h3>
          <ul className="space-y-2 text-sm text-[#374151]">
            <li className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold mt-0.5">→</span>
              <span>Clear, actionable insight statement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold mt-0.5">→</span>
              <span>Data or evidence supporting learning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#007AFF] font-bold mt-0.5">→</span>
              <span>Recommended action or application</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Knowledge Integration</h3>
          <ul className="space-y-2 text-sm text-[#374151]">
            <li className="flex items-start gap-2">
              <span className="text-[#34C759] font-bold mt-0.5">→</span>
              <span>Apply to next sprint planning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#34C759] font-bold mt-0.5">→</span>
              <span>Update process documentation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#34C759] font-bold mt-0.5">→</span>
              <span>Share with team as best practice</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
