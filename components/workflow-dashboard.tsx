"use client"

import { useState } from "react"
import { Activity, CheckCircle2, AlertCircle, Clock, Zap, BarChart3, Eye, Timer, Bell } from "lucide-react"
import useSWR from "swr"

interface WorkflowDashboardProps {
  clientId?: string
}

interface WorkflowStats {
  totalActions: number
  tasksCompleted: number
  approvalsAwaitingApproval: number
  phasesInReview: number
  blockedTasks: number
  activityLast24h: number
  overdueApprovals: number
  escalatedApprovals: number
}

interface PendingApproval {
  id: string
  taskName: string
  submittedBy: string
  submittedAt: string
  daysOverdue: number
  isOverdue: boolean
  isEscalating: boolean
  daysUntilEscalation: number
}

interface AuditLog {
  id: string
  action: string
  entity: {
    type: string
    name: string
  }
  changes: {
    from: { status: string }
    to: { status: string }
  }
  performedBy: string
  timestamp: string
  metadata?: Record<string, any>
}

const fetcher = (url: string) => {
  console.log("[v0] WorkflowDashboard fetcher called for:", url)
  const token = localStorage.getItem("sessionToken")
  console.log("[v0] Token exists:", !!token)
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    console.log("[v0] Response status for", url, ":", res.status)
    return res.json()
  }).then((data) => {
    console.log("[v0] Data received for", url, ":", data)
    return data
  }).catch((error) => {
    console.error("[v0] Fetch error for", url, ":", error)
    throw error
  })
}

