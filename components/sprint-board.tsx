"use client"

import { useState } from "react"
import { Calendar, Users, Trash2, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { SprintPKRSummary } from "./sprint-pkr-summary"

interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  status: "planning" | "active" | "completed"
  assignees?: Array<{ id: string; full_name: string; email: string }>
  task_count?: number
  completed_tasks?: number
  pkrPercentage?: number
  promisesKept?: number
  atRiskPromises?: number
  missedPromises?: number
}

interface SprintBoardProps {
  sprints: Sprint[]
  isLoading: boolean
  onSprintDelete?: (sprintId: string) => Promise<void>
  onSprintSelect?: (sprintId: string) => void
  onAddTaskClick?: (sprintId: string) => void
}

export function SprintBoard({ sprints, isLoading, onSprintDelete, onSprintSelect, onAddTaskClick }: SprintBoardProps) {
  const [expandedSprints, setExpandedSprints] = useState<string[]>([])
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null)

  const toggleExpand = (sprintId: string) => {
    setExpandedSprints((prev) =>
      prev.includes(sprintId) ? prev.filter((id) => id !== sprintId) : [...prev, sprintId]
    )
  }

  const handleDelete = async (sprintId: string) => {
    if (!onSprintDelete) return
    setDeletingSprintId(sprintId)
    try {
      await onSprintDelete(sprintId)
    } finally {
      setDeletingSprintId(null)
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const end = new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return `${start} - ${end}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#34C759]/10 border-[#34C759] text-[#34C759]"
      case "planning":
        return "bg-[#007AFF]/10 border-[#007AFF] text-[#007AFF]"
      case "completed":
        return "bg-[#86868B]/10 border-[#86868B] text-[#86868B]"
      default:
        return "bg-[#E5E5E7]/10 border-[#E5E5E7] text-[#86868B]"
    }
  }

  const getProgressPercentage = (sprint: Sprint) => {
    const total = sprint.task_count || 0
    const completed = sprint.completed_tasks || 0
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#F5F5F7] rounded-lg p-4 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  if (sprints.length === 0) {
    return (
      <div className="text-center py-8 bg-[#F8F9FB] rounded-lg border border-dashed border-[#E5E5E7]">
        <Calendar className="w-6 h-6 text-[#D1D1D6] mx-auto mb-2" />
        <p className="text-[#86868B] text-sm">No sprints created yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sprints.map((sprint) => {
        const isExpanded = expandedSprints.includes(sprint.id)
        const progress = getProgressPercentage(sprint)

        return (
          <div
            key={sprint.id}
            className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden hover:shadow-sm transition-all"
          >
            {/* Sprint Header */}
            <div
              className="p-4 cursor-pointer hover:bg-[#F5F5F7] transition-colors"
              onClick={() => toggleExpand(sprint.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">{sprint.name}</h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium border",
                        getStatusColor(sprint.status)
                      )}
                    >
                      {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#86868B] mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateRange(sprint.start_date, sprint.end_date)}</span>
                  </div>

                  {/* Progress Bar */}
                  {sprint.task_count && sprint.task_count > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#86868B]">Progress</span>
                        <span className="text-xs font-medium text-[#1D1D1F]">
                          {sprint.completed_tasks || 0}/{sprint.task_count}
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E5E7] rounded-full h-1.5">
                        <div
                          className="bg-[#34C759] h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-[#86868B] transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Sprint Details - Expanded */}
            {isExpanded && (
              <div className="border-t border-[#E5E5E7] bg-[#F8F9FB] p-4 space-y-4">
                {/* PKR Summary Card */}
                {sprint.pkrPercentage !== undefined && (
                  <SprintPKRSummary
                    sprintName={sprint.name}
                    pkrPercentage={sprint.pkrPercentage}
                    totalPromises={(sprint.promisesKept || 0) + (sprint.atRiskPromises || 0) + (sprint.missedPromises || 0) || 0}
                    keptPromises={sprint.promisesKept || 0}
                    atRiskPromises={sprint.atRiskPromises || 0}
                    missedPromises={sprint.missedPromises || 0}
                  />
                )}

                {/* Team Members */}
                {sprint.assignees && sprint.assignees.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-[#1D1D1F]">
                      <Users className="w-3.5 h-3.5" />
                      Team Members
                    </div>
                    <div className="space-y-1">
                      {sprint.assignees.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 text-xs text-[#86868B]">
                          <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
                          <span className="font-medium text-[#1D1D1F]">{member.full_name}</span>
                          <span className="text-[#86868B]">{member.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-[#E5E5E7]">
                  <button
                    onClick={() => onAddTaskClick?.(sprint.id)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-[#007AFF] bg-white border border-[#007AFF] rounded hover:bg-[#007AFF]/5 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Task
                  </button>
                  <button
                    onClick={() => onSprintSelect?.(sprint.id)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#007AFF] rounded hover:opacity-90 transition-all"
                  >
                    View Sprint
                  </button>
                  {onSprintDelete && (
                    <button
                      onClick={() => handleDelete(sprint.id)}
                      disabled={deletingSprintId === sprint.id}
                      className="px-3 py-2 text-xs font-medium text-[#FF3B30] bg-white border border-[#FF3B30] rounded hover:bg-[#FF3B30]/5 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
