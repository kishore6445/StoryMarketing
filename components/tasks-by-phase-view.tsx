"use client"

import { Clock, CheckCircle2, AlertCircle, Plus, Paperclip, X as XIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Task {
  id: string
  title: string
  dueDate: string
  assignedTo: string
  status: "todo" | "in_progress" | "in_review" | "done"
}

interface TasksByPhaseViewProps {
  phases: Record<string, Task[]>
  isLoading: boolean
  clientId?: string
  onTaskAdded?: () => void
  teamMembers?: Array<{ id: string; full_name: string; email: string }>
  sprints?: Array<{ id: string; name: string; start_date: string; end_date: string }>
}

const STORY_PHASES = [
  "Story Research",
  "Story Writing",
  "Story Design & Video",
  "Story Website",
  "Story Distribution",
  "Story Analytics",
  "Story Learning",
]

interface NewTaskForm {
  title: string
  phase: string
  dueDate: string
  dueTime?: string
  assignedTo: string
  sprintId: string
  priority: "low" | "medium" | "high"
  description: string
  attachment: File | null
  attachmentName: string
}

// Phase columns for kanban display - each phase becomes a column
const phaseColumns = [
  { id: "todo", title: "TO DO", phase: "Story Research" },
  { id: "in_progress", title: "IN PROGRESS", phase: "Story Writing" },
  { id: "in_review", title: "IN REVIEW", phase: "Story Design & Video" },
  { id: "done", title: "DONE", phase: "Story Distribution" },
]

export function TasksByPhaseView({ phases, isLoading, clientId, onTaskAdded, teamMembers = [], sprints = [] }: TasksByPhaseViewProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedPhaseForAdd, setSelectedPhaseForAdd] = useState<string>(STORY_PHASES[0])
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    phase: "Story Research",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    dueTime: "",
    assignedTo: "",
    sprintId: "",
    priority: "medium",
    description: "",
    attachment: null,
    attachmentName: "",
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !clientId) return

    setIsCreating(true)
    try {
      const token = localStorage.getItem("sessionToken")
      
      const formData = new FormData()
      formData.append("title", newTask.title)
      formData.append("description", newTask.description)
      formData.append("clientId", clientId)
      formData.append("phase", newTask.phase)
      formData.append("dueDate", newTask.dueDate)
      formData.append("dueTime", newTask.dueTime || "")
      formData.append("assignedTo", newTask.assignedTo)
      formData.append("sprintId", newTask.sprintId || "")
      formData.append("priority", newTask.priority)
      
      if (newTask.attachment) {
        formData.append("attachment", newTask.attachment)
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setNewTask({
          title: "",
          phase: "Story Research",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          dueTime: "",
          assignedTo: "",
          sprintId: "",
          priority: "medium",
          description: "",
          attachment: null,
          attachmentName: "",
        })
        setShowAddTask(false)
        onTaskAdded?.()
      }
    } catch (error) {
      console.error("[v0] Error creating task:", error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Clock className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3" />
        <p className="text-[#86868B]">Loading tasks...</p>
      </div>
    )
  }

  const hasAnyTasks = Object.values(phases).some((tasks) => tasks.length > 0)

  return (
    <div className="space-y-4">
      {/* Add Task Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0066E8] text-white rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center z-40"
        title="New Task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E5E5E7] sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Add Task to Sprint</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add task description (optional)"
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"
                  rows={3}
                />
              </div>

              {/* Story Phase and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Story Phase *</label>
                  <select
                    value={newTask.phase}
                    onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    {STORY_PHASES.map((phase) => (
                      <option key={phase} value={phase}>
                        {phase}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              </div>

              {/* Due Time */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Due Time (Optional)</label>
                <input
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              {/* Assignee and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Sprint Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Add to Sprint (Optional)</label>
                <select
                  value={newTask.sprintId}
                  onChange={(e) => setNewTask({ ...newTask, sprintId: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                >
                  <option value="">Not in a sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.start_date} - {sprint.end_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Attachment (Optional)</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center px-4 py-2 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer transition-all">
                    <Paperclip className="w-4 h-4 text-[#86868B] mr-2" />
                    <span className="text-sm text-[#86868B] truncate">
                      {newTask.attachmentName || "Choose file"}
                    </span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setNewTask({
                            ...newTask,
                            attachment: file,
                            attachmentName: file.name,
                          })
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {newTask.attachment && (
                    <button
                      onClick={() =>
                        setNewTask({
                          ...newTask,
                          attachment: null,
                          attachmentName: "",
                        })
                      }
                      className="px-3 py-2 hover:bg-[#F5F5F7] rounded-lg transition-all"
                    >
                      <XIcon className="w-4 h-4 text-[#86868B]" />
                    </button>
                  )}
                </div>
                {newTask.attachment && (
                  <p className="text-xs text-[#86868B] mt-2">
                    File: {newTask.attachmentName}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#E5E5E7] flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddTask(false)}
                className="flex-1 px-4 py-2 bg-white border border-[#E5E5E7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#F5F5F7] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim() || !newTask.dueDate || isCreating}
                className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isCreating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAnyTasks && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-8 h-8 text-[#D1D1D6] mx-auto mb-3" />
          <p className="text-[#1D1D1F] font-medium mb-1">No tasks scheduled</p>
          <p className="text-sm text-[#86868B]">All phases are clear. Great work!</p>
        </div>
      )}

      {/* Kanban Board - Elite Console Layout */}
      {hasAnyTasks && (
        <div className="bg-[#FAFAFA] rounded-lg p-4">
          <div className="flex gap-4 overflow-x-auto">
            {/* Render phases as kanban columns */}
            {STORY_PHASES.map((phase, index) => {
              const phaseTasks = phases[phase] || []
              const columnStatus = ["todo", "in_progress", "in_review", "done"][Math.min(index, 3)]
              
              return (
                <div
                  key={phase}
                  className={cn(
                    "flex-1 min-w-[240px] max-w-[350px] flex flex-col rounded-xl border-2 transition-all duration-150",
                    "border-[#E5E5E7] shadow-sm hover:shadow-md",
                    columnStatus === "in_progress"
                      ? "bg-[#F7F7F8] border-[#D1D1D6]"
                      : "bg-white"
                  )}
                >
                  {/* Column Header */}
                  <div className={cn(
                    "sticky top-0 z-10 px-3 py-2.5 flex items-center justify-between transition-all",
                    "border-b-2 border-l-3",
                    columnStatus === "in_progress"
                      ? "bg-[#F7F7F8] border-b-[#C5C5CA] border-l-blue-600"
                      : "bg-white border-b-[#D5D5D9] border-l-slate-300"
                  )}>
                    <h3 className="font-black text-[#111111] text-xs uppercase tracking-widest leading-tight">
                      {phase} <span className="font-black text-[#111111]">({phaseTasks.length})</span>
                    </h3>
                  </div>

                  {/* Tasks Container */}
                  <div className="flex-1 px-3.5 py-2 space-y-1 overflow-y-auto max-h-[600px] transition-all">
                    {phaseTasks.length === 0 ? (
                      <div className="text-center py-8 text-[#86868B]">
                        <p className="text-xs">No tasks</p>
                      </div>
                    ) : (
                      phaseTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "p-1.25 rounded-md border cursor-pointer group relative bg-white",
                            "transition-all duration-150 ease-out",
                            "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1",
                            "border-[#E5E7EB] shadow-sm"
                          )}
                        >
                          <div className="space-y-0.25">
                            {/* Title */}
                            <h4 className="text-xs font-semibold text-[#111111] flex-1 line-clamp-2 group-hover:font-bold transition-all leading-snug">
                              {task.title}
                            </h4>

                            {/* Assigned To - Metadata */}
                            {task.assignedTo && (
                              <div className="text-[11px] text-[#6B7280] font-medium leading-snug opacity-75">
                                {task.assignedTo}
                              </div>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                              <div className="text-[10px] text-[#6B7280] font-medium leading-snug opacity-70">
                                Due {task.dueDate}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function TasksByPhaseView({ phases, isLoading, clientId, onTaskAdded, teamMembers = [], sprints = [] }: TasksByPhaseViewProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<string>(STORY_PHASES[0])
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    phase: "Story Research",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignedTo: "",
    sprintId: "",
    priority: "medium",
    description: "",
    attachment: null,
    attachmentName: "",
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !clientId) return

    setIsCreating(true)
    try {
      const token = localStorage.getItem("sessionToken")
      
      // Prepare FormData for file upload if attachment exists
      const formData = new FormData()
      formData.append("title", newTask.title)
      formData.append("description", newTask.description)
      formData.append("clientId", clientId)
      formData.append("phase", newTask.phase)
      formData.append("dueDate", newTask.dueDate)
      formData.append("assignedTo", newTask.assignedTo)
      formData.append("sprintId", newTask.sprintId || "")
      formData.append("priority", newTask.priority)
      
      if (newTask.attachment) {
        formData.append("attachment", newTask.attachment)
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setNewTask({
          title: "",
          phase: "Story Research",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          assignedTo: "",
          sprintId: "",
          priority: "medium",
          description: "",
          attachment: null,
          attachmentName: "",
        })
        setShowAddTask(false)
        onTaskAdded?.()
      }
    } catch (error) {
      console.error("[v0] Error creating task:", error)
    } finally {
      setIsCreating(false)
    }
  }
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Clock className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3" />
        <p className="text-[#86868B]">Loading sprint tasks...</p>
      </div>
    )
  }

  const hasAnyTasks = Object.values(phases).some((tasks) => tasks.length > 0)

  return (
    <div className="space-y-4">
      {/* Add Task Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="w-full px-4 py-3 border-2 border-dashed border-[#007AFF] rounded-lg text-[#007AFF] font-medium hover:bg-[#007AFF]/5 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Task to Sprint
      </button>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E5E5E7] sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Add Task to Sprint</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add task description (optional)"
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"
                  rows={3}
                />
              </div>

              {/* Two-column layout for dates and phase */}
              <div className="grid grid-cols-2 gap-4">
                {/* Story Phase */}
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Story Phase *</label>
                  <select
                    value={newTask.phase}
                    onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    {STORY_PHASES.map((phase) => (
                      <option key={phase} value={phase}>
                        {phase}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              </div>

              {/* Assignee and Priority */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                    className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Sprint Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Add to Sprint (Optional)</label>
                <select
                  value={newTask.sprintId}
                  onChange={(e) => setNewTask({ ...newTask, sprintId: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                >
                  <option value="">Not in a sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.start_date} - {sprint.end_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Attachment (Optional)</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center px-4 py-2 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer transition-all">
                    <Paperclip className="w-4 h-4 text-[#86868B] mr-2" />
                    <span className="text-sm text-[#86868B] truncate">
                      {newTask.attachmentName || "Choose file"}
                    </span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setNewTask({
                            ...newTask,
                            attachment: file,
                            attachmentName: file.name,
                          })
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {newTask.attachment && (
                    <button
                      onClick={() =>
                        setNewTask({
                          ...newTask,
                          attachment: null,
                          attachmentName: "",
                        })
                      }
                      className="px-3 py-2 hover:bg-[#F5F5F7] rounded-lg transition-all"
                    >
                      <XIcon className="w-4 h-4 text-[#86868B]" />
                    </button>
                  )}
                </div>
                {newTask.attachment && (
                  <p className="text-xs text-[#86868B] mt-2">
                    File: {newTask.attachmentName}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#E5E5E7] flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddTask(false)}
                className="flex-1 px-4 py-2 bg-white border border-[#E5E5E7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#F5F5F7] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim() || !newTask.dueDate || isCreating}
                className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isCreating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAnyTasks && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-8 h-8 text-[#D1D1D6] mx-auto mb-3" />
          <p className="text-[#1D1D1F] font-medium mb-1">No tasks scheduled</p>
          <p className="text-sm text-[#86868B]">All phases are clear for this week. Great work!</p>
        </div>
      )}

      {/* Phase Navigation & Content */}
      {hasAnyTasks && (
        <div className="space-y-4">
          {/* Horizontal Phase Tabs */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E5E5E7]">
            {STORY_PHASES.map((phase) => {
              const phaseTaskCount = (phases[phase] || []).length
              const isSelected = selectedPhase === phase
              const [borderColor, _] = Object.entries(phaseColors[phase]).find(([k, v]) => k.startsWith('border')) || []
              
              return (
                <button
                  key={phase}
                  onClick={() => setSelectedPhase(phase)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    isSelected
                      ? "bg-[#007AFF] text-white"
                      : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]"
                  )}
                >
                  {phase.replace("Story ", "")}
                  {phaseTaskCount > 0 && (
                    <span className={cn(
                      "ml-1.5 px-1.5 rounded text-xs font-semibold",
                      isSelected ? "bg-white/30" : "bg-[#E5E5E7]"
                    )}>
                      {phaseTaskCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected Phase Content */}
          {selectedPhase && (
            <div className={cn("rounded-lg border-l-4 p-5", phaseColors[selectedPhase])}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1D1D1F] text-base">{selectedPhase}</h3>
                <button
                  onClick={() => {
                    setNewTask({ ...newTask, phase: selectedPhase })
                    setShowAddTask(true)
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E5E5E7] rounded text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>

              {(() => {
                const tasks = phases[selectedPhase] || []
                return tasks.length === 0 ? (
                  <div className="text-center py-6 text-[#86868B]">
                    <p className="text-sm">No tasks in this phase yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.todo
                      return (
                        <div
                          key={task.id}
                          className="bg-white border border-[#E5E5E7] rounded-lg p-3 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-medium text-[#1D1D1F] text-sm flex-1">{task.title}</p>
                            <span
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-white flex-shrink-0",
                                status.color
                              )}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#86868B]">
                            <span>Due: {task.dueDate}</span>
                            <span className="bg-[#F5F5F7] px-2.5 py-1 rounded">
                              {task.assignedTo}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
