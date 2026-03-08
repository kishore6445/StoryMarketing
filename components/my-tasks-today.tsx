"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, Calendar, Zap, Clock, AlertCircle, Edit2, X, Loader2, LayoutGrid, Plus, User, Users, Upload, Trash2 } from "lucide-react"
import useSWR from "swr"
import { TaskKanban } from "./task-kanban"
import { SprintToolbarUnified } from "./sprint-toolbar-unified"
import { WarBar } from "./war-bar"
import { CriticalZoneBanner } from "./critical-zone-banner"
import { CollapsibleTodaysFocus } from "./collapsible-todays-focus"
import { cn } from "@/lib/utils"

export interface Task {
  id: string
  taskId?: string
  title: string
  description?: string
  completed: boolean
  clientName: string
  clientId?: string
  phaseName: string
  phaseId?: string
  sprintId?: string
  sectionName: string
  dueDate: string
  dueTime?: string
  promisedDate?: string
  promisedTime?: string
  assignedTo?: string
  priority: "low" | "medium" | "high"
  owner: string
  status: string
  type: "task" | "power_move" | "workflow_step" | "meeting_action_item"
  sopLink?: string
  department?: string
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export function MyTasksToday() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR("/api/my-tasks", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const { data: clientsData } = useSWR("/api/clients", fetcher, { revalidateOnFocus: false })
  const { data: sprintsData } = useSWR("/api/sprints", fetcher, { revalidateOnFocus: false })
  const { data: usersData } = useSWR("/api/users", fetcher, { revalidateOnFocus: false })
  const { data: currentUserProfile } = useSWR("/api/user/profile", fetcher, { revalidateOnFocus: false })
  const { data: individualSprintData } = useSWR("/api/individual-sprints", fetcher, { revalidateOnFocus: false })

  const tasks: Task[] = (data?.tasks || []).map((task: Task) => ({
    ...task,
    status: task.status || "todo",
  }))

  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [isCreating, setIsCreating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkActionMode, setBulkActionMode] = useState<"select" | "priority" | "status" | null>(null)
  const [viewPromisesOnly, setViewPromisesOnly] = useState(false)
  const [sprintFilter, setSprintFilter] = useState<"current-sprint" | "backlog">("current-sprint")
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    sprintId: "",
    phaseId: "story-research",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    dueTime: "",
    promisedDate: "",
    promisedTime: "",
    assigneeId: "",
    attachments: [] as Array<{ file: File; name: string }>,
  })

  const handleCreateFileChange = (files: FileList) => {
    const newFiles = Array.from(files).map((file) => ({ file, name: file.name }))
    setCreateFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles],
    }))
  }

  const removeCreateAttachment = (index: number) => {
    setCreateFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const clients = clientsData?.clients || []
  const sprints = sprintsData?.sprints || []
  const users = usersData?.users || []
  const currentUser = users && users.length > 0 ? users[0] : null

  // Get individual sprint (now primary, auto-created monthly)
  const individualSprint = individualSprintData || {
    id: "",
    user_id: currentUserProfile?.id || "",
    year_month: new Date().toISOString().slice(0, 7),
    tasks: [],
  }

  // Build display sprint - use individual sprint as primary header
  const monthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" })
  const isBacklogView = sprintFilter === "backlog"
  const sprint = {
    name: isBacklogView ? "Client Backlog" : `${monthName} Sprint`,
    client_name: "",
    end_date: individualSprintData?.end_date || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  }

  // Filter tasks based on sprint filter
  // Current Sprint: tasks added to individual sprint + overdue/due this month tasks
  // Backlog: all other tasks (future tasks, unscheduled)
  const sprintTaskIds = new Set(individualSprint.tasks?.map((t: any) => t.task_id || t.id) || [])
  
  // Get tasks due this month (or overdue)
  const currentDate = new Date()
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const isInCurrentMonth = (dateStr: string) => {
    if (!dateStr) return false
    const taskDate = new Date(dateStr)
    return taskDate >= monthStart && taskDate <= monthEnd
  }
  
  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false
    const taskDate = new Date(dateStr)
    return taskDate < currentDate
  }
  
  const displayTasks = sprintFilter === "current-sprint"
    ? tasks.filter(t => 
        sprintTaskIds.has(t.id) || // Explicitly added to sprint
        isOverdue(t.dueDate) ||      // Overdue tasks
        isInCurrentMonth(t.dueDate)  // Due this month
      )
    : sprintFilter === "backlog"
    ? tasks.filter(t => 
        !sprintTaskIds.has(t.id) &&  // Not in sprint
        !isOverdue(t.dueDate) &&     // Not overdue
        !isInCurrentMonth(t.dueDate) // Not due this month
      )
    : tasks

  console.log("[v0] Sprint filter:", sprintFilter)
  console.log("[v0] Individual sprint data:", individualSprintData)
  console.log("[v0] Sprint task IDs:", Array.from(sprintTaskIds))
  console.log("[v0] All tasks:", tasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate, isOverdue: isOverdue(t.dueDate), isThisMonth: isInCurrentMonth(t.dueDate) })))
  console.log("[v0] All tasks count:", tasks.length)
  console.log("[v0] Display tasks count:", displayTasks.length)


  const filteredSprints = sprints.filter(s => !createFormData.clientId || s.client_id === createFormData.clientId)

  // Helper function to get user initials
  const getUserInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.split(" ")
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase()
  }

  // Helper function to get avatar color based on name
  const getAvatarColor = (name?: string) => {
    if (!name) return "bg-[#007AFF]"
    const colors = [
      "bg-[#007AFF]",
      "bg-[#FF3B30]",
      "bg-[#34C759]",
      "bg-[#FF9500]",
      "bg-[#9370DB]",
    ]
    return colors[name.charCodeAt(0) % colors.length]
  }

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#FF3B30]"
      case "medium":
        return "bg-[#FF9500]"
      case "low":
        return "bg-[#34C759]"
      default:
        return "bg-[#86868B]"
    }
  }

  // Calculate power metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && !t.completed).length
  const today = new Date().toISOString().split("T")[0]
  const dueTodayTasks = tasks.filter((t) => t.dueDate === today && !t.completed).length
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < today && !t.completed).length

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterPriority !== "all" && task.priority !== filterPriority) return false
    if (selectedClient !== "all" && task.clientName !== clients.find((c) => c.id === selectedClient)?.name) return false
    return true
  })

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = task.completed ? "todo" : "done"
    const newCompleted = !task.completed

    // Optimistic update
    mutate(
      {
        tasks: tasks.map((t) =>
          t.id === taskId ? { ...t, completed: newCompleted, status: newStatus } : t
        ),
      },
      false
    )

    try {
      const token = localStorage.getItem("sessionToken")
      
      if (task.type === "power_move") {
        // Complete power move
        await fetch("/api/power-moves/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ powerMoveId: taskId, completed: newCompleted }),
        })
      } else if (task.type === "workflow_step") {
        // Approve workflow step
        await fetch("/api/workflow-steps/approve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workflowStepId: taskId, status: newCompleted ? "approved" : "pending" }),
        })
      } else if (task.type === "meeting_action_item") {
        // Complete meeting action item
        await fetch("/api/meetings/action-items/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ actionItemId: taskId, completed: newCompleted }),
        })
      } else {
        // Complete regular task
        await fetch("/api/tasks", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taskId, status: newStatus }),
        })
      }
      
      // Revalidate to confirm
      mutate()
    } catch {
      // Revert on error
      mutate()
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Optimistic update
    mutate(
      {
        tasks: tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      },
      false
    )

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
      mutate()
    } catch (error) {
      console.error("[v0] Error updating task status:", error)
      // Revert on error
      mutate()
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTaskIds)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTaskIds(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleBulkComplete = async () => {
    const token = localStorage.getItem("sessionToken")
    const selectedIds = Array.from(selectedTaskIds)
    
    // Optimistic update
    mutate(
      {
        tasks: tasks.map((t) =>
          selectedIds.includes(t.id) ? { ...t, completed: true, status: "done" } : t
        ),
      },
      false
    )

    try {
      await Promise.all(
        selectedIds.map((taskId) =>
          fetch("/api/tasks", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ taskId, completed: true, status: "done" }),
          })
        )
      )
      setSelectedTaskIds(new Set())
      setShowBulkActions(false)
      mutate()
    } catch (error) {
      console.error("[v0] Error completing tasks:", error)
      mutate()
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTaskIds.size} tasks? This cannot be undone.`)) return

    const token = localStorage.getItem("sessionToken")
    const selectedIds = Array.from(selectedTaskIds)
    
    // Optimistic update
    mutate(
      {
        tasks: tasks.filter((t) => !selectedIds.includes(t.id)),
      },
      false
    )

    try {
      await Promise.all(
        selectedIds.map((taskId) =>
          fetch("/api/tasks", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ taskId }),
          })
        )
      )
      setSelectedTaskIds(new Set())
      setShowBulkActions(false)
      mutate()
    } catch (error) {
      console.error("[v0] Error deleting tasks:", error)
      mutate()
    }
  }

  const clearSelection = () => {
    setSelectedTaskIds(new Set())
    setShowBulkActions(false)
    setBulkActionMode(null)
  }

  const handleCreateTask = async () => {
    if (!createFormData.title.trim() || !createFormData.clientId) return

    setIsCreating(true)
    const token = localStorage.getItem("sessionToken")
    try {
      console.log("[v0] Creating task with formData:", JSON.stringify(createFormData))
      const taskPayload = {
        ...createFormData,
        attachments: [],
      }
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskPayload),
      })
      const data = await res.json()
      console.log("[v0] Create task response:", res.status, JSON.stringify(data))
      if (!res.ok) {
        console.error("[v0] Task creation failed:", data)
        alert(`Task creation failed: ${data.error || "Unknown error"}`)
        return
      }

      const createdTaskId = data?.task?.id
      let uploadedFileMetadata: Array<{ name: string; url: string; size: number; mimeType: string }> = []

      if (createdTaskId && createFormData.attachments.length > 0) {
        const uploadResults = await Promise.all(
          createFormData.attachments.map(async (attachment) => {
            const uploadFormData = new FormData()
            uploadFormData.append("file", attachment.file)

            const uploadResponse = await fetch(`/api/tasks/${encodeURIComponent(createdTaskId)}/files`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: uploadFormData,
            })

            if (!uploadResponse.ok) {
              const uploadError = await uploadResponse.text()
              console.error("[v0] File upload failed:", uploadError)
              return null
            }

            const uploadedFile = await uploadResponse.json()
            return {
              name: uploadedFile.name,
              url: uploadedFile.url,
              size: uploadedFile.size,
              mimeType: uploadedFile.mime_type,
            }
          })
        )

        uploadedFileMetadata = uploadResults.filter((file): file is { name: string; url: string; size: number; mimeType: string } => file !== null)

        if (uploadedFileMetadata.length > 0) {
          const attachmentsPatchResponse = await fetch(`/api/tasks/${encodeURIComponent(createdTaskId)}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ attachments: uploadedFileMetadata }),
          })

          if (!attachmentsPatchResponse.ok) {
            console.error("[v0] Failed to persist attachments metadata:", await attachmentsPatchResponse.text())
          }
        }
      }

      setShowCreateModal(false)
      setCreateFormData({
        title: "",
        description: "",
        clientId: "",
        sprintId: "",
        phaseId: "story-research",
        priority: "medium",
        dueDate: "",
        dueTime: "",
        promisedDate: "",
        promisedTime: "",
        assigneeId: "",
        attachments: [],
      })
      console.log("[v0] Task created successfully, revalidating data")
      mutate()
    } catch (error) {
      console.error("[v0] Error creating task:", error)
      alert(`Error creating task: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditTask = (task: Task) => {
    if (task.type !== "task") {
      console.warn("[v0] Skipping task workspace navigation for non-task item type:", task.type)
      return
    }
    const taskIdentifier = task.id || task.taskId
    if (!taskIdentifier) {
      console.warn("[v0] Missing task identifier for navigation", task)
      return
    }
    router.push(`/tasks/${encodeURIComponent(taskIdentifier)}`)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const token = localStorage.getItem("sessionToken")
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: taskId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Error updating task status:", errorData.error || response.statusText)
        return
      }

      // Refresh tasks
      mutate()
    } catch (error) {
      console.error("[v0] Error changing task status:", error)
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC]">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#007AFF]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* War Room Signal - Subtle accent line */}
      <div className="fixed left-0 top-0 bottom-0 w-1 bg-[#007AFF] opacity-30 pointer-events-none z-40" />
      
      {/* Main Content Area */}
      <div className="ml-1">
        {/* Critical Zone Banner */}
        {data?.overdue_count > 0 && <CriticalZoneBanner overdueTasks={data.overdue_count} />}

        {/* Unified Sprint Toolbar - Single Row */}
        <SprintToolbarUnified
          userAvatar={currentUserProfile?.profile_photo_url}
          userName={currentUserProfile?.display_name || currentUserProfile?.full_name || "Team Member"}
          userRole={currentUserProfile?.role === "admin" ? "Administrator" : currentUserProfile?.role === "manager" ? "Manager" : "Team Operator"}
          personalTagline={currentUserProfile?.personal_motto || "Execution Over Excuses."}
          overdueCount={displayTasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date()).length}
          completedThisWeek={displayTasks.filter((t) => t.status === "done").length}
          sprintName={sprint?.name || "Your Monthly Sprint"}
          endDate={sprint?.end_date || new Date().toISOString()}
          taskCount={displayTasks.length}
          completedCount={displayTasks.filter((t) => t.status === "done").length}
          sprintFilter={sprintFilter}
          onSprintFilterChange={setSprintFilter}
          onAddTask={() => setShowCreateModal(true)}
        />

        {/* Kanban Board - Starts immediately after toolbar */}
        <div className="px-6 py-4">
          <TaskKanban
            tasks={displayTasks}
            onTaskStatusChange={handleStatusChange}
            isLoading={isLoading}
            onEditTask={handleEditTask}
            selectedTaskIds={selectedTaskIds}
            onToggleTaskSelection={toggleTaskSelection}
            showCheckboxes={false}
          />
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-8 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="type-h2">Create New Task</h2>
                <p className="type-caption text-[#86868B] mt-1">Add task details, timelines, and assignment</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-[#86868B]" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto flex-1">
            <div className="px-8 py-6 space-y-8">
              {/* Loading State */}
              {!clients.length || !sprints.length || !users.length ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-full mb-4">
                      <Loader2 className="w-5 h-5 text-[#007AFF] animate-spin" />
                    </div>
                    <p className="text-sm text-[#86868B]">Loading form data...</p>
                    {!clients.length && <p className="text-xs text-[#FF3B30] mt-2">Clients: {clients.length}</p>}
                    {!sprints.length && <p className="text-xs text-[#FF9500] mt-2">Sprints: {sprints.length}</p>}
                    {!users.length && <p className="text-xs text-[#FF9500] mt-2">Users: {users.length}</p>}
                  </div>
                </div>
              ) : (
                <>
              {/* Section 1: Task Basics */}
              <div className="space-y-4">
                <div className="type-caption text-[#6B7280] uppercase tracking-wider font-semibold">Task Details</div>
                
                {/* Task Title */}
                <div>
                  <label className="type-body font-medium text-[#1D1D1F] block mb-2">Task Title *</label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                    className="w-full type-body bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="type-body font-medium text-[#1D1D1F] block mb-2">Description</label>
                  <textarea
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    placeholder="Add task description, requirements, or notes..."
                    className="w-full type-body bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    rows={4}
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                  <label className="type-body font-medium text-[#1D1D1F] block mb-3">Attachments</label>
                  <div className="border-2 border-dashed border-[#007AFF] rounded-lg p-4 text-center bg-white">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => e.target.files && handleCreateFileChange(e.target.files)}
                      className="hidden"
                      id="create-task-file-input"
                      accept=".pdf,.jpg,.jpeg,.docx"
                    />
                    <label htmlFor="create-task-file-input" className="cursor-pointer block">
                      <Upload className="w-6 h-6 text-[#007AFF] mx-auto mb-2" />
                      <p className="text-sm font-medium text-[#1C1C1E]">Click to upload files</p>
                      <p className="text-xs text-[#86868B] mt-1">PDF, DOC, JPG, PNG, MP4, XLSX</p>
                    </label>
                  </div>

                  {createFormData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-36 overflow-y-auto">
                      {createFormData.attachments.map((attachment, index) => (
                        <div key={`${attachment.name}-${index}`} className="flex items-center justify-between bg-white border border-blue-200 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm text-[#1C1C1E] truncate">{attachment.name}</p>
                            <p className="text-xs text-[#86868B]">{(attachment.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCreateAttachment(index)}
                            className="p-1.5 hover:bg-red-100 rounded-md"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Client Selection & Sprint */}
              <div className="space-y-4">
                <div className="type-caption text-[#6B7280] uppercase tracking-wider font-semibold">Project Assignment</div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Client *</label>
                    <select
                      value={createFormData.clientId}
                      onChange={(e) => setCreateFormData({ ...createFormData, clientId: e.target.value, sprintId: "" })}
                      className="w-full type-body bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    >
                      <option value="">Select client</option>
                      {clients.map((client: any) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Sprint</label>
                    <select
                      value={createFormData.sprintId}
                      onChange={(e) => setCreateFormData({ ...createFormData, sprintId: e.target.value })}
                      className="w-full type-body bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    >
                      <option value="">Backlog (No Sprint)</option>
                      {filteredSprints.map((sprint: any) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Phase, Priority & Assignment */}
              <div className="space-y-4">
                <div className="type-caption text-[#6B7280] uppercase tracking-wider font-semibold">Task Settings</div>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Phase</label>
                    <select
                      value={createFormData.phaseId}
                      onChange={(e) => setCreateFormData({ ...createFormData, phaseId: e.target.value })}
                      className="w-full type-body bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    >
                      <option value="story-research">Story Research</option>
                      <option value="story-writing">Story Writing</option>
                      <option value="story-design-video">Story Design & Video</option>
                      <option value="story-website">Story Website</option>
                      <option value="story-distribution">Story Distribution</option>
                      <option value="story-analytics">Story Analytics</option>
                      <option value="story-learning">Story Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Priority</label>
                    <select
                      value={createFormData.priority}
                      onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value as "low" | "medium" | "high" })}
                      className="w-full type-body bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Assign To</label>
                    <select
                      value={createFormData.assigneeId}
                      onChange={(e) => setCreateFormData({ ...createFormData, assigneeId: e.target.value })}
                      className="w-full type-body bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    >
                      <option value="">Unassigned</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Internal Deadline (Team Commitment) */}
              <div className="bg-gradient-to-br from-[#F8F9FB] to-[#F0F4FF] border-2 border-[#E0E9FF] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#007AFF]"></div>
                  <div>
                    <h3 className="type-body font-semibold text-[#1C1C1E]">Internal Deadline</h3>
                    <p className="type-caption text-[#86868B]">When team commits work is ready internally</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Due Date</label>
                    <input
                      type="date"
                      value={createFormData.dueDate}
                      onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                      className="w-full type-body bg-white border border-[#E5E5E7] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Due Time</label>
                    <input
                      type="time"
                      value={createFormData.dueTime}
                      onChange={(e) => setCreateFormData({ ...createFormData, dueTime: e.target.value })}
                      className="w-full type-body bg-white border border-[#E5E5E7] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <p className="type-caption text-[#86868B] italic">Default: 5:00 PM for internal review buffer</p>
              </div>

              {/* Section 5: Client Promise (External Delivery) */}
              <div className="bg-gradient-to-br from-[#F0FFF4] to-[#E8FFF0] border-2 border-[#34C75933] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#34C759]"></div>
                  <div>
                    <h3 className="type-body font-semibold text-[#1C1C1E]">Client Promise</h3>
                    <p className="type-caption text-[#86868B]">When client expects delivery</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Promised Date</label>
                    <input
                      type="date"
                      value={createFormData.promisedDate}
                      onChange={(e) => setCreateFormData({ ...createFormData, promisedDate: e.target.value })}
                      className="w-full type-body bg-white border border-[#E5E5E7] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="type-body font-medium text-[#1D1D1F] block mb-2">Promised Time</label>
                    <input
                      type="time"
                      value={createFormData.promisedTime}
                      onChange={(e) => setCreateFormData({ ...createFormData, promisedTime: e.target.value })}
                      className="w-full type-body bg-white border border-[#E5E5E7] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <p className="type-caption text-[#86868B] italic">Default: 9:00 AM - client-facing commitment</p>
              </div>

              {/* Section 6: Buffer Info */}
              {createFormData.dueDate && createFormData.promisedDate && (
                <div className={cn(
                  "flex items-start gap-3 p-4 rounded-xl type-body",
                  createFormData.promisedDate > createFormData.dueDate
                    ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-800'
                    : createFormData.promisedDate === createFormData.dueDate
                    ? 'bg-amber-50 border-2 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-2 border-red-200 text-red-800'
                )}>
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">
                      {createFormData.promisedDate > createFormData.dueDate 
                        ? `✓ ${Math.ceil((new Date(createFormData.promisedDate).getTime() - new Date(createFormData.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days buffer for revisions`
                        : createFormData.promisedDate === createFormData.dueDate
                        ? "No buffer time for revisions"
                        : "Promised date is before due date"}
                    </p>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
            </div>

            {/* Create Modal Footer - Sticky */}
            <div className="sticky bottom-0 bg-white border-t border-[#E5E5E7] px-8 py-4 flex items-center justify-between gap-3">
              <div className="flex-1">
                {!createFormData.title.trim() && (
                  <p className="text-xs text-[#FF3B30]">Task title is required</p>
                )}
                {!createFormData.clientId && createFormData.title.trim() && (
                  <p className="text-xs text-[#FF3B30]">Client selection is required</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 type-body font-medium text-[#86868B] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!createFormData.title.trim() || !createFormData.clientId || isCreating}
                  className="px-6 py-2.5 type-body font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  title={!createFormData.title.trim() ? "Enter a task title" : !createFormData.clientId ? "Select a client" : "Create task"}
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
