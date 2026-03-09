"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Task } from "./my-tasks-today"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, ChevronDown } from "lucide-react"

interface KanbanColumn {
  id: string
  title: string
  tasks: Task[]
  color: string
  icon: React.ReactNode
  bgColor: string
  accentColor: string
}

interface TaskKanbanProps {
  tasks: Task[]
  onTaskStatusChange?: (taskId: string, newStatus: string) => Promise<void>
  isLoading?: boolean
  onTaskUpdate?: (taskId: string) => void
  onEditTask?: (task: Task) => void
  selectedTaskIds?: Set<string>
  onToggleTaskSelection?: (taskId: string) => void
  showCheckboxes?: boolean
}

const CARDS_PER_COLUMN_LIMIT = 6

export function TaskKanban({ tasks, onTaskStatusChange, isLoading, onTaskUpdate, onEditTask, selectedTaskIds, onToggleTaskSelection, showCheckboxes }: TaskKanbanProps) {
  const router = useRouter()
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [sourceColumn, setSourceColumn] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [expandedDoneColumn, setExpandedDoneColumn] = useState(false)
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({})

  // Get border color based on due date only
  const getBorderColor = (dueDate?: string): string => {
    if (!dueDate) {
      return "#86868B" // Gray for tasks with no due date
    }

    try {
      const due = new Date(dueDate)
      const today = new Date()
      
      // Validate date
      if (isNaN(due.getTime())) {
        return "#86868B"
      }
      
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        return "#FF3B30" // Red for overdue
      } else if (diffDays === 0) {
        return "#FF9500" // Orange for due today
      } else if (diffDays === 1) {
        return "#007AFF" // Blue for due tomorrow
      } else {
        return "#86868B" // Gray for upcoming (more than 1 day away)
      }
    } catch {
      return "#86868B"
    }
  }

  // Check if task is overdue
  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false
    try {
      const due = new Date(dueDate)
      if (isNaN(due.getTime())) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)
      return due < today
    } catch {
      return false
    }
  }

  // Check if task is due today for background highlight
  const isDueToday = (dueDate?: string): boolean => {
    if (!dueDate) return false
    try {
      const due = new Date(dueDate)
      if (isNaN(due.getTime())) return false
      const today = new Date()
      return due.toDateString() === today.toDateString()
    } catch {
      return false
    }
  }

  // Get urgency/due-status indicator - separate from priority
  const getUrgencyStatus = (dueDate: string): { color: string; dotBg: string; label: string } | null => {
    if (!dueDate) return null
    
    try {
      const due = new Date(dueDate)
      if (isNaN(due.getTime())) return null
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        return { color: "#FF3B30", dotBg: "#FF3B30", label: "Overdue" }
      } else if (diffDays === 0) {
        return { color: "#FF9500", dotBg: "#FF9500", label: "Due today" }
      } else if (diffDays === 1) {
        return { color: "#FF9500", dotBg: "#FF9500", label: "Due tomorrow" }
      } else {
        return { color: "#86868B", dotBg: "#86868B", label: "Upcoming" }
      }
    } catch {
      return null
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return null
    try {
      const date = new Date(dateStr)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return "Today"
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow"
      } else if (date < today) {
        return "Overdue"
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return null
    }
  }

  // Map task statuses to kanban columns
  const statusMap: Record<string, string> = {
    "todo": "TO DO",
    "pending": "TO DO",
    "in_progress": "IN PROGRESS",
    "in_review": "IN REVIEW",
    "done": "DONE",
  }

  const columnStatuses = ["todo", "in_progress", "in_review", "done"]

  // Normalize task status for kanban display
  const getNormalizedStatus = (status: string | undefined): string => {
    const normalizedStatus = status || "todo"
    if (normalizedStatus === "pending") return "todo"
    return normalizedStatus
  }

  const columns: KanbanColumn[] = columnStatuses.map((status) => {
    const columnTasks = tasks.filter((t) => getNormalizedStatus(t.status) === status)
    return {
      id: status,
      title: statusMap[status],
      tasks: columnTasks,
      color: {
        "todo": "border-gray-200",
        "in_progress": "border-blue-200",
        "in_review": "border-orange-200",
        "done": "border-green-200",
      }[status],
      bgColor: "bg-white",
      accentColor: {
        "todo": "text-gray-500",
        "in_progress": "text-blue-500",
        "in_review": "text-orange-500",
        "done": "text-green-500",
      }[status],
      icon: {
        "todo": <Circle className="w-4 h-4" />,
        "in_progress": <Circle className="w-4 h-4" />,
        "in_review": <Circle className="w-4 h-4" />,
        "done": <CheckCircle2 className="w-4 h-4" />,
      }[status] || <Circle className="w-4 h-4" />,
    }
  })

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task)
    setSourceColumn(columnId)
    setIsAnimating(true)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (columnId: string) => {
    if (!draggedTask || sourceColumn === columnId) {
      setDraggedTask(null)
      setSourceColumn(null)
      setDragOverColumn(null)
      setIsAnimating(false)
      return
    }

    const statusMapping: Record<string, string> = {
      "todo": "todo",
      "pending": "todo",
      "in_progress": "in_progress",
      "in_review": "in_review",
      "done": "done",
    }
    
    const newStatus = statusMapping[columnId] || columnId

    setIsAnimating(true)
    await onTaskStatusChange?.(draggedTask.id, newStatus)

    setTimeout(() => {
      setDraggedTask(null)
      setSourceColumn(null)
      setDragOverColumn(null)
      setIsAnimating(false)
    }, 300)
  }

  const toggleColumnExpand = (columnId: string) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="overflow-x-auto">
        <div className="flex gap-6 px-6 py-6 w-full" style={{ minWidth: "fit-content" }}>
          {columns.map((column) => {
            const isExpanded = expandedColumns[column.id]
            const displayCount = isExpanded ? column.tasks.length : Math.min(CARDS_PER_COLUMN_LIMIT, column.tasks.length)
            const hasMore = column.tasks.length > CARDS_PER_COLUMN_LIMIT
            const displayTasks = isExpanded ? column.tasks : column.tasks.slice(0, CARDS_PER_COLUMN_LIMIT)

            // For DONE column, show collapsed by default
            let doneDisplayTasks = displayTasks
            if (column.id === "done" && !expandedDoneColumn) {
              doneDisplayTasks = []
            }

            const tasksToShow = column.id === "done" ? doneDisplayTasks : displayTasks

            return (
              <div
                key={column.id}
                className={cn(
                  "flex flex-col rounded-lg border flex-shrink-0 transition-all duration-200 shadow-sm overflow-hidden",
                  "w-80", // min-width: 320px equivalent
                  dragOverColumn === column.id && draggedTask
                    ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200"
                    : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300",
                  draggedTask && sourceColumn !== column.id && "opacity-100"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header - Strengthened typography and hierarchy */}
                <div 
                  className={cn(
                    "sticky top-0 z-10 px-4 py-3.5 flex items-center justify-between border-b border-gray-100 bg-white",
                    column.id === "done" ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""
                  )}
                  onClick={() => column.id === "done" && setExpandedDoneColumn(!expandedDoneColumn)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      {column.id === "done" && (
                        <CheckCircle2 className={cn("w-4 h-4 text-green-500 flex-shrink-0 transition-opacity", !expandedDoneColumn && "opacity-50")} />
                      )}
                      <h3 className="font-semibold text-sm text-gray-800">
                        {column.title}
                      </h3>
                      <span className="text-sm font-medium text-gray-500">
                        {column.tasks.length}
                      </span>
                    </div>
                    {hasMore && !isExpanded && column.id !== "done" && (
                      <p className="text-xs text-gray-500 ml-6 mt-1.5">
                        Showing {displayCount} of {column.tasks.length}
                      </p>
                    )}
                  </div>
                  {column.id === "done" && (
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2",
                        expandedDoneColumn && "rotate-180"
                      )}
                    />
                  )}
                </div>

                {/* Tasks Container - Scrollable */}
                {column.id === "done" && !expandedDoneColumn ? (
                  <div className="flex-1 px-4 py-3" />
                ) : (
                  <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto max-h-[calc(100vh-240px)]">
                    {tasksToShow.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                        <p className="text-xs text-gray-500 font-medium">
                          {column.tasks.length === 0 ? "No tasks" : "No tasks to show"}
                        </p>
                      </div>
                    ) : (
                      <>
                        {tasksToShow.map((task) => {
                          const dueDate = formatDate(task.dueDate)
                          const urgencyStatus = getUrgencyStatus(task.dueDate)
                          const borderColor = getBorderColor(task.dueDate)
                          const isToday = isDueToday(task.dueDate)
                          const isTaskOverdue = isOverdue(task.dueDate)
                          const canOpenTaskWorkspace = task.type === "task"
                          const taskIdentifier = task.id || task.taskId

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task, column.id)}
                              onClick={() => {
                                if (!canOpenTaskWorkspace || !taskIdentifier) return
                                router.push(`/tasks/${encodeURIComponent(taskIdentifier)}`)
                              }}
                              style={{
                                borderLeftColor: borderColor,
                              }}
                              className={cn(
                                "group relative rounded-lg border-l-4 border border-gray-200 cursor-move transition-all duration-150",
                                "hover:shadow-sm",
                                "active:scale-95",
                                draggedTask?.id === task.id
                                  ? "opacity-50 shadow-lg ring-2 ring-blue-200"
                                  : "",
                                isTaskOverdue ? "bg-red-100 hover:bg-red-100" : "",
                                isToday ? "bg-orange-50 hover:bg-orange-50" : "",
                                !isTaskOverdue && !isToday ? "bg-white hover:bg-gray-50" : "",
                                "flex flex-col overflow-hidden"
                              )}
                            >
                              {/* Task Content - Consistent padding (14-16px) */}
                              <div className="px-4 py-3.5">
                                <div className="space-y-1.5">
                                  {/* Task ID - Small and muted */}
                                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">
                                    {task.taskId || task.id.slice(0, 6).toUpperCase()}
                                  </div>
                                  
                                  {/* Title - Primary focus, strong weight, 2 lines max */}
                                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                                    {task.title}
                                  </h4>

                                  {/* Meta line - Project • Due Date • Urgency Dot */}
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 leading-tight">
                                    {task.clientName && (
                                      <span className="truncate font-normal">{task.clientName}</span>
                                    )}
                                    {dueDate && (
                                      <>
                                        {task.clientName && <span className="text-gray-300 flex-shrink-0">•</span>}
                                        <span 
                                          style={{ color: urgencyStatus?.color || "#86868B" }}
                                          className="flex-shrink-0 font-medium"
                                        >
                                          {dueDate}
                                        </span>
                                      </>
                                    )}
                                    {urgencyStatus && (
                                      <span
                                        style={{ backgroundColor: urgencyStatus.dotBg }}
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        title={urgencyStatus.label}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Show More / Show Less toggle - Enhanced visibility */}
                        {hasMore && column.id !== "done" && (
                          <div className="flex justify-center mt-2">
                            <button
                              onClick={() => toggleColumnExpand(column.id)}
                              className="text-blue-600 text-sm font-medium hover:underline cursor-pointer transition-colors"
                            >
                              {isExpanded ? "Show less" : `Show more (${column.tasks.length - CARDS_PER_COLUMN_LIMIT})`}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