export function WorkflowDashboard({ clientId }: WorkflowDashboardProps) {
  const [showDetailedLog, setShowDetailedLog] = useState(false)
  const [filterAction, setFilterAction] = useState<string | null>(null)

  // Fetch workflow stats with SWR caching (all workflows across all clients)
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR(
    `/api/workflows/stats`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  )

  // Fetch pending approvals with SWR caching (all approvals across all clients)
  const { data: approvalsData, error: approvalsError, isLoading: approvalsLoading } = useSWR(
    `/api/workflows/pending-approvals`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  )

  // Fetch audit logs with SWR caching (all audit logs across all clients)
  const { data: logsData, error: logsError, isLoading: logsLoading } = useSWR(
    filterAction 
      ? `/api/workflows/audit-logs?action=${filterAction}&limit=50`
      : `/api/workflows/audit-logs?limit=50`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  )

  console.log("[v0] WorkflowDashboard - statsData:", statsData)
  console.log("[v0] WorkflowDashboard - approvalsData:", approvalsData)
  console.log("[v0] WorkflowDashboard - logsData:", logsData)
  console.log("[v0] WorkflowDashboard - errors:", { statsError, approvalsError, logsError })
  console.log("[v0] WorkflowDashboard - loading:", { statsLoading, approvalsLoading, logsLoading })

  const stats: WorkflowStats = statsData?.stats || {
    totalActions: 0,
    tasksCompleted: 0,
    approvalsAwaitingApproval: 0,
    phasesInReview: 0,
    blockedTasks: 0,
    activityLast24h: 0,
    overdueApprovals: 0,
    escalatedApprovals: 0,
  }

  const pendingApprovals: PendingApproval[] = approvalsData?.approvals || []
  const auditLog: AuditLog[] = logsData?.logs || []

  console.log("[v0] WorkflowDashboard - final stats:", stats)
  console.log("[v0] WorkflowDashboard - final pendingApprovals:", pendingApprovals)
  console.log("[v0] WorkflowDashboard - final auditLog:", auditLog)

  const isLoading = statsLoading || approvalsLoading || logsLoading
  const hasError = statsError || approvalsError || logsError

  const getActionBadgeColor = (action: string) => {
    if (action.includes("completed") || action.includes("approve")) return "bg-[#E8F5E9] text-[#2E7D32]"
    if (action.includes("blocked") || action.includes("reject")) return "bg-[#FFEBEE] text-[#D32F2F]"
    if (action.includes("review") || action.includes("pending")) return "bg-[#FFF3E0] text-[#E65100]"
    return "bg-[#E3F2FD] text-[#0051C3]"
  }

  const getActionIcon = (action: string) => {
    if (action.includes("completed") || action.includes("approve")) return <CheckCircle2 className="w-4 h-4" />
    if (action.includes("blocked") || action.includes("reject")) return <AlertCircle className="w-4 h-4" />
    if (action.includes("review") || action.includes("pending")) return <Clock className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  // Filter logs based on filterAction
  const filteredLogs = auditLog.filter((log) => filterAction === null || log.action === filterAction)

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Workflow Dashboard</h1>
          <p className="text-sm text-[#86868B]">Monitor task states, approvals, phase transitions, and execution history</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E5E7] rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-[#F5F5F7] rounded w-1/2 mb-4" />
              <div className="h-8 bg-[#F5F5F7] rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Workflow Dashboard</h1>
          <p className="text-sm text-[#86868B]">Monitor task states, approvals, phase transitions, and execution history</p>
        </div>
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#FF3B30] mx-auto mb-4" />
          <p className="text-lg font-semibold text-[#1D1D1F] mb-2">Failed to load workflow data</p>
          <p className="text-sm text-[#86868B]">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Workflow Dashboard</h1>
        <p className="text-sm text-[#86868B]">Monitor task states, approvals, phase transitions, and execution history</p>
      </div>

      {/* Alert Section - Overdue Approvals */}
      {stats.overdueApprovals > 0 && (
        <div className="bg-[#FFF3E0] border-2 border-[#E65100] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-[#E65100] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#9B5610]">Action Needed: {stats.overdueApprovals} Approval{stats.overdueApprovals > 1 ? "s" : ""} Overdue</p>
              <p className="text-sm text-[#9B5610]/80 mt-1">
                {stats.escalatedApprovals} approval{stats.escalatedApprovals > 1 ? "s" : ""} will be escalated soon. Review pending approvals below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-[#86868B] uppercase tracking-wider font-medium">Total Actions</p>
              <p className="text-3xl font-bold text-[#1D1D1F] mt-1">{stats.totalActions}</p>
            </div>
            <Activity className="w-5 h-5 text-[#007AFF]" />
          </div>
          <p className="text-xs text-[#86868B]">Workflow executions this period</p>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-[#86868B] uppercase tracking-wider font-medium">Tasks Completed</p>
              <p className="text-3xl font-bold text-[#2E7D32] mt-1">{stats.tasksCompleted}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <p className="text-xs text-[#86868B]">Successfully transitioned to done</p>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-[#86868B] uppercase tracking-wider font-medium">Awaiting Approval</p>
              <p className="text-3xl font-bold text-[#FFB547] mt-1">{stats.approvalsAwaitingApproval}</p>
            </div>
            <Clock className="w-5 h-5 text-[#FFB547]" />
          </div>
          <p className="text-xs text-[#86868B]">Pending stakeholder review</p>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-[#86868B] uppercase tracking-wider font-medium">Phases in Review</p>
              <p className="text-3xl font-bold text-[#007AFF] mt-1">{stats.phasesInReview}</p>
            </div>
            <Zap className="w-5 h-5 text-[#007AFF]" />
          </div>
          <p className="text-xs text-[#86868B]">Awaiting phase approval</p>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-[#86868B] uppercase tracking-wider font-medium">Blocked Tasks</p>
              <p className="text-3xl font-bold text-[#FF3B30] mt-1">{stats.blockedTasks}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
          </div>
          <p className="text-xs text-[#86868B]">Waiting for dependencies</p>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-[#86868B] uppercase tracking-wider font-medium">Last 24 Hours</p>
              <p className="text-3xl font-bold text-[#34C759] mt-1">{stats.activityLast24h}</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#34C759]" />
          </div>
          <p className="text-xs text-[#86868B]">Actions performed</p>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-[#1D1D1F]">Pending Approvals</h2>
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className={`border-2 rounded-lg p-4 ${
                approval.isOverdue
                  ? "bg-[#FEE2E2] border-[#DC2626]"
                  : approval.isEscalating
                    ? "bg-[#FFF8E1] border-[#F57C00]"
                    : "bg-white border-[#E5E5E7]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <p className="font-semibold text-[#1D1D1F]">{approval.taskName}</p>
                    {approval.isOverdue && (
                      <span className="px-2 py-1 bg-[#DC2626] text-white rounded text-xs font-bold">OVERDUE</span>
                    )}
                    {approval.isEscalating && !approval.isOverdue && (
                      <span className="px-2 py-1 bg-[#F57C00] text-white rounded text-xs font-bold">ESCALATING</span>
                    )}
                  </div>
                  <p className="text-xs text-[#515154] mb-3">
                    Submitted by <span className="font-medium">{approval.submittedBy}</span> on{" "}
                    {new Date(approval.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Timer Badge */}
                <div className="flex-shrink-0 text-right">
                  {approval.isOverdue ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#DC2626] text-white rounded-lg">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm font-bold">{approval.daysOverdue}d overdue</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF3E0] text-[#9B5610] rounded-lg">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{approval.daysUntilEscalation}d left</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Audit Log */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1D1D1F]">Workflow Audit Trail</h2>
          <button
            onClick={() => setShowDetailedLog(!showDetailedLog)}
            className="flex items-center gap-2 text-xs font-medium text-[#007AFF] hover:text-[#0051C3]"
          >
            <Eye className="w-4 h-4" />
            {showDetailedLog ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterAction(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterAction === null
                ? "bg-[#2E7D32] text-white"
                : "bg-[#F5F5F7] text-[#515154] hover:bg-[#EBEBED]"
            }`}
          >
            All Actions
          </button>
          {["task_completed", "task_blocked", "phase_approve", "approval_requested"].map((action) => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterAction === action
                  ? "bg-[#2E7D32] text-white"
                  : "bg-[#F5F5F7] text-[#515154] hover:bg-[#EBEBED]"
              }`}
            >
              {action.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* Logs List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {auditLog.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#86868B]">No workflow activity yet</p>
            </div>
          ) : (
            auditLog.map((log) => (
              <div key={log.id} className="border border-[#E5E5E7] rounded-lg p-4 hover:bg-[#F8F9FB] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getActionBadgeColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1D1D1F]">
                        {log.entity?.type ? log.entity.type.charAt(0).toUpperCase() + log.entity.type.slice(1) : "Entity"}: {log.entity?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-[#86868B] mt-1">
                        {log.changes?.from?.status || "Unknown"} → {log.changes?.to?.status || "Unknown"}
                      </p>
                      {showDetailedLog && log.metadata && (
                        <pre className="text-xs text-[#515154] mt-2 bg-[#F5F5F7] p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#86868B]">{log.performedBy || "System"}</p>
                    <p className="text-xs text-[#86868B] mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Workflow State Machine Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task State Machine */}
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <h3 className="text-base font-semibold text-[#1D1D1F] mb-4">Task State Machine</h3>
          <div className="space-y-3">
            {["todo", "in_progress", "blocked", "review", "done", "cancelled"].map((state) => (
              <div key={state} className="p-3 bg-[#F8F9FB] rounded border border-[#E5E5E7]">
                <p className="text-sm font-medium text-[#1D1D1F] capitalize">{state.replace("_", " ")}</p>
                <p className="text-xs text-[#86868B] mt-1">
                  Valid transitions depend on current state and approval requirements
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Phase State Machine */}
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <h3 className="text-base font-semibold text-[#1D1D1F] mb-4">Phase State Machine</h3>
          <div className="space-y-3">
            {["not_started", "in_progress", "blocked", "review", "completed"].map((state) => (
              <div key={state} className="p-3 bg-[#F8F9FB] rounded border border-[#E5E5E7]">
                <p className="text-sm font-medium text-[#1D1D1F] capitalize">{state.replace("_", " ")}</p>
                <p className="text-xs text-[#86868B] mt-1">
                  Phase progresses through defined workflow with approval gates
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
