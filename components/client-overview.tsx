"use client"

import { useState } from "react"
import { AlertCircle, Clock, CheckCircle2, X, TrendingUp, AlertTriangle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { InlineSprintCreator } from "./inline-sprint-creator"
import { SprintSegments } from "./sprint-segments"

interface ClientPending {
  clientId: string
  clientName: string
  pendingTaskCount: number
  overdueTasks: number
  tasksDueToday: number
  currentPhase: string
  lastActivity: string
}

// Dummy Data for Demo
const DUMMY_CLIENTS: ClientPending[] = [
  {
    clientId: "client-1",
    clientName: "Acme Corporation",
    pendingTaskCount: 12,
    overdueTasks: 2,
    tasksDueToday: 3,
    currentPhase: "Story Research",
    lastActivity: "2026-02-18T10:30:00Z",
  },
  {
    clientId: "client-2",
    clientName: "Tech Startup Inc",
    pendingTaskCount: 8,
    overdueTasks: 0,
    tasksDueToday: 1,
    currentPhase: "Story Writing",
    lastActivity: "2026-02-17T14:15:00Z",
  },
  {
    clientId: "client-3",
    clientName: "Marketing OS",
    pendingTaskCount: 15,
    overdueTasks: 1,
    tasksDueToday: 2,
    currentPhase: "Story Design & Video",
    lastActivity: "2026-02-18T09:45:00Z",
  },
  {
    clientId: "client-4",
    clientName: "E-Commerce Plus",
    pendingTaskCount: 6,
    overdueTasks: 0,
    tasksDueToday: 0,
    currentPhase: "Story Website",
    lastActivity: "2026-02-16T16:20:00Z",
  },
  {
    clientId: "client-5",
    clientName: "Digital Agency Pro",
    pendingTaskCount: 10,
    overdueTasks: 3,
    tasksDueToday: 4,
    currentPhase: "Story Distribution",
    lastActivity: "2026-02-18T11:00:00Z",
  },
]

const DUMMY_SPRINTS = [
  {
    id: "sprint-1",
    name: "Week 1: Feb 16 - Feb 22",
    startDate: "Feb 16, 2026",
    endDate: "Feb 22, 2026",
    status: "active" as const,
    tasks: [
      {
        id: "task-1",
        title: "Research competitor strategy",
        status: "done" as const,
        priority: "high" as const,
      },
      {
        id: "task-2",
        title: "Customer interviews",
        status: "in_review" as const,
        priority: "high" as const,
      },
    ],
  },
  {
    id: "sprint-2",
    name: "Week 2: Feb 23 - Mar 1",
    startDate: "Feb 23, 2026",
    endDate: "Mar 1, 2026",
    status: "planning" as const,
    tasks: [],
  },
]

export function ClientOverview() {
  const [sortBy, setSortBy] = useState<"pending" | "overdue" | "name">("pending")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)

  const clients = DUMMY_CLIENTS
  const sprints = selectedClientId ? DUMMY_SPRINTS : []
  const selectedClient = clients.find((c) => c.clientId === selectedClientId)

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "pending") return b.pendingTaskCount - a.pendingTaskCount
    if (sortBy === "overdue") return b.overdueTasks - a.overdueTasks
    return a.clientName.localeCompare(b.clientName)
  })

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* LEFT COLUMN: Clients List (Primary) */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] mb-2">Client Overview</h1>
          <p className="text-sm text-[#86868B]">Track pending work and prioritize your focus</p>
        </div>

        {/* Summary Stats - High Level */}
        <div className="grid grid-cols-3 gap-3 mb-8 flex-shrink-0">
          {/* Total Clients */}
          <div className="bg-gradient-to-br from-[#F5F5F7] to-[#EFEFEF] border border-[#E5E5E7] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wide">Total Clients</span>
              <TrendingUp className="w-4 h-4 text-[#007AFF]" />
            </div>
            <p className="text-2xl font-bold text-[#1D1D1F]">{clients.length}</p>
          </div>

          {/* Total Pending Tasks */}
          <div className="bg-gradient-to-br from-[#E3F2FF] to-[#DCEAFF] border border-[#007AFF]/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#0051CC] uppercase tracking-wide">Pending</span>
              <Zap className="w-4 h-4 text-[#007AFF]" />
            </div>
            <p className="text-2xl font-bold text-[#007AFF]">
              {clients.reduce((sum, c) => sum + c.pendingTaskCount, 0)}
            </p>
          </div>

          {/* Total Overdue */}
          <div className="bg-gradient-to-br from-[#FFE5E5] to-[#FFDADA] border border-[#FF3B30]/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wide">Overdue</span>
              <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
            </div>
            <p className="text-2xl font-bold text-[#FF3B30]">
              {clients.reduce((sum, c) => sum + c.overdueTasks, 0)}
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mb-6 flex-shrink-0">
          <p className="text-xs font-medium text-[#86868B] mb-3 uppercase tracking-wide">Sort by</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("pending")}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                sortBy === "pending"
                  ? "bg-[#007AFF] text-white shadow-sm"
                  : "bg-white border border-[#E5E5E7] text-[#1D1D1F] hover:border-[#D1D1D6]"
              )}
            >
              Most Pending
            </button>
            <button
              onClick={() => setSortBy("overdue")}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                sortBy === "overdue"
                  ? "bg-[#FF3B30] text-white shadow-sm"
                  : "bg-white border border-[#E5E5E7] text-[#1D1D1F] hover:border-[#D1D1D6]"
              )}
            >
              Most Overdue
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                sortBy === "name"
                  ? "bg-[#34C759] text-white shadow-sm"
                  : "bg-white border border-[#E5E5E7] text-[#1D1D1F] hover:border-[#D1D1D6]"
              )}
            >
              By Name
            </button>
          </div>
        </div>

        {/* Clients List - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-2">
          {sortedClients.map((client) => {
            const isSelected = selectedClientId === client.clientId
            const hasOverdue = client.overdueTasks > 0
            
            return (
              <div
                key={client.clientId}
                onClick={() => setSelectedClientId(client.clientId)}
                className={cn(
                  "rounded-lg border-2 transition-all cursor-pointer group",
                  isSelected
                    ? "border-[#007AFF] bg-[#F0F7FF] shadow-sm"
                    : "border-[#E5E5E7] bg-white hover:border-[#D1D1D6] hover:shadow-sm"
                )}
              >
                <div className="p-4">
                  {/* Client Name & Phase */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1D1D1F] truncate">{client.clientName}</h3>
                      <p className="text-xs text-[#86868B] mt-1">{client.currentPhase}</p>
                    </div>
                    {hasOverdue && (
                      <div className="flex-shrink-0 p-1.5 bg-[#FF3B30]/10 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
                      </div>
                    )}
                  </div>

                  {/* Main Metric - Pending Count (Prominent) */}
                  <div className="mb-3 p-3 bg-[#F5F5F7] rounded-lg">
                    <p className="text-xs text-[#86868B] font-medium mb-1">PENDING TASKS</p>
                    <p className="text-3xl font-bold text-[#007AFF]">{client.pendingTaskCount}</p>
                  </div>

                  {/* Secondary Stats - Horizontal */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={cn(
                      "rounded p-2 text-center",
                      hasOverdue ? "bg-[#FF3B30]/10" : "bg-[#F5F5F7]"
                    )}>
                      <p className="text-xs text-[#86868B] font-medium">Overdue</p>
                      <p className={cn(
                        "text-lg font-semibold mt-1",
                        hasOverdue ? "text-[#FF3B30]" : "text-[#34C759]"
                      )}>
                        {client.overdueTasks}
                      </p>
                    </div>
                    <div className="bg-[#34C759]/10 rounded p-2 text-center">
                      <p className="text-xs text-[#86868B] font-medium">Due Today</p>
                      <p className="text-lg font-semibold text-[#34C759] mt-1">{client.tasksDueToday}</p>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <p className="text-xs text-[#86868B]">Updated: {client.lastActivity}</p>

                  {/* CTA - Only on hover/selected */}
                  {isSelected && (
                    <button className="w-full mt-4 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all">
                      View Sprint Details
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Sprint Details (Secondary) */}
      {selectedClientId && selectedClient && (
        <div className="w-full lg:w-96 flex flex-col min-h-0 bg-[#FAFBFC] border-l border-[#E5E5E7] pl-8 lg:pl-0 lg:border-l lg:border-[#E5E5E7] pt-20 lg:pt-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-[#1D1D1F] truncate">{selectedClient.clientName}</h2>
              <p className="text-xs text-[#86868B] mt-1">{selectedClient.currentPhase}</p>
            </div>
            <button
              onClick={() => setSelectedClientId(null)}
              className="flex-shrink-0 p-2 hover:bg-[#E5E5E7] rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-[#86868B]" />
            </button>
          </div>

          {/* Sprint Overview Stats */}
          <div className="space-y-3 mb-8 flex-shrink-0">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-600 font-medium uppercase mb-1">Active Sprints</div>
              <div className="text-2xl font-bold text-blue-900">
                {sprints.filter(s => s.status === 'active').length}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-xs text-orange-600 font-medium uppercase mb-1">Planning</div>
              <div className="text-2xl font-bold text-orange-900">
                {sprints.filter(s => s.status === 'planning').length}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-600 font-medium uppercase mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-900">
                {sprints.filter(s => s.status === 'completed').length}
              </div>
            </div>
          </div>

          {/* Sprint Management */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4">Sprint Management</h3>
              <SprintSegments
                sprints={sprints}
                tasks={[]}
                backlogTasks={[]}
                isLoading={false}
              />
            </div>

            {/* Create Sprint */}
            <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
              <InlineSprintCreator
                clientId={selectedClientId}
                sprints={sprints}
                selectedSprintId={selectedSprintId}
                onSprintChange={setSelectedSprintId}
                onSprintCreated={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
