"use client"

import { ChevronDown, Plus } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface BacklogTask {
  id: string
  title: string
  description?: string
  phase: string
  priority: "low" | "medium" | "high"
  created_date: string
}

interface BacklogProps {
  tasks: BacklogTask[]
  isLoading: boolean
  onTaskAdded?: () => void
  onMoveToSprint?: (taskId: string, sprintId: string) => void
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: "bg-[#E5E5E7] text-[#86868B]", label: "Low" },
  medium: { color: "bg-[#FF9500] text-white", label: "Medium" },
  high: { color: "bg-[#FF3B30] text-white", label: "High" },
}

const phaseColors: Record<string, string> = {
  "Story Research": "border-l-[#007AFF] bg-[#007AFF]/5",
  "Story Writing": "border-l-[#34C759] bg-[#34C759]/5",
  "Story Design & Video": "border-l-[#FF9500] bg-[#FF9500]/5",
  "Story Website": "border-l-[#FF3B30] bg-[#FF3B30]/5",
  "Story Distribution": "border-l-[#5856D6] bg-[#5856D6]/5",
  "Story Analytics": "border-l-[#00C7FD] bg-[#00C7FD]/5",
  "Story Learning": "border-l-[#30B0C0] bg-[#30B0C0]/5",
}

export function Backlog({ tasks, isLoading, onTaskAdded, onMoveToSprint }: BacklogProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-[#E5E5E7] rounded w-32" />
          <div className="h-4 bg-[#E5E5E7] rounded w-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden">
      {/* Backlog Header */}
      <div
        className="p-4 cursor-pointer hover:bg-[#F5F5F7] transition-colors flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn("w-5 h-5 text-[#86868B] transition-transform", isExpanded && "rotate-180")}
          />
          <div>
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Backlog</h3>
            <p className="text-xs text-[#86868B]">{tasks.length} item{tasks.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        {tasks.length > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E5E5E7] text-xs font-medium text-[#1D1D1F]">
            {tasks.length}
          </span>
        )}
      </div>

      {/* Backlog Items - Expanded */}
      {isExpanded && (
        <div className="border-t border-[#E5E5E7] bg-[#F8F9FB] p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#86868B] text-sm">No backlog items</p>
              <p className="text-[#86868B] text-xs mt-1">All tasks are in sprints or completed</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.map((task) => {
                const priority = priorityConfig[task.priority] || priorityConfig.low
                const phaseColor = phaseColors[task.phase] || "border-l-[#E5E5E7] bg-[#E5E5E7]/5"

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "border-l-4 rounded-lg p-3 bg-white border border-[#E5E5E7] hover:shadow-sm transition-all",
                      phaseColor
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1D1D1F]">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-[#86868B] mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <span className={cn("px-2 py-1 rounded text-xs font-medium whitespace-nowrap", priority.color)}>
                        {priority.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#86868B] mb-2">
                      <span>{task.phase}</span>
                      <span>{new Date(task.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onMoveToSprint?.(task.id, "")}
                        className="flex-1 px-2 py-1.5 text-xs font-medium text-[#007AFF] bg-[#007AFF]/5 rounded hover:bg-[#007AFF]/10 transition-all"
                      >
                        Add to Sprint
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
