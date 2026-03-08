"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, X, Edit2, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  owner: string
  completed: boolean
  dueDate: string
  priority: "low" | "medium" | "high"
}

interface SectionTasksProps {
  sectionId: string
  initialTasks?: Task[]
}

const teamMembers = ["Ravi", "Soujanya", "Alex", "Sarah", "Jordan"]

export function SectionTasks({ sectionId, initialTasks = [] }: SectionTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isAdding, setIsAdding] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskOwner, setNewTaskOwner] = useState(teamMembers[0])
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const [editFormData, setEditFormData] = useState<Task | null>(null)

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)))
  }

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setEditFormData({ ...task })
  }

  const saveEdit = () => {
    if (!editFormData) return
    setTasks(tasks.map((t) => (t.id === editFormData.id ? editFormData : t)))
    setEditingTaskId(null)
    setEditFormData(null)
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditFormData(null)
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `${sectionId}-${Date.now()}`,
      title: newTaskTitle,
      owner: newTaskOwner,
      completed: false,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle("")
    setNewTaskOwner(teamMembers[0])
    setNewTaskDueDate("")
    setNewTaskPriority("medium")
    setIsAdding(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#FFD6D6] text-[#C41C1C]"
      case "medium":
        return "bg-[#FFE5CC] text-[#C76D00]"
      case "low":
        return "bg-[#D1FADF] text-[#2E7D32]"
      default:
        return "bg-[#F3F3F6] text-[#86868B]"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "No due date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (editingTaskId && editFormData) {
    return (
      <div className="mt-6 pt-6 border-t border-[#E5E5E7]">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#1D1D1F]">Edit Task</h3>

          <div>
            <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Task Title</label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Due Date</label>
              <input
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Priority</label>
              <select
                value={editFormData.priority}
                onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as "low" | "medium" | "high" })}
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Assign To</label>
            <select
              value={editFormData.owner}
              onChange={(e) => setEditFormData({ ...editFormData, owner: e.target.value })}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            >
              {teamMembers.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveEdit}
              className="px-3 py-1.5 bg-[#2E7D32] text-white text-xs rounded-lg hover:bg-[#1B5E20] transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="px-3 py-1.5 bg-[#F5F5F7] text-[#1D1D1F] text-xs rounded-lg hover:bg-[#E5E5E7] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-[#E5E5E7]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-[#86868B] uppercase tracking-wider">Tasks for this section</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-[#86868B] hover:text-[#2E7D32] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white border border-[#E5E5E7] rounded-lg p-3 group hover:border-[#2E7D32]/30 transition-colors">
            <div className="flex items-start justify-between">
              <label className="flex items-start gap-3 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D1D1D6] text-[#2E7D32] focus:ring-[#2E7D32] focus:ring-offset-0 cursor-pointer"
                />
                <span className={cn("text-sm font-medium flex-1", task.completed ? "text-[#86868B] line-through" : "text-[#1D1D1F]")}>
                  {task.title}
                </span>
              </label>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <button
                  onClick={() => startEdit(task)}
                  className="text-[#86868B] hover:text-[#2E7D32] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-[#86868B] hover:text-[#FF3B30] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-xs text-[#86868B] mt-2 space-y-1">
              <div>
                <span className="font-medium">Assigned to:</span> {task.owner}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(task.dueDate)}</span>
                {task.priority && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Task Title</label>
              <input
                type="text"
                placeholder="Enter task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask()
                  if (e.key === "Escape") {
                    setIsAdding(false)
                    setNewTaskTitle("")
                    setNewTaskOwner(teamMembers[0])
                    setNewTaskDueDate("")
                    setNewTaskPriority("medium")
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                  className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Assign To</label>
              <select
                value={newTaskOwner}
                onChange={(e) => setNewTaskOwner(e.target.value)}
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
              >
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addTask}
                className="px-4 py-2 bg-[#2E7D32] text-white text-sm rounded-lg hover:bg-[#1B5E20] transition-colors font-medium"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewTaskTitle("")
                  setNewTaskOwner(teamMembers[0])
                  setNewTaskDueDate("")
                  setNewTaskPriority("medium")
                }}
                className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#E5E5E7] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
