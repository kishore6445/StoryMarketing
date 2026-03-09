"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, User, Flag, AlertCircle, ChevronDown, Plus, Check } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"

interface TaskDetailSlideOverProps {
  isOpen: boolean
  taskId: string
  onClose: () => void
  onTaskUpdated?: () => void
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export function TaskDetailSlideOver({ isOpen, taskId, onClose, onTaskUpdated }: TaskDetailSlideOverProps) {
  const { data: taskData, mutate } = useSWR(
    isOpen && taskId ? `/api/tasks/${encodeURIComponent(taskId)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)

  const task = taskData?.task

  if (!isOpen) return null

  // Get status color matching Kanban board
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "done":
        return { 
          headerBg: "bg-green-600", 
          headerBorder: "border-green-700",
          badge: "bg-green-100 text-green-700",
          indicator: "text-green-600",
          actionBtn: "bg-green-600 hover:bg-green-700"
        }
      case "in_review":
        return { 
          headerBg: "bg-orange-600", 
          headerBorder: "border-orange-700",
          badge: "bg-orange-100 text-orange-700",
          indicator: "text-orange-600",
          actionBtn: "bg-orange-600 hover:bg-orange-700"
        }
      case "in_progress":
        return { 
          headerBg: "bg-blue-600", 
          headerBorder: "border-blue-700",
          badge: "bg-blue-100 text-blue-700",
          indicator: "text-blue-600",
          actionBtn: "bg-blue-600 hover:bg-blue-700"
        }
      default:
        return { 
          headerBg: "bg-gray-600", 
          headerBorder: "border-gray-700",
          badge: "bg-gray-100 text-gray-700",
          indicator: "text-gray-600",
          actionBtn: "bg-gray-600 hover:bg-gray-700"
        }
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700"
      case "high":
        return "bg-orange-100 text-orange-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getNextAction = (status?: string) => {
    switch (status) {
      case "todo":
        return { label: "Start Task", status: "in_progress" }
      case "in_progress":
        return { label: "Move to Review", status: "in_review" }
      case "in_review":
        return { label: "Mark Done", status: "done" }
      case "done":
        return null
      default:
        return { label: "Start Task", status: "in_progress" }
    }
  }

  const statusColor = getStatusColor(task?.status)
  const priorityColor = getPriorityColor(task?.priority)
  const nextAction = getNextAction(task?.status)

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("sessionToken")
      await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, status: newStatus }),
      })
      setStatusDropdownOpen(false)
      mutate()
      onTaskUpdated?.()
    } catch (error) {
      console.error("[v0] Error updating task status:", error)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const token = localStorage.getItem("sessionToken")
      await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, priority: newPriority }),
      })
      setPriorityDropdownOpen(false)
      mutate()
      onTaskUpdated?.()
    } catch (error) {
      console.error("[v0] Error updating task priority:", error)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[40%] bg-white shadow-2xl z-50 transition-transform duration-300 overflow-hidden flex flex-col",
          "max-w-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header with Status Color */}
        <div className={cn("flex-shrink-0 px-6 py-8 text-white", statusColor.headerBg)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Status Badge */}
              <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3", statusColor.badge)}>
                <div className={cn("w-2 h-2 rounded-full", statusColor.indicator)} />
                {task?.status?.replace(/_/g, " ").toUpperCase() || "TO DO"}
              </div>

              {/* Task ID */}
              <p className="text-xs font-medium opacity-80 uppercase tracking-wide mb-2">
                {task?.taskId || task?.id?.slice(0, 8).toUpperCase()}
              </p>

              {/* Task Title */}
              <h2 className="text-2xl font-bold leading-tight line-clamp-3">{task?.title}</h2>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Metadata Tags */}
          {(task?.clientName || task?.projectName || task?.sprintName || task?.phase || task?.internalPKRDate) && (
            <div className="px-6 py-4 border-b border-[#E5E5E7] flex flex-wrap gap-2">
              {task?.clientName && (
                <span className="inline-flex items-center px-2.5 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                  {task.clientName}
                </span>
              )}
              {task?.projectName && (
                <span className="inline-flex items-center px-2.5 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                  {task.projectName}
                </span>
              )}
              {task?.sprintName && (
                <span className="inline-flex items-center px-2.5 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                  {task.sprintName}
                </span>
              )}
              {task?.phase && (
                <span className="inline-flex items-center px-2.5 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                  {task.phase}
                </span>
              )}
              {task?.internalPKRDate && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                  <Calendar className="w-3 h-3" />
                  PKR: {new Date(task.internalPKRDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Primary Action Bar */}
          <div className="px-6 py-4 border-b border-[#E5E5E7] space-y-2">
            {nextAction ? (
              <>
                <button
                  onClick={() => handleStatusChange(nextAction.status)}
                  className={cn("w-full px-4 py-2.5 text-white font-medium rounded-lg transition-colors text-sm", statusColor.actionBtn)}
                >
                  {nextAction.label}
                </button>
                <button className="w-full px-4 py-2.5 bg-[#F5F5F7] text-[#1D1D1F] font-medium rounded-lg hover:bg-[#EBEBF0] transition-colors text-sm">
                  More Actions
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Task completed!</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          {task?.description && (
            <div className="px-6 py-4 border-b border-[#E5E5E7]">
              <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Description</h3>
              <div className="bg-[#F5F5F7] rounded-lg p-4 text-sm text-[#1D1D1F] leading-relaxed">
                {task.description}
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          <div className="px-6 py-4 border-b border-[#E5E5E7]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1D1D1F]">Subtasks</h3>
              <button
                onClick={() => setShowSubtaskInput(!showSubtaskInput)}
                className="text-[#007AFF] hover:text-[#0051D5] text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            
            {/* Subtask Input */}
            {showSubtaskInput && (
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 px-3 py-2 text-xs border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  autoFocus
                />
                <button className="px-3 py-2 bg-[#007AFF] text-white text-xs font-medium rounded-lg hover:bg-[#0051D5] transition-colors">
                  Save
                </button>
              </div>
            )}

            {/* Subtasks List */}
            {task?.subtasks && task.subtasks.length > 0 ? (
              <div className="space-y-2">
                {task.subtasks.map((subtask: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 hover:bg-[#F5F5F7] rounded-lg transition-colors group">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-[#D1D1D6] text-[#007AFF] cursor-pointer"
                    />
                    <span className={cn("text-sm flex-1", subtask.completed ? "text-[#86868B] line-through" : "text-[#1D1D1F]")}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#86868B] italic">No subtasks yet</p>
            )}
          </div>

          {/* Activity Section */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Activity</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#007AFF] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {task?.createdBy?.split(" ")[0]?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1D1D1F]">Task created</p>
                  <p className="text-xs text-[#86868B]">{new Date(task?.createdAt || "").toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar moved to bottom for better mobile UX */}
          <div className="px-6 py-4 border-t border-[#E5E5E7] space-y-4 bg-[#FAFBFC]">
            {/* Assignee */}
            <div>
              <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Assignee
              </label>
              {task?.assignedTo ? (
                <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E5E7] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {task.assignedTo.split(" ")[0][0]}
                  </div>
                  <span className="text-xs font-medium text-[#1D1D1F] truncate">{task.assignedTo}</span>
                </div>
              ) : (
                <button className="w-full px-3 py-2 text-xs text-[#007AFF] hover:bg-white rounded-lg transition-colors font-medium border border-[#E5E5E7]">
                  + Assign
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2">Status</label>
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={cn(
                  "w-full px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-left flex items-center justify-between",
                  statusColor.badge,
                  "border-current"
                )}
              >
                <span>{task?.status?.replace(/_/g, " ").toUpperCase() || "TO DO"}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", statusDropdownOpen && "rotate-180")} />
              </button>
              {statusDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10">
                  {["todo", "in_progress", "in_review", "done"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F7] transition-colors border-b border-[#E5E5E7] last:border-b-0"
                    >
                      {status.replace(/_/g, " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="relative">
              <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" />
                Priority
              </label>
              <button
                onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                className={cn(
                  "w-full px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-left flex items-center justify-between",
                  priorityColor,
                  "border-current"
                )}
              >
                <span>{task?.priority?.toUpperCase() || "MEDIUM"}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", priorityDropdownOpen && "rotate-180")} />
              </button>
              {priorityDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10">
                  {["low", "medium", "high", "urgent"].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F7] transition-colors border-b border-[#E5E5E7] last:border-b-0"
                    >
                      {priority.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phase */}
            {task?.phase && (
              <div>
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2">Phase</label>
                <div className="px-3 py-2 bg-white border border-[#E5E5E7] rounded-lg text-xs font-medium text-[#1D1D1F]">
                  {task.phase}
                </div>
              </div>
            )}

            {/* Internal PKR Date */}
            {task?.internalPKRDate && (
              <div>
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Internal PKR Date
                </label>
                <div className="px-3 py-2 bg-white border border-[#E5E5E7] rounded-lg text-xs font-medium text-[#1D1D1F]">
                  {new Date(task.internalPKRDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Due Date */}
            {task?.dueDate && (
              <div>
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Due Date
                </label>
                <div className="px-3 py-2 bg-white border border-[#E5E5E7] rounded-lg text-xs font-medium text-[#1D1D1F]">
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
