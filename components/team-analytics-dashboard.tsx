"use client"

import { useState } from "react"
import { Users, Clock, AlertCircle, Building2, CheckCircle2, ChevronDown, Search, X, TrendingUp, Calendar } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  status: "todo" | "in_progress" | "in_review" | "done"
  due_date: string
  task_id?: string
  client_name?: string
}

interface TeamMember {
  id: string
  full_name: string
  email: string
  tasksAssigned: Task[]
  taskStats: {
    total: number
    completed: number
    inProgress: number
    pending: number
    overdue: number
  }
  pkrPercentage: number
}

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json())
}

// Get date range based on timeline filter
const getDateRange = (timelineType: "week" | "month" | "custom", customDates?: { from: string; to: string }) => {
  const today = new Date()
  
  if (timelineType === "custom" && customDates) {
    return customDates
  }
  
  if (timelineType === "week") {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    return {
      from: weekStart.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    }
  }
  
  // month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    from: monthStart.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0]
  }
}

export function TeamAnalyticsDashboard() {
  const [viewMode, setViewMode] = useState<"members" | "clients">("members")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"pkr" | "completed" | "overdue">("pkr")
  const [expandedNoTasks, setExpandedNoTasks] = useState(false)
  const [timelineType, setTimelineType] = useState<"week" | "month" | "custom">("week")
  const [customDates, setCustomDates] = useState({ from: "", to: "" })
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [drawerStatusFilter, setDrawerStatusFilter] = useState<"all" | "overdue" | "pending" | "completed">("all")

  const dateRange = getDateRange(timelineType, customDates)
  
  // Build query string for API
  const queryParams = new URLSearchParams({
    from: dateRange.from,
    to: dateRange.to,
  }).toString()

  const { data: analyticsData, isLoading, error } = useSWR(`/api/team/analytics?${queryParams}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  const teamMembers: TeamMember[] = analyticsData?.teamMembers || []

  // Calculate aggregate stats - simplified to 3 core metrics
  const totalTeamTasks = teamMembers.reduce((sum, m) => sum + m.taskStats.total, 0)
  const totalCompleted = teamMembers.reduce((sum, m) => sum + m.taskStats.completed, 0)
  const completionRate = totalTeamTasks > 0 ? Math.round((totalCompleted / totalTeamTasks) * 100) : 0

  // Group members by performance
  const topPerformers = teamMembers.filter(m => m.pkrPercentage >= 70)
  const needsAttention = teamMembers.filter(m => m.pkrPercentage >= 40 && m.pkrPercentage < 70)
  const noProgress = teamMembers.filter(m => m.pkrPercentage < 40)
  const noTasks = teamMembers.filter(m => m.taskStats.total === 0)

  // Group members by client
  const membersByClient = teamMembers.reduce((acc, member) => {
    const client = member.email?.split('@')[1] || 'Other'
    if (!acc[client]) acc[client] = []
    acc[client].push(member)
    return acc
  }, {} as Record<string, TeamMember[]>)

  // Get sorted members for active members view
  const activeMembersForView = teamMembers.filter(m => m.taskStats.total > 0)
  const sortedMembers = [...activeMembersForView].sort((a, b) => {
    if (sortBy === "completed") return b.taskStats.completed - a.taskStats.completed
    if (sortBy === "overdue") return b.taskStats.overdue - a.taskStats.overdue
    return a.pkrPercentage - b.pkrPercentage // Lowest PKR first by default
  })

  // Filter by search
  const filteredSorted = sortedMembers.filter(m =>
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to get performance color
  const getPerformanceColor = (pkr: number) => {
    if (pkr >= 70) return { bg: "bg-green-50", border: "border-green-200", bar: "bg-green-500", label: "text-green-700" }
    if (pkr >= 40) return { bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500", label: "text-amber-700" }
    return { bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500", label: "text-red-700" }
  }

  // Helper function to get performance label
  const getPerformanceLabel = (pkr: number) => {
    if (pkr >= 70) return "On Track"
    if (pkr >= 40) return "Needs Attention"
    return "Needs Help"
  }

  // Get timeline label
  const getTimelineLabel = () => {
    if (timelineType === "week") return "This Week"
    if (timelineType === "month") return "This Month"
    if (customDates.from && customDates.to) {
      return `${customDates.from} to ${customDates.to}`
    }
    return "Custom Range"
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Team Performance</h1>
        <p className="text-sm text-gray-600">Weekly summary and completion metrics</p>
      </div>

      {/* Timeline Filters */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTimelineType("week")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded transition-all",
              timelineType === "week"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setTimelineType("month")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded transition-all",
              timelineType === "month"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setTimelineType("custom")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded transition-all",
              timelineType === "custom"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Range Inputs */}
        {timelineType === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customDates.from}
              onChange={(e) => setCustomDates({ ...customDates, from: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={customDates.to}
              onChange={(e) => setCustomDates({ ...customDates, to: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Core Metrics - Simplified to 3 */}
      <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-1">Team Tasks</div>
          <div className="text-3xl font-bold text-gray-900">{totalTeamTasks}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-xs font-semibold text-green-700 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-700">{totalCompleted}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-xs font-semibold text-blue-700 mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-blue-700">{completionRate}%</div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pkr">Sort by: Lowest PKR</option>
          <option value="completed">Sort by: Most Completed</option>
          <option value="overdue">Sort by: Most Overdue</option>
        </select>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {viewMode === "members" && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Clock className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium">Error loading data</p>
                </div>
              ) : (
                <>
                  {/* Top Performers Section */}
                  {topPerformers.filter(m => filteredSorted.includes(m)).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Top Performers</h2>
                        <span className="text-xs text-gray-500 ml-auto">{topPerformers.filter(m => filteredSorted.includes(m)).length} members</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSorted.filter(m => m.pkrPercentage >= 70).map((member) => (
                          <MemberCard 
                            key={member.id} 
                            member={member}
                            onClick={() => setSelectedMember(member)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Needs Attention Section */}
                  {needsAttention.filter(m => filteredSorted.includes(m)).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Needs Attention</h2>
                        <span className="text-xs text-gray-500 ml-auto">{needsAttention.filter(m => filteredSorted.includes(m)).length} members</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSorted.filter(m => m.pkrPercentage >= 40 && m.pkrPercentage < 70).map((member) => (
                          <MemberCard 
                            key={member.id} 
                            member={member}
                            onClick={() => setSelectedMember(member)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Progress Section */}
                  {noProgress.filter(m => filteredSorted.includes(m)).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Needs Help</h2>
                        <span className="text-xs text-gray-500 ml-auto">{noProgress.filter(m => filteredSorted.includes(m)).length} members</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSorted.filter(m => m.pkrPercentage < 40).map((member) => (
                          <MemberCard 
                            key={member.id} 
                            member={member}
                            onClick={() => setSelectedMember(member)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Tasks Assigned Section - Collapsible */}
                  {noTasks.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <button
                        onClick={() => setExpandedNoTasks(!expandedNoTasks)}
                        className="flex items-center gap-2 mb-3 hover:text-blue-600 transition-colors"
                      >
                        <ChevronDown className={cn("w-4 h-4 transition-transform", expandedNoTasks && "rotate-180")} />
                        <h2 className="text-sm font-semibold text-gray-900">No Tasks Assigned</h2>
                        <span className="text-xs text-gray-500">{noTasks.length} members</span>
                      </button>
                      {expandedNoTasks && (
                        <div className="space-y-2">
                          {noTasks.map((member) => (
                            <div key={member.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {filteredSorted.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No team members found</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {viewMode === "clients" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(membersByClient).map(([client, members]) => (
                <div key={client} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{client}</h3>
                    <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">{members.length} members</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer" onClick={() => setSelectedMember(member)}>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                          <div className="flex gap-2 mt-1 text-xs text-gray-600">
                            <span>{member.taskStats.total} assigned</span>
                            <span>•</span>
                            <span className="text-green-600 font-medium">{member.taskStats.completed} done</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{member.pkrPercentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Drawer */}
        {selectedMember && (
          <MemberDetailDrawer
            member={selectedMember}
            timelineLabel={getTimelineLabel()}
            onClose={() => setSelectedMember(null)}
            statusFilter={drawerStatusFilter}
            onStatusFilterChange={setDrawerStatusFilter}
            allMembers={teamMembers}
            filteredSorted={filteredSorted}
          />
        )}
      </div>
    </div>
  )
}

// Simplified Member Card Component
function MemberCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  const colors = member.pkrPercentage >= 70
    ? { bg: "bg-green-50", border: "border-green-200", bar: "bg-green-500" }
    : member.pkrPercentage >= 40
    ? { bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500" }
    : { bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500" }

  return (
    <div 
      onClick={onClick}
      className={cn("rounded-lg border p-4 hover:shadow-sm hover:bg-opacity-80 transition-all cursor-pointer", colors.bg, colors.border)}
    >
      {/* Name */}
      <h3 className="font-semibold text-gray-900 truncate">{member.full_name}</h3>

      {/* PKR Percentage */}
      <div className="text-2xl font-bold text-gray-900 mt-2">{member.pkrPercentage}%</div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
        <div
          className={cn("h-2 rounded-full transition-all", colors.bar)}
          style={{ width: `${member.pkrPercentage}%` }}
        />
      </div>

      {/* Completed / Total */}
      <div className="text-xs text-gray-600 mt-3">
        {member.taskStats.completed} / {member.taskStats.total} tasks completed
      </div>
    </div>
  )
}

// Member Detail Drawer Component
function MemberDetailDrawer({
  member,
  timelineLabel,
  onClose,
  statusFilter,
  onStatusFilterChange,
  allMembers,
  filteredSorted,
}: {
  member: TeamMember
  timelineLabel: string
  onClose: () => void
  statusFilter: "all" | "overdue" | "pending" | "completed"
  onStatusFilterChange: (filter: "all" | "overdue" | "pending" | "completed") => void
  allMembers: TeamMember[]
  filteredSorted: TeamMember[]
}) {
  const { toast } = useToast()
  const [expandedGroups, setExpandedGroups] = useState({
    overdue: true,
    pending: true,
    completed: false,
  })

  // Helper function to format tasks for clipboard
  const formatTaskForClipboard = (task: Task): string => {
    const taskId = task.task_id || task.id.slice(0, 8)
    const title = task.title
    const project = task.client_name || "—"
    const dueDate = task.due_date 
      ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "—"
    const status = task.status === "done" 
      ? "Done" 
      : task.status === "in_review" 
      ? "Review" 
      : task.status === "in_progress" 
      ? "In Progress" 
      : "To Do"
    
    return `• ${taskId} – ${title}\n  Project: ${project}\n  Due: ${dueDate}\n  Status: ${status}`
  }

  // Copy all tasks
  const handleCopyAll = async () => {
    const allTasks = member.tasksAssigned
    
    const sections: string[] = [
      `${member.full_name} – Tasks (${timelineLabel})\n`
    ]

    if (groupedTasks.overdue.length > 0) {
      sections.push(`Overdue\n${groupedTasks.overdue.map(formatTaskForClipboard).join("\n")}`)
    }

    if (groupedTasks.pending.length > 0) {
      sections.push(`Pending\n${groupedTasks.pending.map(formatTaskForClipboard).join("\n")}`)
    }

    if (groupedTasks.completed.length > 0) {
      sections.push(`Done\n${groupedTasks.completed.map(formatTaskForClipboard).join("\n")}`)
    }

    const text = sections.join("\n\n")
    
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "All tasks copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy tasks",
        variant: "destructive",
      })
    }
  }

  // Copy pending tasks
  const handleCopyPending = async () => {
    if (groupedTasks.pending.length === 0) {
      toast({
        title: "No pending tasks",
        description: "There are no pending tasks to copy",
      })
      return
    }

    const text = `${member.full_name} – Pending Tasks (${timelineLabel})\n\n${groupedTasks.pending.map(formatTaskForClipboard).join("\n")}`
    
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Pending tasks copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy tasks",
        variant: "destructive",
      })
    }
  }

  // Copy overdue tasks
  const handleCopyOverdue = async () => {
    let text: string

    if (groupedTasks.overdue.length === 0) {
      text = `${member.full_name} – Overdue Tasks (${timelineLabel})\n\nNo overdue tasks.`
    } else {
      text = `${member.full_name} – Overdue Tasks (${timelineLabel})\n\n${groupedTasks.overdue.map(formatTaskForClipboard).join("\n")}`
    }
    
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: `Overdue tasks copied to clipboard`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy tasks",
        variant: "destructive",
      })
    }
  }

  // Group tasks by status
  const groupedTasks = {
    overdue: member.tasksAssigned.filter(t => {
      const dueDate = new Date(t.due_date)
      return dueDate < new Date() && t.status !== "done"
    }),
    pending: member.tasksAssigned.filter(t => 
      t.status === "todo" || t.status === "in_progress" || t.status === "in_review"
    ),
    completed: member.tasksAssigned.filter(t => t.status === "done"),
  }

  // Get current member index for navigation
  const currentIndex = filteredSorted.findIndex(m => m.id === member.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < filteredSorted.length - 1

  const handlePrevious = () => {
    if (hasPrevious) {
      // This would be passed in as a callback
    }
  }

  const handleNext = () => {
    if (hasNext) {
      // This would be passed in as a callback
    }
  }

  const getStatusColor = (status: string) => {
    if (status === "done") return "bg-green-100 text-green-700"
    if (status === "in_review") return "bg-blue-100 text-blue-700"
    if (status === "in_progress") return "bg-amber-100 text-amber-700"
    return "bg-gray-100 text-gray-700"
  }

  const toggleGroup = (group: "overdue" | "pending" | "completed") => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  return (
    <div className="w-full max-w-lg border-l border-gray-200 bg-white flex flex-col overflow-hidden shadow-lg" style={{ width: "460px" }}>
      {/* ===== STICKY HEADER ===== */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{member.full_name}</h2>
            <p className="text-xs text-gray-600 mt-1">{timelineLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PKR, Completion, and Open Full Profile */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-end gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{member.pkrPercentage}%</div>
              <p className="text-xs text-gray-600">PKR</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{member.taskStats.completed}/{member.taskStats.total}</p>
              <p className="text-xs text-gray-600">completed</p>
            </div>
          </div>
          <button
            onClick={() => {
              // Route to full profile page
              window.location.href = `/team/members/${member.id}`
            }}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Open Profile
          </button>
        </div>

        {/* Previous / Next Member Navigation */}
        <div className="flex items-center gap-2 mt-3">
          <button
            disabled={!hasPrevious}
            onClick={handlePrevious}
            className={cn(
              "flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors border",
              hasPrevious
                ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                : "border-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            ← Previous
          </button>
          <button
            disabled={!hasNext}
            onClick={handleNext}
            className={cn(
              "flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors border",
              hasNext
                ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                : "border-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ===== STICKY SUMMARY CHIPS ===== */}
      <div className="sticky top-[120px] z-10 bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto mb-2.5">
          <div className="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-full">
            <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">{member.taskStats.total} Total</p>
          </div>
          <div className="flex-shrink-0 px-3 py-1.5 bg-green-100 rounded-full">
            <p className="text-xs font-semibold text-green-700 whitespace-nowrap">{member.taskStats.completed} Done</p>
          </div>
          <div className="flex-shrink-0 px-3 py-1.5 bg-amber-100 rounded-full">
            <p className="text-xs font-semibold text-amber-700 whitespace-nowrap">{member.taskStats.pending} Pending</p>
          </div>
          {member.taskStats.overdue > 0 && (
            <div className="flex-shrink-0 px-3 py-1.5 bg-red-100 rounded-full">
              <p className="text-xs font-semibold text-red-700 whitespace-nowrap">{member.taskStats.overdue} Overdue</p>
            </div>
          )}
        </div>

        {/* Copy Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyAll}
            className="flex-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Copy All
          </button>
          <button
            onClick={handleCopyPending}
            className="flex-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Copy Pending
          </button>
          <button
            onClick={handleCopyOverdue}
            className="flex-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
          >
            Copy Overdue
          </button>
        </div>
      </div>

      {/* ===== SCROLLABLE TASK LIST ===== */}
      <div className="flex-1 overflow-y-auto">
        {member.tasksAssigned.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center px-4">
            <p className="text-sm text-gray-500">No tasks assigned</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Overdue Section */}
            {groupedTasks.overdue.length > 0 && (
              <div>
                <button
                  onClick={() => toggleGroup("overdue")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-50 transition-colors border-b border-red-100 bg-red-50"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-red-600 transition-transform",
                        !expandedGroups.overdue && "-rotate-90"
                      )}
                    />
                    <h3 className="text-sm font-semibold text-red-900">Overdue</h3>
                    <span className="text-xs font-medium text-red-700 bg-red-200 px-2 py-0.5 rounded-full">
                      {groupedTasks.overdue.length}
                    </span>
                  </div>
                </button>
                {expandedGroups.overdue && (
                  <div className="bg-red-50/30">
                    {groupedTasks.overdue.map((task) => (
                      <TaskRow key={task.id} task={task} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pending Section */}
            {groupedTasks.pending.length > 0 && (
              <div>
                <button
                  onClick={() => toggleGroup("pending")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors border-b border-amber-100 bg-amber-50"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-amber-600 transition-transform",
                        !expandedGroups.pending && "-rotate-90"
                      )}
                    />
                    <h3 className="text-sm font-semibold text-amber-900">In Progress</h3>
                    <span className="text-xs font-medium text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                      {groupedTasks.pending.length}
                    </span>
                  </div>
                </button>
                {expandedGroups.pending && (
                  <div className="bg-amber-50/30">
                    {groupedTasks.pending.map((task) => (
                      <TaskRow key={task.id} task={task} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Section */}
            {groupedTasks.completed.length > 0 && (
              <div>
                <button
                  onClick={() => toggleGroup("completed")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-green-50 transition-colors border-b border-green-100 bg-green-50"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-green-600 transition-transform",
                        !expandedGroups.completed && "-rotate-90"
                      )}
                    />
                    <h3 className="text-sm font-semibold text-green-900">Completed</h3>
                    <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                      {groupedTasks.completed.length}
                    </span>
                  </div>
                </button>
                {expandedGroups.completed && (
                  <div className="bg-green-50/30">
                    {groupedTasks.completed.map((task) => (
                      <TaskRow key={task.id} task={task} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Task Row Component
function TaskRow({ task, getStatusColor }: { task: Task; getStatusColor: (status: string) => string }) {
  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {task.task_id || task.id.slice(0, 8)}
          </p>
        </div>
        <span className={cn("flex-shrink-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap", getStatusColor(task.status))}>
          {task.status === "done" ? "Done" : task.status === "in_review" ? "Review" : task.status === "in_progress" ? "In Progress" : "To Do"}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 leading-snug">
        {task.title}
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        {task.client_name && (
          <>
            <span className="truncate">{task.client_name}</span>
            <span className="text-gray-300">•</span>
          </>
        )}
        {task.due_date && (
          <span>{new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        )}
      </div>
    </div>
  )
}
