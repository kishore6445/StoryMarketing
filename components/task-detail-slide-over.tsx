"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, User, Users, Flag, Star, Trash2, Edit2, CheckCircle2, Circle, AlertCircle, ChevronRight, Plus } from "lucide-react"
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

  const task = taskData?.task

  if (!isOpen) return null

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "done":
        return { bg: "bg-green-100", text: "text-green-700", border: "border-l-green-500" }
      case "in_review":
        return { bg: "bg-orange-100", text: "text-orange-700", border: "border-l-orange-500" }
      case "in_progress":
        return { bg: "bg-blue-100", text: "text-blue-700", border: "border-l-blue-500" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-l-gray-500" }
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-500" }
      case "high":
        return { bg: "bg-orange-100", text: "text-orange-700", badge: "bg-orange-500" }
      case "medium":
        return { bg: "bg-yellow-100", text: "text-yellow-700", badge: "bg-yellow-500" }
      case "low":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-500" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500" }
    }
  }

  const statusColor = getStatusColor(task?.status)
  const priorityColor = getPriorityColor(task?.priority)

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
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#E5E5E7] px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            {/* Colored Status Indicator */}
            <div className={cn("inline-block px-3 py-1 rounded-full text-xs font-medium mb-3", statusColor.bg, statusColor.text)}>
              {task?.status?.replace(/_/g, " ").toUpperCase() || "TO DO"}
            </div>

            {/* Task ID */}
            <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide mb-2">
              {task?.taskId || task?.id?.slice(0, 8).toUpperCase()}
            </p>

            {/* Task Title */}
            <h2 className="text-2xl font-bold text-[#1D1D1F] line-clamp-2 leading-tight">{task?.title}</h2>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors ml-4"
          >
            <X className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>

        {/* Metadata Tags */}
        {(task?.clientName || task?.projectName || task?.sprintName || task?.phase || task?.internalPKRDate) && (
          <div className="flex-shrink-0 border-b border-[#E5E5E7] px-6 py-4 flex flex-wrap gap-2">
            {task?.clientName && (
              <span className="inline-flex items-center px-3 py-1.5 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                {task.clientName}
              </span>
            )}
            {task?.projectName && (
              <span className="inline-flex items-center px-3 py-1.5 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                {task.projectName}
              </span>
            )}
            {task?.sprintName && (
              <span className="inline-flex items-center px-3 py-1.5 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                {task.sprintName}
              </span>
            )}
            {task?.phase && (
              <span className="inline-flex items-center px-3 py-1.5 bg-[#F5F5F7] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]">
                {task.phase}
              </span>
            )}
            {task?.internalPKRDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.internalPKRDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex-shrink-0 border-b border-[#E5E5E7] px-6 py-4 flex gap-3">
          <button className="flex-1 px-4 py-2.5 bg-[#007AFF] text-white font-medium rounded-lg hover:bg-[#0051D5] transition-colors text-sm">
            {task?.status === "in_progress" ? "Move to Review" : "Start Task"}
          </button>
          <button className="flex-1 px-4 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors text-sm">
            Mark Done
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
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
              <button className="text-[#007AFF] hover:text-[#0051D5] text-xs font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            {task?.subtasks && task.subtasks.length > 0 ? (
              <div className="space-y-2">
                {task.subtasks.map((subtask: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-[#E5E5E7] text-[#007AFF]"
                    />
                    <span className={cn("text-sm", subtask.completed ? "text-[#86868B] line-through" : "text-[#1D1D1F]")}>
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
          <div className="px-6 py-4 border-b border-[#E5E5E7]">
            <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Activity</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#007AFF] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1D1D1F]">Task created</p>
                  <p className="text-xs text-[#86868B]">Today at 10:30 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-b from-[#FAFBFC] to-white border-l border-[#E5E5E7] px-4 py-6 space-y-6 overflow-y-auto">
          {/* Assignee */}
          <div>
            <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Assignee
            </label>
            {task?.assignedTo ? (
              <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E5E7] rounded-lg">
                <div className="w-7 h-7 rounded-full bg-[#007AFF] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {task.assignedTo.split(" ")[0][0]}
                </div>
                <span className="text-xs font-medium text-[#1D1D1F] truncate">{task.assignedTo}</span>
              </div>
            ) : (
              <button className="w-full px-3 py-2 text-xs text-[#007AFF] hover:bg-[#F5F5F7] rounded-lg transition-colors font-medium">
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
                statusColor.bg,
                statusColor.text,
                "border-[#E5E5E7]"
              )}
            >
              <span>{task?.status?.replace(/_/g, " ").toUpperCase() || "TO DO"}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", statusDropdownOpen && "rotate-90")} />
            </button>
            {statusDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10">
                {["todo", "in_progress", "in_review", "done"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F7] transition-colors"
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
                priorityColor.bg,
                priorityColor.text,
                "border-[#E5E5E7]"
              )}
            >
              <span>{task?.priority?.toUpperCase() || "MEDIUM"}</span>
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", priorityDropdownOpen && "rotate-90")} />
            </button>
            {priorityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10">
                {["low", "medium", "high", "urgent"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityChange(priority)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F7] transition-colors"
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

          {/* Due Date */}
          {task?.dueDate && (
            <div>
              <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide block mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Due Date
              </label>
              <div className="px-3 py-2 bg-white border border-[#E5E5E7] rounded-lg text-xs font-medium text-[#1D1D1F]">
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
