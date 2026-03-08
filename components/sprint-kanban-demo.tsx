"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { ChevronDown, Calendar, Users, Zap, AlertCircle, Plus, Edit2, Trash2, X, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClient } from "@/contexts/client-context"

interface DemoTask {
  id: string
  title: string
  description: string
  status: "todo" | "in_progress" | "in_review" | "done"
  priority: "low" | "medium" | "high" | "critical"
  assignee: string
  dueDate: string
  phase: string
  taskId?: string
}

interface DemoSprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "planning" | "active" | "completed"
  tasks: DemoTask[]
}

interface DemoClient {
  id: string
  name: string
  phase: string
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

const KANBAN_COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-gray-50 border-gray-200" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-50 border-blue-200" },
  { id: "in_review", title: "In Review", color: "bg-purple-50 border-purple-200" },
  { id: "done", title: "Done", color: "bg-green-50 border-green-200" },
]

function SprintKanbanView({ sprint, tasks }: { sprint: DemoSprint; tasks: DemoTask[] }) {
  const sprintTasks = tasks || []
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    todo: false,
    in_progress: false,
    in_review: false,
    done: false,
  })

  const toggleColumnExpand = (columnId: string) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  // Helper functions
  const getPriorityBorderColor = (priority: string): string => {
    switch (priority) {
      case "critical":
        return "border-l-[#FF3B30]"
      case "high":
        return "border-l-[#FF9500]"
      case "normal":
      case "medium":
        return "border-l-[#007AFF]"
      case "low":
        return "border-l-[#86868B]"
      default:
        return "border-l-[#007AFF]"
    }
  }

  const getUrgencyIndicator = (dueDate: string): { color: string; label: string } | null => {
    if (!dueDate) return null

    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { color: "bg-[#FF3B30]", label: "Overdue" }
    } else if (diffDays === 0) {
      return { color: "bg-[#FF9500]", label: "Due today" }
    } else {
      return { color: "bg-[#86868B]", label: "Upcoming" }
    }
  }

  const formatDateShort = (dateString: string): string => {
    if (!dateString) return "No date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const CARD_LIMIT = 6
  
  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-3 min-w-max">
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = sprintTasks.filter((t) => t.status === column.id)
          const isExpanded = expandedColumns[column.id]
          const displayTasks = isExpanded ? columnTasks : columnTasks.slice(0, CARD_LIMIT)
          const hasMore = columnTasks.length > CARD_LIMIT
          const completionPercent =
            sprintTasks.length > 0
              ? (sprintTasks.filter((t) => t.status === "done").length / sprintTasks.length) * 100
              : 0

          return (
            <div
              key={column.id}
              className={cn("w-72 flex-shrink-0 flex flex-col rounded-xl border", column.color)}
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b font-semibold text-sm text-[#1D1D1F] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span>{column.title}</span>
                    <span className="px-2 py-1 bg-white/60 rounded text-xs font-medium text-[#86868B]">
                      {columnTasks.length}
                    </span>
                  </div>
                  {hasMore && !isExpanded && (
                    <div className="text-xs text-[#86868B] font-normal mt-1">
                      Showing {Math.min(CARD_LIMIT, columnTasks.length)} of {columnTasks.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[400px]">
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-center">
                    <p className="text-xs text-[#86868B]">No tasks</p>
                  </div>
                ) : (
                  <>
                    {displayTasks.map((task) => {
                      const urgencyInfo = getUrgencyIndicator(task.dueDate)
                      const borderColor = getPriorityBorderColor(task.priority)

                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "bg-white border-l-4 rounded-lg p-3 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-move group",
                            "border border-[#E5E5E7]",
                            borderColor
                          )}
                        >
                          {/* Task ID / Project Badge */}
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wide">
                              {task.taskId || task.id.slice(0, 6).toUpperCase()}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-sm font-semibold text-[#1D1D1F] mb-2 line-clamp-2 leading-snug">
                            {task.title}
                          </h4>

                          {/* Due Date + Urgency Indicator */}
                          <div className="flex items-center gap-2 text-xs text-[#86868B]">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{formatDateShort(task.dueDate)}</span>
                            {urgencyInfo && (
                              <div
                                className={cn("w-2 h-2 rounded-full flex-shrink-0", urgencyInfo.color)}
                                title={urgencyInfo.label}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Toggle Button */}
                    {hasMore && (
                      <button
                        onClick={() => toggleColumnExpand(column.id)}
                        className="w-full mt-2 py-2 px-3 text-xs font-medium text-[#007AFF] hover:bg-[#F5F5F7] rounded-lg transition-all border border-[#E5E5E7] hover:border-[#007AFF]"
                      >
                        {isExpanded ? "Show less" : `Show more (${columnTasks.length - CARD_LIMIT})`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SprintKanbanDemo() {
  const { selectedClientId } = useClient()
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string>("")
  const [showCreateSprintModal, setShowCreateSprintModal] = useState(false)
  const [showEditSprintModal, setShowEditSprintModal] = useState(false)
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null)
  const [sprintFormData, setSprintFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "planning" as "planning" | "active" | "completed",
  })

  // Fetch clients from API
  const { data: clientsData } = useSWR("/api/clients", fetcher)
  const clients = clientsData?.clients || []

  // Fetch sprints from API
  const { data: sprintsData, mutate: mutateSprints } = useSWR(
    `/api/account-manager/sprints?clientId=${selectedClientId || 'all'}`,
    fetcher,
    { refreshInterval: 5000 }
  )
  const sprints = sprintsData?.sprints || []

  // Fetch tasks from API
  const { data: tasksData, mutate: mutateTasks } = useSWR(
    `/api/account-manager/tasks?clientId=${selectedClientId || 'all'}`,
    fetcher,
    { refreshInterval: 5000 }
  )
  const allTasks = tasksData?.tasks || []
  const backlogItems = allTasks.filter((t: DemoTask) => !t.sprint_id)

  // Set initial selectedWeek when sprints load
  useEffect(() => {
    if (sprints.length > 0 && !selectedWeek) {
      const firstActiveSprint = sprints.find((s: DemoSprint) => s.status === "active")
      const firstSprint = firstActiveSprint || sprints[0]
      setSelectedWeek(firstSprint?.id || "")
      setExpandedSprint(firstSprint?.id || null)
    }
  }, [sprints, selectedWeek])

  const currentClient = clients.find((c: DemoClient) => c.id === selectedClientId)
  const activeSprints = sprints.filter((s: DemoSprint) => s.status === "active")
  const planningSprints = sprints.filter((s: DemoSprint) => s.status === "planning")
  const completedSprints = sprints.filter((s: DemoSprint) => s.status === "completed")

  // Sprint CRUD Operations
  const handleCreateSprint = async () => {
    if (!sprintFormData.name.trim() || !sprintFormData.startDate || !sprintFormData.endDate) return
    
    const token = localStorage.getItem("sessionToken")
    const response = await fetch("/api/account-manager/sprints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...sprintFormData,
        clientId: selectedClientId,
      }),
    })

    if (response.ok) {
      mutateSprints()
      setShowCreateSprintModal(false)
      setSprintFormData({ name: "", startDate: "", endDate: "", status: "planning" })
    }
  }

  const handleEditSprint = async () => {
    if (!sprintFormData.name.trim() || !editingSprintId) return
    
    const token = localStorage.getItem("sessionToken")
    const response = await fetch(`/api/account-manager/sprints/${editingSprintId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(sprintFormData),
    })

    if (response.ok) {
      mutateSprints()
      setShowEditSprintModal(false)
      setEditingSprintId(null)
      setSprintFormData({ name: "", startDate: "", endDate: "", status: "planning" })
    }
  }

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm("Are you sure you want to delete this sprint?")) return

    const token = localStorage.getItem("sessionToken")
    const response = await fetch(`/api/account-manager/sprints/${sprintId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      mutateSprints()
      if (selectedWeek === sprintId) {
        const remainingSprints = sprints.filter((s: DemoSprint) => s.id !== sprintId)
        setSelectedWeek(remainingSprints[0]?.id || "")
      }
    }
  }

  const handleEditSprintClick = (sprint: DemoSprint) => {
    setEditingSprintId(sprint.id)
    setSprintFormData({
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
    })
    setShowEditSprintModal(true)
  }

  // Get unique assignees and team members
  const allAssignees = Array.from(new Set(allTasks.map((t: DemoTask) => t.assignee).filter(Boolean))).sort()

  // Empty state check
  if (!sprints || sprints.length === 0) {
    return (
      <div className="space-y-6 max-w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Sprint Management</h3>
            <p className="text-sm text-[#86868B] mt-1">Create your first sprint to get started</p>
          </div>
          <button
            onClick={() => setShowCreateSprintModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Sprint
          </button>
        </div>

        <div className="border-2 border-dashed border-[#E5E5E7] rounded-xl p-12 text-center bg-[#FAFBFC]">
          <Inbox className="w-16 h-16 text-[#D1D1D6] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">No sprints yet</h3>
          <p className="text-sm text-[#86868B] max-w-md mx-auto">
            Get started by creating your first sprint. Sprints help you organize tasks into time-boxed iterations.
          </p>
        </div>

        {/* Create Sprint Modal */}
        {showCreateSprintModal && (
          <SprintModal
            title="Create New Sprint"
            formData={sprintFormData}
            setFormData={setSprintFormData}
            onSave={handleCreateSprint}
            onCancel={() => {
              setShowCreateSprintModal(false)
              setSprintFormData({ name: "", startDate: "", endDate: "", status: "planning" })
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Client and Week Selectors - Enhanced UI */}
      <div className="bg-gradient-to-r from-[#F5F5F7] to-[#EFEFEF] border border-[#E5E5E7] rounded-xl p-5 flex items-center justify-between gap-6">
        {/* Current Client Display */}
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-[#007AFF] rounded-lg p-2.5 flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wide">Current Client</div>
            <div className="text-sm font-medium text-[#1D1D1F]">
              {currentClient?.name || "All Clients"}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-[#E5E5E7]" />

        {/* Select Week - Enhanced */}
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-[#FF9500] rounded-lg p-2.5 flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="week-select" className="text-xs font-semibold text-[#86868B] uppercase tracking-wide">
              Select Sprint
            </label>
            <select
              id="week-select"
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value)
                setExpandedSprint(e.target.value)
              }}
              className="px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm font-medium text-[#1D1D1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] hover:border-[#D1D1D6] transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231D1D1F' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                paddingRight: '28px',
              }}
            >
              {sprints.map((sprint: DemoSprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Sprint Button */}
        <button
          onClick={() => setShowCreateSprintModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Sprint
        </button>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs text-blue-600 font-medium uppercase mb-1">Active</div>
          <div className="text-2xl font-bold text-blue-900">{activeSprints.length}</div>
          <div className="text-xs text-blue-600 mt-2">
            {allTasks.filter((t: DemoTask) => activeSprints.some((s: DemoSprint) => s.id === t.sprint_id)).length} tasks
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-xs text-purple-600 font-medium uppercase mb-1">Planning</div>
          <div className="text-2xl font-bold text-purple-900">{planningSprints.length}</div>
          <div className="text-xs text-purple-600 mt-2">Next up</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-600 font-medium uppercase mb-1">Completed</div>
          <div className="text-2xl font-bold text-gray-900">{completedSprints.length}</div>
          <div className="text-xs text-gray-600 mt-2">Sprints</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs text-green-600 font-medium uppercase mb-1">Completed Tasks</div>
          <div className="text-2xl font-bold text-green-900">
            {allTasks.filter((t: DemoTask) => t.status === "done").length}
          </div>
          <div className="text-xs text-green-600 mt-2">Total</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-xs text-orange-600 font-medium uppercase mb-1">Team Members</div>
          <div className="text-2xl font-bold text-orange-900">{allAssignees.length}</div>
          <div className="text-xs text-orange-600 mt-2">Active</div>
        </div>
      </div>

      {/* Active Sprints */}
      {activeSprints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#007AFF]" />
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Currently Running</h3>
          </div>
          <div className="space-y-3">
            {activeSprints.map((sprint: DemoSprint) => {
              const sprintTasks = allTasks.filter((t: DemoTask) => t.sprint_id === sprint.id)
              const completedTasks = sprintTasks.filter((t: DemoTask) => t.status === "done").length
              const progressPercent = sprintTasks.length > 0 ? (completedTasks / sprintTasks.length) * 100 : 0

              return (
                <div key={sprint.id} className="border border-[#E5E5E7] rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setExpandedSprint(expandedSprint === sprint.id ? null : sprint.id)}
                    className="w-full px-4 py-4 flex items-start justify-between hover:bg-[#F5F5F7] transition-all"
                  >
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-[#1D1D1F] mb-2">{sprint.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#86868B] mb-3">
                        <Calendar className="w-3 h-3" />
                        {sprint.start_date} → {sprint.end_date}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#86868B]">Progress</span>
                          <span className="text-[#1D1D1F] font-medium">
                            {completedTasks}/{sprintTasks.length} tasks
                          </span>
                        </div>
                        <div className="w-48 bg-[#E5E5E7] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#007AFF] h-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-xs font-medium">
                        Active
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSprintClick(sprint)
                        }}
                        className="p-1 hover:bg-[#E5E5E7] rounded transition-all"
                        title="Edit sprint"
                      >
                        <Edit2 className="w-4 h-4 text-[#86868B]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSprint(sprint.id)
                        }}
                        className="p-1 hover:bg-[#FFE5E5] rounded transition-all"
                        title="Delete sprint"
                      >
                        <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                      </button>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-[#86868B] transition-transform",
                          expandedSprint === sprint.id && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded Kanban View */}
                  {expandedSprint === sprint.id && (
                    <div className="px-4 py-4 border-t border-[#E5E5E7] bg-[#FAFBFC]">
                      <p className="text-xs text-[#86868B] font-medium mb-3">Kanban View</p>
                      <SprintKanbanView sprint={sprint} tasks={sprintTasks} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Planning Sprints */}
      {planningSprints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF9500]" />
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Upcoming Sprints</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {planningSprints.map((sprint: DemoSprint) => {
              const sprintTaskCount = allTasks.filter((t: DemoTask) => t.sprint_id === sprint.id).length
              return (
                <div
                  key={sprint.id}
                  className="border border-[#E5E5E7] rounded-lg p-3 bg-[#FFFBF0] hover:bg-[#FFF8E6] transition-all cursor-pointer group"
                >
                  <h4 className="font-medium text-[#1D1D1F] text-sm truncate">{sprint.name}</h4>
                  <div className="text-xs text-[#86868B] mt-1 line-clamp-1">{sprint.start_date}</div>
                  <div className="mt-2 text-xs font-medium text-[#FF9500]">{sprintTaskCount} tasks planned</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Sprints */}
      {completedSprints.length > 0 && (
        <div className="space-y-3">
          <details className="group">
            <summary className="cursor-pointer flex items-center gap-2 font-semibold text-[#1D1D1F] text-sm">
              <ChevronDown className="w-4 h-4 text-[#86868B] group-open:rotate-180 transition-transform" />
              <span>Completed Sprints</span>
            </summary>
            <div className="space-y-2 mt-3">
              {completedSprints.map((sprint: DemoSprint) => {
                const sprintTaskCount = allTasks.filter((t: DemoTask) => t.sprint_id === sprint.id).length
                return (
                  <div key={sprint.id} className="border border-[#E5E5E7] rounded-lg p-3 bg-[#F5FFF5]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#1D1D1F]">{sprint.name}</h4>
                      <span className="text-xs bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded">Completed</span>
                    </div>
                    <div className="text-xs text-[#86868B] mt-1">{sprint.end_date}</div>
                    <div className="text-xs text-[#34C759] font-medium mt-1">{sprintTaskCount} tasks delivered</div>
                  </div>
                )
              })}
            </div>
          </details>
        </div>
      )}

      {/* Backlog Section */}
      <div className="space-y-3">
        <details className="group">
          <summary className="cursor-pointer flex items-center gap-2 font-semibold text-[#1D1D1F] text-sm">
            <ChevronDown className="w-4 h-4 text-[#86868B] group-open:rotate-180 transition-transform" />
            <span>Backlog (Unscheduled)</span>
            <span className="ml-auto text-xs font-medium text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded">
              {backlogItems.length} tasks
            </span>
          </summary>
          <div className="space-y-2 mt-3 max-h-96 overflow-y-auto">
            {backlogItems.map((task: DemoTask) => (
              <div key={task.id} className="border border-[#E5E5E7] rounded-lg p-3 bg-white hover:bg-[#F5F5F7] transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium text-[#1D1D1F] flex-1 line-clamp-2">{task.title}</h4>
                  <span
                    className={cn(
                      "flex-shrink-0 px-2 py-1 rounded text-xs font-medium text-white",
                      task.priority === "high"
                        ? "bg-[#FF3B30]"
                        : task.priority === "medium"
                          ? "bg-[#FF9500]"
                          : "bg-[#34C759]"
                    )}
                  >
                    {task.priority.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#86868B] mb-3 line-clamp-2">{task.description}</p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#86868B] italic">No due date</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#007AFF] bg-[#E3F2FF] px-2 py-1 rounded">
                      {task.phase || "Backlog"}
                    </span>
                    <span className="bg-[#F5F5F7] text-[#1D1D1F] px-1.5 py-0.5 rounded text-xs font-medium truncate max-w-[50%]">
                      {(task as any).assigned_user?.full_name?.split(" ")[0] || task.assignee?.split(" ")[0] || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Create Sprint Modal */}
      {showCreateSprintModal && (
        <SprintModal
          title="Create New Sprint"
          formData={sprintFormData}
          setFormData={setSprintFormData}
          onSave={handleCreateSprint}
          onCancel={() => {
            setShowCreateSprintModal(false)
            setSprintFormData({ name: "", startDate: "", endDate: "", status: "planning" })
          }}
        />
      )}

      {/* Edit Sprint Modal */}
      {showEditSprintModal && (
        <SprintModal
          title="Edit Sprint"
          formData={sprintFormData}
          setFormData={setSprintFormData}
          onSave={handleEditSprint}
          onCancel={() => {
            setShowEditSprintModal(false)
            setEditingSprintId(null)
            setSprintFormData({ name: "", startDate: "", endDate: "", status: "planning" })
          }}
        />
      )}
    </div>
  )
}

// Sprint Modal Component
function SprintModal({
  title,
  formData,
  setFormData,
  onSave,
  onCancel,
}: {
  title: string
  formData: { name: string; startDate: string; endDate: string; status: string }
  setFormData: (data: any) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#E5E5E7] rounded-lg w-full max-w-md shadow-lg">
        <div className="p-6 border-b border-[#E5E5E7] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-all">
            <X className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Sprint Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Week 4: Mar 9 - Mar 15"
              className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-[#E5E5E7] flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#1D1D1F] border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#007AFF] rounded-lg hover:opacity-90 transition-all"
          >
            {title.includes("Create") ? "Create Sprint" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
