"use client"

import { useState } from "react"
import { ChevronDown, Calendar, Users, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  status: "planning" | "active" | "completed"
  taskCount?: number
  completedTaskCount?: number
  assignedMembers?: string[]
}

interface SprintSectionsProps {
  activeSprint?: Sprint
  previousSprints?: Sprint[]
  backlogCount?: number
  onBacklogClick?: () => void
  onPreviousSprintClick?: (sprintId: string) => void
}

export function SprintSections({
  activeSprint,
  previousSprints = [],
  backlogCount = 0,
  onBacklogClick,
  onPreviousSprintClick,
}: SprintSectionsProps) {
  const [expandedPrevious, setExpandedPrevious] = useState(false)
  const [expandedBacklog, setExpandedBacklog] = useState(false)

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    return `${start} - ${end}`
  }

  return (
    <div className="space-y-4">
      {/* Active Sprint - Always Visible */}
      {activeSprint ? (
        <div className="bg-white border border-[#007AFF] rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-gradient-to-r from-[#007AFF]/5 to-transparent border-b border-[#E5E5E7]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#34C759]"></div>
                  <p className="text-xs font-semibold text-[#007AFF] uppercase tracking-wide">
                    Active Sprint
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F]">{activeSprint.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#86868B] mb-1">
                  {formatDateRange(activeSprint.start_date, activeSprint.end_date)}
                </p>
              </div>
            </div>

            {/* Sprint Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/60 rounded-lg p-2">
                <p className="text-xs text-[#86868B] mb-1">Tasks</p>
                <p className="text-lg font-semibold text-[#1D1D1F]">{activeSprint.taskCount || 0}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2">
                <p className="text-xs text-[#86868B] mb-1">Completed</p>
                <p className="text-lg font-semibold text-[#34C759]">
                  {activeSprint.completedTaskCount || 0}
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-2">
                <p className="text-xs text-[#86868B] mb-1">Progress</p>
                <p className="text-lg font-semibold text-[#007AFF]">
                  {calculateProgress(activeSprint.completedTaskCount || 0, activeSprint.taskCount || 0)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1.5 bg-[#E5E5E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007AFF] transition-all duration-300"
                style={{
                  width: `${calculateProgress(activeSprint.completedTaskCount || 0, activeSprint.taskCount || 0)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Active Sprint Members */}
          {activeSprint.assignedMembers && activeSprint.assignedMembers.length > 0 && (
            <div className="px-4 py-3 bg-[#F5F5F7] border-t border-[#E5E5E7] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#86868B]" />
              <p className="text-xs text-[#86868B]">
                {activeSprint.assignedMembers.length} member{activeSprint.assignedMembers.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-[#E5E5E7] rounded-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-[#D1D1D6] mx-auto mb-2" />
          <p className="text-sm text-[#86868B]">No active sprint</p>
          <p className="text-xs text-[#C3C3C7] mt-1">Create a sprint to get started</p>
        </div>
      )}

      {/* Previous Sprints - Collapsible */}
      {previousSprints.length > 0 && (
        <div className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedPrevious(!expandedPrevious)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F5F5F7] transition-colors"
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[#1D1D1F]">Previous Sprints</p>
              <span className="text-xs bg-[#F5F5F7] text-[#86868B] px-2 py-0.5 rounded-full">
                {previousSprints.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#86868B] transition-transform duration-200",
                expandedPrevious && "rotate-180"
              )}
            />
          </button>

          {expandedPrevious && (
            <div className="border-t border-[#E5E5E7] space-y-2 p-3">
              {previousSprints.map((sprint) => (
                <button
                  key={sprint.id}
                  onClick={() => onPreviousSprintClick?.(sprint.id)}
                  className="w-full text-left p-3 bg-[#F5F5F7] hover:bg-[#E5E5E7] rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">{sprint.name}</p>
                      <p className="text-xs text-[#86868B] mt-0.5">
                        {formatDateRange(sprint.start_date, sprint.end_date)}
                      </p>
                    </div>
                    {sprint.status === "completed" && (
                      <div className="flex-shrink-0">
                        <span className="text-xs bg-[#34C759] text-white px-2 py-1 rounded">Completed</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backlog - Collapsible */}
      {backlogCount > 0 && (
        <div className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedBacklog(!expandedBacklog)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F5F5F7] transition-colors"
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[#1D1D1F]">Backlog</p>
              <span className="text-xs bg-[#F5F5F7] text-[#86868B] px-2 py-0.5 rounded-full">
                {backlogCount}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#86868B] transition-transform duration-200",
                expandedBacklog && "rotate-180"
              )}
            />
          </button>

          {expandedBacklog && (
            <div className="border-t border-[#E5E5E7] p-4">
              <button
                onClick={onBacklogClick}
                className="w-full px-4 py-2 text-sm bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] rounded-lg transition-colors font-medium"
              >
                View Backlog Items
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
