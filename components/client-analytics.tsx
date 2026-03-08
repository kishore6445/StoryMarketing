"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Copy, Check, Download, Search, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientTask {
  id: string
  taskId?: string
  title: string
  clientName: string
  clientId: string
  dueDate?: string
  dueTime?: string
  promisedDate: string
  promisedTime?: string
  status?: "todo" | "in_progress" | "in_review" | "done"
}

interface GroupedTasks {
  [clientId: string]: {
    clientName: string
    tasks: ClientTask[]
  }
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export function ClientAnalytics() {
  const { data, isLoading } = useSWR("/api/my-tasks", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["todo", "in_progress"]) // Default to To Do and In Progress
  const [dateType, setDateType] = useState<"due" | "promised">("promised")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [showClientFilter, setShowClientFilter] = useState(false)
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showDateFilter, setShowDateFilter] = useState(false)

  // Close dropdowns when component unmounts
  useEffect(() => {
    return () => {
      setShowClientFilter(false)
      setShowStatusFilter(false)
      setShowDateFilter(false)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowClientFilter(false)
      setShowStatusFilter(false)
      setShowDateFilter(false)
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const tasks: ClientTask[] = (data?.tasks || [])
    .filter((task: any) => task.promisedDate || task.dueDate) // Show tasks with either date
    .map((task: any) => ({
      id: task.id,
      taskId: task.taskId,
      title: task.title,
      clientName: task.clientName,
      clientId: task.clientId || task.id,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      promisedDate: task.promisedDate,
      promisedTime: task.promisedTime,
      status: task.status || "todo", // Default to 'todo' if no status
    }))

  // Get unique clients for filter
  const uniqueClients = Array.from(
    new Map(tasks.map((task) => [task.clientId, task.clientName])).entries()
  ).map(([id, name]) => ({ id, name }))

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "in_review", label: "In Review" },
    { value: "done", label: "Done" },
  ]

  // Helper to get the active date based on selection
  const getTaskDate = (task: ClientTask) => {
    if (dateType === "due") {
      return task.dueDate || task.promisedDate
    }
    return task.promisedDate || task.dueDate
  }

  // Group tasks by client
  const groupedTasks: GroupedTasks = tasks.reduce((acc: GroupedTasks, task: ClientTask) => {
    if (!acc[task.clientId]) {
      acc[task.clientId] = {
        clientName: task.clientName,
        tasks: [],
      }
    }
    acc[task.clientId].tasks.push(task)
    return acc
  }, {})

  // Apply all filters
  const filteredGroups = Object.entries(groupedTasks)
    .map(([clientId, group]) => {
      // Filter clients
      if (selectedClients.length > 0 && !selectedClients.includes(clientId)) {
        return null
      }

      // Filter tasks within the group
      let filteredTasks = group.tasks.filter((task) => {
        const term = searchTerm.toLowerCase()
        const matchesSearch = !searchTerm || task.title.toLowerCase().includes(term) || task.taskId?.toLowerCase().includes(term)

        // Filter by status - only show selected statuses
        const taskStatus = task.status || "todo"
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(taskStatus)) {
          return false
        }

        // Filter by date range using active date type
        if (dateRange.start || dateRange.end) {
          const taskDate = getTaskDate(task)
          if (!taskDate) return false
          
          const dateObj = new Date(taskDate)
          if (dateRange.start && dateObj < new Date(dateRange.start)) return false
          if (dateRange.end && dateObj > new Date(dateRange.end)) return false
        }

        return matchesSearch
      })

      return filteredTasks.length > 0
        ? [clientId, { ...group, tasks: filteredTasks }]
        : null
    })
    .filter((item) => item !== null) as Array<[string, any]>

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "done":
        return { bg: "#E8F5E9", text: "#2E7D32", label: "Done" }
      case "in_review":
        return { bg: "#FFF3E0", text: "#E65100", label: "In Review" }
      case "in_progress":
        return { bg: "#E3F2FD", text: "#1565C0", label: "In Progress" }
      case "todo":
      default:
        return { bg: "#F5F5F7", text: "#86868B", label: "To Do" }
    }
  }

  const formatTasksForWhatsApp = (clientName: string, tasks: ClientTask[]) => {
    const formattedTasks = tasks
      .map(
        (task) =>
          `📌 ${task.taskId || task.id.substring(0, 8)}\n${task.title}\n📅 ${new Date(task.promisedDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}`
      )
      .join("\n\n")

    return `🎯 *${clientName}*\n\n${formattedTasks}`
  }

  const handleCopy = (clientName: string, clientTasks: ClientTask[]) => {
    const text = formatTasksForWhatsApp(clientName, clientTasks)
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(clientName)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleCopyAll = () => {
    const allText = filteredGroups
      .map(([_, group]) => formatTasksForWhatsApp(group.clientName, group.tasks))
      .join("\n\n" + "─".repeat(50) + "\n\n")

    navigator.clipboard.writeText(allText).then(() => {
      setCopiedId("all")
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="type-h1">Client Analytics</h1>
        <p className="type-body text-[#86868B]">
          View all client task promises in one place. Copy and paste directly to WhatsApp for easy sharing.
        </p>
      </div>

      {/* Filters - Clean, Minimal Design */}
      <div className="flex flex-wrap gap-3 items-center pb-4 border-b border-[#E5E5E7]">
        {/* Client Filter */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowClientFilter(!showClientFilter)
            }}
            className={cn(
              "px-4 py-2 type-body rounded-full border flex items-center gap-2 transition-all",
              selectedClients.length > 0
                ? "bg-[#007AFF] text-white border-[#007AFF]"
                : "bg-white text-[#1D1D1F] border-[#D5D5D7] hover:border-[#007AFF]"
            )}
          >
            Client
            {selectedClients.length > 0 && <span className="ml-1">•</span>}
          </button>
          {showClientFilter && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-[#E5E5E7] rounded-xl shadow-lg z-10 min-w-56">
              <div className="p-4">
                {uniqueClients.map((client) => (
                  <label key={client.id} className="flex items-center gap-3 p-2.5 hover:bg-[#F5F5F7] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients([...selectedClients, client.id])
                        } else {
                          setSelectedClients(selectedClients.filter((id) => id !== client.id))
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="type-body text-[#1D1D1F]">{client.name}</span>
                  </label>
                ))}
              </div>
              {selectedClients.length > 0 && (
                <button
                  onClick={() => setSelectedClients([])}
                  className="w-full px-4 py-2 text-center type-caption text-[#007AFF] hover:bg-[#F5F5F7] border-t border-[#E5E5E7]"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowStatusFilter(!showStatusFilter)
            }}
            className={cn(
              "px-4 py-2 type-body rounded-full border flex items-center gap-2 transition-all",
              selectedStatuses.length > 0 && selectedStatuses.length < statusOptions.length
                ? "bg-[#007AFF] text-white border-[#007AFF]"
                : "bg-white text-[#1D1D1F] border-[#D5D5D7] hover:border-[#007AFF]"
            )}
          >
            Status
            {selectedStatuses.length > 0 && selectedStatuses.length < statusOptions.length && <span className="ml-1">•</span>}
          </button>
          {showStatusFilter && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-[#E5E5E7] rounded-xl shadow-lg z-10 min-w-56">
              <div className="p-4">
                {statusOptions.map((status) => (
                  <label key={status.value} className="flex items-center gap-3 p-2.5 hover:bg-[#F5F5F7] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatuses([...selectedStatuses, status.value])
                        } else {
                          setSelectedStatuses(selectedStatuses.filter((s) => s !== status.value))
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="type-body text-[#1D1D1F]">{status.label}</span>
                  </label>
                ))}
              </div>
              {selectedStatuses.length > 0 && (
                <button
                  onClick={() => setSelectedStatuses(["todo", "in_progress"])} // Reset to default
                  className="w-full px-4 py-2 text-center type-caption text-[#007AFF] hover:bg-[#F5F5F7] border-t border-[#E5E5E7]"
                >
                  Reset to default
                </button>
              )}
            </div>
          )}
        </div>

        {/* Date Type Toggle */}
        <div className="flex gap-1 bg-[#F5F5F7] rounded-full p-1">
          <button
            onClick={() => setDateType("promised")}
            className={cn(
              "px-4 py-1.5 type-caption font-medium rounded-full transition-all",
              dateType === "promised"
                ? "bg-white text-[#007AFF] shadow-sm"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            )}
          >
            Promised
          </button>
          <button
            onClick={() => setDateType("due")}
            className={cn(
              "px-4 py-1.5 type-caption font-medium rounded-full transition-all",
              dateType === "due"
                ? "bg-white text-[#007AFF] shadow-sm"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            )}
          >
            Due
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDateFilter(!showDateFilter)
            }}
            className={cn(
              "px-4 py-2 type-body rounded-full border flex items-center gap-2 transition-all",
              dateRange.start || dateRange.end
                ? "bg-[#007AFF] text-white border-[#007AFF]"
                : "bg-white text-[#1D1D1F] border-[#D5D5D7] hover:border-[#007AFF]"
            )}
          >
            Date
            {(dateRange.start || dateRange.end) && <span className="ml-1">•</span>}
          </button>
          {showDateFilter && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-[#E5E5E7] rounded-xl shadow-lg z-10 p-4 min-w-72">
              <div className="space-y-3">
                <div>
                  <label className="type-caption font-medium text-[#1D1D1F] block mb-2">From</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] type-body"
                  />
                </div>
                <div>
                  <label className="type-caption font-medium text-[#1D1D1F] block mb-2">To</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] type-body"
                  />
                </div>
              </div>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="w-full mt-3 px-3 py-2 text-center type-caption text-[#007AFF] hover:bg-[#F5F5F7] rounded-lg border-t border-[#E5E5E7] mt-3"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reset Button */}
        {(selectedClients.length > 0 || selectedStatuses.length !== 2 || selectedStatuses.some(s => !["todo", "in_progress"].includes(s)) || dateRange.start || dateRange.end || searchTerm) && (
          <button
            onClick={() => {
              setSelectedClients([])
              setSelectedStatuses(["todo", "in_progress"]) // Reset to default
              setDateRange({ start: "", end: "" })
              setSearchTerm("")
            }}
            className="px-3 py-2 type-caption text-[#86868B] hover:text-[#007AFF] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search and Actions */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search clients or tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={handleCopyAll}
          disabled={filteredGroups.length === 0}
          className={cn(
            "px-6 py-2.5 type-body font-medium rounded-lg transition-all flex items-center gap-2",
            filteredGroups.length === 0
              ? "bg-[#E5E5E7] text-[#86868B] cursor-not-allowed"
              : copiedId === "all"
              ? "bg-[#34C759] text-white"
              : "bg-[#007AFF] text-white hover:bg-[#0051D5]"
          )}
        >
          {copiedId === "all" ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy All
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#E5E5E7] border-t-[#007AFF] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="type-body text-[#86868B]">Loading client tasks...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredGroups.length === 0 && (
        <div className="bg-white border-2 border-dashed border-[#E5E5E7] rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-4">
            <Copy className="w-8 h-8 text-[#86868B]" />
          </div>
          <h3 className="type-body font-semibold text-[#1D1D1F] mb-1">No tasks found</h3>
          <p className="type-caption text-[#86868B]">
            {searchTerm ? "No tasks match your search" : "Create tasks with client promises to see them here"}
          </p>
        </div>
      )}

      {/* Client Groups */}
      {!isLoading && filteredGroups.length > 0 && (
        <div className="space-y-4">
          {filteredGroups.map(([clientId, group]) => (
            <div key={clientId} className="bg-white border border-[#E5E5E7] rounded-xl overflow-hidden">
              {/* Client Header */}
              <div className="bg-gradient-to-r from-[#007AFF] to-[#0051D5] px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="type-h2 text-white">{group.clientName}</h2>
                  <p className="type-caption text-blue-100 mt-1">{group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => handleCopy(group.clientName, group.tasks)}
                  className={cn(
                    "px-4 py-2 type-body font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap",
                    copiedId === group.clientName
                      ? "bg-white text-[#34C759]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {copiedId === group.clientName ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Tasks List */}
              <div className="divide-y divide-[#E5E5E7]">
                {group.tasks.map((task) => (
                  <div key={task.id} className="px-6 py-4 hover:bg-[#F5F5F7] transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      {/* Task ID */}
                      <div className="col-span-2">
                        <p className="type-caption text-[#86868B] mb-1">Task ID</p>
                        <p className="type-body font-mono text-[#1D1D1F] font-medium">{task.taskId || task.id.substring(0, 8)}</p>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <p className="type-caption text-[#86868B] mb-1">Status</p>
                        {(() => {
                          const statusInfo = getStatusColor(task.status)
                          return (
                            <span
                              className="inline-block px-2.5 py-1 type-caption font-medium rounded"
                              style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                            >
                              {statusInfo.label}
                            </span>
                          )
                        })()}
                      </div>

                      {/* Task Name */}
                      <div className="col-span-5">
                        <p className="type-caption text-[#86868B] mb-1">Task</p>
                        <p className="type-body text-[#1D1D1F] line-clamp-2">{task.title}</p>
                      </div>

                      {/* Dates - Both Due and Promised */}
                      <div className="col-span-4">
                        <p className="type-caption text-[#86868B] mb-2">Dates</p>
                        <div className="space-y-1">
                          {task.dueDate && (
                            <div className="flex items-center gap-2">
                              <span className="type-caption font-medium text-[#007AFF]">Due:</span>
                              <p className="type-body font-semibold text-[#1D1D1F]">
                                {new Date(task.dueDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          )}
                          {task.promisedDate && (
                            <div className="flex items-center gap-2">
                              <span className="type-caption font-medium text-[#34C759]">Promised:</span>
                              <p className="type-body font-semibold text-[#1D1D1F]">
                                {new Date(task.promisedDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!isLoading && filteredGroups.length > 0 && (
        <div className="bg-gradient-to-r from-[#F0F4FF] to-[#F0FFF4] border border-[#E0E9FF] rounded-xl p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="type-caption text-[#6B7280] mb-1">Total Clients</p>
              <p className="type-h2 text-[#1D1D1F]">{filteredGroups.length}</p>
            </div>
            <div>
              <p className="type-caption text-[#6B7280] mb-1">Total Tasks</p>
              <p className="type-h2 text-[#1D1D1F]">{filteredGroups.reduce((sum, [_, g]) => sum + g.tasks.length, 0)}</p>
            </div>
            <div>
              <p className="type-caption text-[#6B7280] mb-1">Earliest Promise</p>
              <p className="type-h2 text-[#1D1D1F]">
                {new Date(
                  Math.min(
                    ...filteredGroups.flatMap(([_, g]) => g.tasks.map((t) => new Date(t.promisedDate).getTime()))
                  )
                ).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
