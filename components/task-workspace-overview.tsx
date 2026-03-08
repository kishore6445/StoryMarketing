"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskSubtasks } from "@/components/task-subtasks"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  created_at?: string
  [key: string]: any
}

interface TaskWorkspaceOverviewProps {
  task: Task
  onStatusBlocked?: (blocked: boolean) => void
}

export function TaskWorkspaceOverview({ task, onStatusBlocked }: TaskWorkspaceOverviewProps) {
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([])
  const [newChecklistItem, setNewChecklistItem] = useState("")

  const timelineStages = [
    { key: "created", label: "Created", completed: !!task.created_at },
    { key: "in_progress", label: "In Progress", completed: task.status === "in_progress" || task.status === "in_review" || task.status === "done" },
    { key: "in_review", label: "In Review", completed: task.status === "in_review" || task.status === "done" },
    { key: "done", label: "Done", completed: task.status === "done" }
  ]

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const newItem = {
      id: `item-${Date.now()}`,
      text: newChecklistItem,
      completed: false
    }
    setChecklist([...checklist, newItem])
    setNewChecklistItem("")
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id))
  }

  const completedCount = checklist.filter(item => item.completed).length
  const checklistProgress = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Subtasks Section */}
      <div>
        <TaskSubtasks taskId={task.id} mainTaskStatus={task.status} onStatusBlocked={onStatusBlocked} />
      </div>

      {/* Task Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Task Lifecycle</h3>
        <div className="flex items-center justify-between gap-2">
          {timelineStages.map((stage, index) => (
            <div key={stage.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all",
                  stage.completed ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-400"
                )}>
                  {stage.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">{stage.label}</p>
              </div>
              {index < timelineStages.length - 1 && (
                <div className={cn(
                  "h-1 mb-8 flex-1 mx-1 transition-all",
                  stage.completed ? "bg-green-300" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
        {task.description ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No description provided</p>
        )}
      </div>

      {/* Recent Activity Preview */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Task created</p>
              <p className="text-xs text-gray-500">{task.created_at ? new Date(task.created_at).toLocaleDateString() : "Unknown date"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Progress Indicator */}
      {checklist.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Checklist Progress</h4>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-blue-900">{completedCount} / {checklist.length}</p>
                <p className="text-xs text-blue-600 mt-1">completed</p>
              </div>
              <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-blue-900 min-w-fit">{Math.round(checklistProgress)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Checklist Items</h3>

        <div className="space-y-2 mb-3">
          {checklist.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors">
              <button
                onClick={() => toggleChecklistItem(item.id)}
                className="flex-shrink-0"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <span className={cn(
                "text-sm flex-1",
                item.completed ? "text-gray-500 line-through" : "text-gray-900"
              )}>
                {item.text}
              </span>
              <button
                onClick={() => removeChecklistItem(item.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
            placeholder="Add a checklist item..."
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addChecklistItem}
            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
