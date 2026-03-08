"use client"

import { AlertCircle, Clock, Users, Zap, Loader2, CheckCircle2 } from "lucide-react"
import { ClientDashboardCard } from "./client-dashboard-card"
import { QuickActionsFAB } from "./quick-actions-fab"
import useSWR from "swr"

interface DashboardHomeProps {
  clients: Array<{
    id: string
    name: string
    description: string
    brandColor: string
    is_active: boolean
  }>
  selectedClientId: string
  onClientSelect: (clientId: string) => void
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

const PHASE_ORDER = [
  "Story Research",
  "Story Writing",
  "Story Design",
  "Story Website",
  "Story Distribution",
  "Story Analytics",
  "Story Learning",
]

export function DashboardHome({ clients: propClients, selectedClientId, onClientSelect }: DashboardHomeProps) {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const dashboardData = data || {}
  const clients = dashboardData.clients?.length > 0 ? dashboardData.clients : propClients
  const tasksDueToday = dashboardData.tasks?.dueToday || []
  const overdueTasks = dashboardData.tasks?.overdue || []
  const allTasks = dashboardData.tasks?.all || []
  const workflowTasks = dashboardData.workflowTasks || []
  const activity = dashboardData.activity || []
  const powerMoves = dashboardData.powerMoves || []
  const teamCount = dashboardData.teamCount || 0
  const phaseProgress = dashboardData.phaseProgress || {}

  // Get current phase & progress for first client
  const firstClientId = clients[0]?.id
  const firstClientPhases = phaseProgress[firstClientId] || []
  const currentPhase = firstClientPhases.find((p: any) => p.status === "in_progress")
  const completedPhases = firstClientPhases.filter((p: any) => p.status === "completed").length
  const totalPhases = firstClientPhases.length || 7
  const overallProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0

  // Calculate overdue days
  const getOverdueDays = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    return Math.floor((now.getTime() - due.getTime()) / 86400000)
  }

  return (
    <div className="space-y-8 relative">
      <QuickActionsFAB />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-base text-muted-foreground">
          {isLoading ? "Loading your overview..." : "Your work at a glance"}
        </p>
      </div>

      {/* Hero Section - My Tasks (Primary Action) */}
      <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/10 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">My Tasks</h2>
            <p className="text-muted-foreground mb-4">
              {tasksDueToday.length === 0 
                ? "All caught up! No tasks due today." 
                : `${tasksDueToday.length} task${tasksDueToday.length === 1 ? '' : 's'} due today`}
            </p>
            <a 
              href="#my-tasks"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              View All Tasks
            </a>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-primary">
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : tasksDueToday.length}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - 3 items only */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overdue Alert - Only show if there are items */}
          {overdueTasks.length > 0 && (
            <div className="bg-destructive/10 rounded-lg border border-destructive/20 p-4">
              <div className="text-xs text-muted-foreground font-medium mb-2">OVERDUE</div>
              <div className="text-3xl font-bold text-destructive">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : overdueTasks.length}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Needs attention</div>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-xs text-muted-foreground font-medium mb-2">CURRENT PHASE</div>
            <div className="text-lg font-semibold text-foreground truncate">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (currentPhase?.name || "Not started")}
            </div>
            <div className="text-xs text-muted-foreground mt-2">{overallProgress}% progress</div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-xs text-muted-foreground font-medium mb-2">TEAM</div>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : teamCount}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Members</div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Alert Banner */}
          {overdueTasks.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Action Required</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {overdueTasks.slice(0, 3).map((task: any) => (
                      <div key={task.id}>
                        <span className="font-medium text-foreground">{task.title}</span>
                        <span className="text-muted-foreground ml-2">- {getOverdueDays(task.due_date)} days overdue</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Due Today */}
          <div id="my-tasks" className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Tasks Due Today</h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {tasksDueToday.length > 0 ? (
                  tasksDueToday.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{task.clientName}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-muted mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No tasks due today</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phase Progress */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Story Journey</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : firstClientPhases.length > 0 ? (
              <div className="space-y-4">
                {PHASE_ORDER.map((phaseName) => {
                  const phase = firstClientPhases.find((p: any) => p.name === phaseName)
                  const status = phase?.status || "not_started"
                  const progress = status === "completed" ? 100 : status === "in_progress" ? 50 : 0

                  return (
                    <div key={phaseName}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{phaseName}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === "completed"
                              ? "bg-success"
                              : status === "in_progress"
                                ? "bg-primary"
                                : "bg-muted-foreground/20"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No phase data available</p>
            )}
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="bg-card rounded-lg border border-border p-6 h-fit">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : activity.length > 0 ? (
              activity.slice(0, 8).map((act: any) => (
                <div key={act.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{act.actor}</span>
                        <span> {act.action} </span>
                        <span className="font-medium text-foreground">{act.target}</span>
                      </p>
                      {act.clientName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{act.clientName}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{act.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
