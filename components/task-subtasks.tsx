"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Check, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Subtask {
  id: string
  task_id: string
  title: string
  status: "pending" | "in_progress" | "done"
  assignee_id?: string
  assignee?: { id: string; full_name: string; email: string }
  due_date?: string
  completed_at?: string
  created_at: string
}

interface SubtasksProps {
  taskId: string
  mainTaskStatus: string
  onStatusBlocked?: (blocked: boolean) => void
}

export function TaskSubtasks({ taskId, mainTaskStatus, onStatusBlocked }: SubtasksProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState<string>("")
  const [selectedDueDate, setSelectedDueDate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; full_name: string; email: string }>>([])

  // Fetch subtasks
  useEffect(() => {
    const loadSubtasks = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("sessionToken")
        const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Subtasks loaded:", data)
          setSubtasks(Array.isArray(data) ? data : [])
          
          // Check if any subtask is not done - block "in_review" status
          const hasIncompleteSubtasks = data.some((s: Subtask) => s.status !== "done")
          onStatusBlocked?.(hasIncompleteSubtasks)
        } else {
          // Table might not exist yet or other error
          console.warn("[v0] Subtasks API returned:", response.status)
          setSubtasks([])
          onStatusBlocked?.(false)
        }
      } catch (error) {
        console.error("[v0] Error loading subtasks:", error)
        setSubtasks([])
        onStatusBlocked?.(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubtasks()
  }, [taskId, onStatusBlocked])

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newSubtaskTitle.trim(),
          assignee_id: selectedAssignee || null,
          due_date: selectedDueDate || null
        })
      })

      if (response.ok) {
        const newSubtask = await response.json()
        const updatedSubtasks = [...subtasks, newSubtask]
        setSubtasks(updatedSubtasks)
        setNewSubtaskTitle("")
        setSelectedAssignee("")
        setSelectedDueDate("")
        setShowAddForm(false)
        
        // New subtask is always pending, so status is blocked
        onStatusBlocked?.(true)
      }
    } catch (error) {
      console.error("[v0] Error adding subtask:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done"

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const updated = await response.json()
        const updatedSubtasks = subtasks.map(s => s.id === subtaskId ? updated : s)
        setSubtasks(updatedSubtasks)
        
        // Notify parent about completion status change
        const hasIncomplete = updatedSubtasks.some(s => s.status !== "done")
        onStatusBlocked?.(hasIncomplete)
      }
    } catch (error) {
      console.error("[v0] Error updating subtask:", error)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm("Delete this subtask?")) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        const updatedSubtasks = subtasks.filter(s => s.id !== subtaskId)
        setSubtasks(updatedSubtasks)
        
        // Notify parent about completion status change
        const hasIncomplete = updatedSubtasks.some(s => s.status !== "done")
        onStatusBlocked?.(hasIncomplete)
      }
    } catch (error) {
      console.error("[v0] Error deleting subtask:", error)
    }
  }

  const completedCount = subtasks.filter(s => s.status === "done").length
  const progressPercent = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0
  const hasIncompleteSubtasks = subtasks.some(s => s.status !== "done")

  return (
    <div className="pt-6 border-t-2 border-gray-200">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Subtasks</h3>
          <p className="text-xs text-gray-500 mt-1">Break down the work into smaller pieces</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Subtask
        </button>
      </div>

      {/* Progress Indicator */}
      {subtasks.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <p className="text-sm font-medium text-blue-900">{completedCount} / {subtasks.length} completed</p>
            </div>
            <span className="text-xs font-semibold text-blue-700">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Incomplete Subtasks Warning */}
      {hasIncompleteSubtasks && mainTaskStatus === "in_review" && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">Complete all subtasks before moving to Review</p>
        </div>
      )}

      {/* Add Subtask Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Subtask title..."
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={selectedDueDate}
              onChange={(e) => setSelectedDueDate(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>{member.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim() || isSubmitting}
              className="flex-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Add Subtask
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subtasks List */}
      {isLoading ? (
        <p className="text-xs text-gray-500 text-center py-4">Loading subtasks...</p>
      ) : subtasks.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">No subtasks yet</p>
      ) : (
        <div className="space-y-2">
          {subtasks.map(subtask => (
            <div
              key={subtask.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors group"
            >
              {/* Status Checkbox */}
              <button
                onClick={() => handleToggleStatus(subtask.id, subtask.status)}
                className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded border-2 transition-all hover:scale-110"
                style={{
                  borderColor: subtask.status === "done" ? "#10b981" : "#d1d5db",
                  backgroundColor: subtask.status === "done" ? "#10b981" : "transparent"
                }}
              >
                {subtask.status === "done" && <Check className="w-3 h-3 text-white" />}
              </button>

              {/* Subtask Info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium",
                  subtask.status === "done" ? "text-gray-400 line-through" : "text-gray-900"
                )}>
                  {subtask.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {subtask.assignee && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {subtask.assignee.full_name}
                    </span>
                  )}
                  {subtask.due_date && (
                    <span className="text-xs text-gray-500 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(subtask.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
