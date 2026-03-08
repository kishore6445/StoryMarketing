"use client"

import { useState } from "react"
import useSWR from "swr"
import { AlertCircle, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function WeeklySummary() {
  const { data, isLoading, error } = useSWR("/api/my-tasks", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const tasks = data?.tasks || []

  // Categorize tasks by due date
  const overdueTasks = tasks.filter((t: any) => t.status !== "done" && new Date(t.dueDate || t.promisedDate) < today)
  const dueTodayTasks = tasks.filter((t: any) => {
    const due = new Date(t.dueDate || t.promisedDate)
    due.setHours(0, 0, 0, 0)
    return t.status !== "done" && due.getTime() === today.getTime()
  })
  const dueTomorrowTasks = tasks.filter((t: any) => {
    const due = new Date(t.dueDate || t.promisedDate)
    due.setHours(0, 0, 0, 0)
    return t.status !== "done" && due.getTime() === tomorrow.getTime()
  })

  const allPriorityTasks = [...overdueTasks, ...dueTodayTasks, ...dueTomorrowTasks]

  // Calculate PKR (Promises Kept Ratio)
  const completedTasks = tasks.filter((t: any) => t.status === "done").length
  const promisedTasks = tasks.length
  const pkr = promisedTasks > 0 ? Math.round((completedTasks / promisedTasks) * 100) : 0
  const pkrDisplay = isNaN(pkr) ? "—" : `${pkr}%`

  // Count overdue tasks
  const overduCount = overdueTasks.length

  // Get unique clients and calculate at-risk status
  const clientMap = new Map<string, { tasks: any[]; hasOverdue: boolean }>()
  tasks.forEach((task: any) => {
    const clientId = task.clientId || "unassigned"
    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, { tasks: [], hasOverdue: false })
    }
    const client = clientMap.get(clientId)!
    client.tasks.push(task)
    if (task.status !== "done" && new Date(task.dueDate || task.promisedDate) < today) {
      client.hasOverdue = true
    }
  })

  const clientsAtRisk = Array.from(clientMap.entries())
    .map(([id, data]) => {
      const clientTasksPkr = data.tasks.length > 0 ? Math.round((data.tasks.filter((t: any) => t.status === "done").length / data.tasks.length) * 100) : 0
      return {
        id,
        name: data.tasks[0]?.clientName || "Unassigned",
        pkr: isNaN(clientTasksPkr) ? 0 : clientTasksPkr,
        overduCount: data.tasks.filter((t: any) => t.status !== "done" && new Date(t.dueDate || t.promisedDate) < today).length,
        totalTasks: data.tasks.length,
        tasks: data.tasks,
        isAtRisk: (isNaN(clientTasksPkr) ? 0 : clientTasksPkr) < 70 || data.hasOverdue,
      }
    })
    .filter((c) => c.isAtRisk)
    .sort((a, b) => a.pkr - b.pkr)

  const standupText = `Morning Standup – Priorities

${
  overdueTasks.length > 0
    ? `Overdue
${overdueTasks
  .map((t: any) => `• ${t.title} — ${t.owner || "Unassigned"} — ${t.clientName || "—"} — ${new Date(t.dueDate || t.promisedDate).toLocaleDateString()}`)
  .join("\n")}

`
    : ""
}${
  dueTodayTasks.length > 0
    ? `Due Today
${dueTodayTasks
  .map((t: any) => `• ${t.title} — ${t.owner || "Unassigned"} — ${t.clientName || "—"}`)
  .join("\n")}

`
    : ""
}${
  dueTomorrowTasks.length > 0
    ? `Due Tomorrow
${dueTomorrowTasks
  .map((t: any) => `• ${t.title} — ${t.owner || "Unassigned"} — ${t.clientName || "—"}`)
  .join("\n")}

`
    : ""
}`.trim()

  const copyStandup = () => {
    navigator.clipboard.writeText(standupText)
    setCopiedId("standup")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleClientExpand = (clientId: string) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId)
    } else {
      newExpanded.add(clientId)
    }
    setExpandedClients(newExpanded)
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[#86868B]">{isLoading ? "Loading command center..." : "Initializing..."}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[#FF3B30]">Error loading data: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E7] px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">Command Center</h1>
        <p className="text-[#86868B]">Weekly delivery snapshot · PKR · Overdue · Risk</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Top 3 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Team PKR */}
          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7] shadow-sm">
            <p className="text-[#86868B] text-sm font-medium mb-4">Team PKR %</p>
            <div className="text-5xl font-bold text-[#1D1D1F] mb-2">{pkrDisplay}</div>
            <p className="text-[#86868B] text-sm">{completedTasks} of {promisedTasks} delivered</p>
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7] shadow-sm">
            <p className="text-[#86868B] text-sm font-medium mb-4">Overdue</p>
            <div className={cn("text-5xl font-bold mb-2", overduCount > 0 ? "text-[#FF3B30]" : "text-[#1D1D1F]")}>
              {overduCount}
            </div>
            <p className="text-[#86868B] text-sm">Need attention</p>
          </div>

          {/* Clients At Risk */}
          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7] shadow-sm">
            <p className="text-[#86868B] text-sm font-medium mb-4">Clients At Risk</p>
            <div className={cn("text-5xl font-bold mb-2", clientsAtRisk.length > 0 ? "text-[#FF9500]" : "text-[#1D1D1F]")}>
              {clientsAtRisk.length}
            </div>
            <p className="text-[#86868B] text-sm">Priority follow-ups</p>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="bg-white rounded-xl p-8 border border-[#E5E5E7] shadow-sm mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Today's Focus</h2>
            <button
              onClick={copyStandup}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] text-sm font-medium rounded-lg hover:bg-[#E5E5E7] transition-all"
            >
              {copiedId === "standup" ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Standup
                </>
              )}
            </button>
          </div>

          {allPriorityTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E5E7]">
                    <th className="text-left py-3 px-4 font-semibold text-[#86868B]">Due</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#86868B]">Task</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#86868B]">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#86868B]">Owner</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#86868B]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueTasks.map((task: any) => (
                    <tr key={task.id} className="border-b border-[#F5F5F7] hover:bg-[#F9FAFB]">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFEBEE] text-[#FF3B30]">
                          Overdue
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#1D1D1F]">{task.title}</td>
                      <td className="py-3 px-4 text-[#86868B]">{task.clientName || "—"}</td>
                      <td className="py-3 px-4 text-[#86868B]">{task.owner || "—"}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#86868B]">
                          To Do
                        </span>
                      </td>
                    </tr>
                  ))}
                  {dueTodayTasks.map((task: any) => (
                    <tr key={task.id} className="border-b border-[#F5F5F7] hover:bg-[#F9FAFB]">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF3E0] text-[#E65100]">
                          Today
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#1D1D1F]">{task.title}</td>
                      <td className="py-3 px-4 text-[#86868B]">{task.clientName || "—"}</td>
                      <td className="py-3 px-4 text-[#86868B]">{task.owner || "—"}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#86868B]">
                          To Do
                        </span>
                      </td>
                    </tr>
                  ))}
                  {dueTomorrowTasks.map((task: any) => (
                    <tr key={task.id} className="border-b border-[#F5F5F7] hover:bg-[#F9FAFB]">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
                          Tomorrow
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#1D1D1F]">{task.title}</td>
                      <td className="py-3 px-4 text-[#86868B]">{task.clientName || "—"}</td>
                      <td className="py-3 px-4 text-[#86868B]">{task.owner || "—"}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#86868B]">
                          To Do
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#86868B]">No urgent items today. Keep shipping.</p>
            </div>
          )}
        </div>

        {/* Clients At Risk */}
        {clientsAtRisk.length > 0 && (
          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7] shadow-sm mb-10">
            <h2 className="text-xl font-semibold text-[#1D1D1F] mb-6">Clients At Risk</h2>

            <div className="space-y-0">
              {clientsAtRisk.map((client) => (
                <div key={client.id}>
                  <button
                    onClick={() => toggleClientExpand(client.id)}
                    className="w-full flex items-center justify-between py-4 px-4 border-b border-[#E5E5E7] hover:bg-[#F9FAFB] transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-[#1D1D1F] font-medium">{client.name}</span>
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", client.pkr < 70 ? "bg-[#FFEBEE] text-[#FF3B30]" : "bg-[#E8F5E9] text-[#2E7D32]")}>
                        {client.pkr}% PKR
                      </span>
                      {client.overduCount > 0 && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#FFEBEE] text-[#FF3B30]">
                          {client.overduCount} overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[#86868B] text-sm">
                      <span>{client.totalTasks} tasks</span>
                      {expandedClients.has(client.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {expandedClients.has(client.id) && (
                    <div className="bg-[#F9FAFB] p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E5E5E7]">
                            <th className="text-left py-2 px-2 font-semibold text-[#86868B]">Task</th>
                            <th className="text-left py-2 px-2 font-semibold text-[#86868B]">Owner</th>
                            <th className="text-left py-2 px-2 font-semibold text-[#86868B]">Due</th>
                            <th className="text-left py-2 px-2 font-semibold text-[#86868B]">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {client.tasks.map((task: any) => (
                            <tr key={task.id} className="border-b border-[#E5E5E7]">
                              <td className="py-2 px-2 text-[#1D1D1F]">{task.title}</td>
                              <td className="py-2 px-2 text-[#86868B]">{task.owner || "—"}</td>
                              <td className="py-2 px-2 text-[#86868B]">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                              </td>
                              <td className="py-2 px-2">
                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", task.status === "done" ? "bg-[#E8F5E9] text-[#2E7D32]" : task.status === "in_progress" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#F5F5F7] text-[#86868B]")}>
                                  {task.status === "done" ? "Done" : task.status === "in_progress" ? "In Progress" : "To Do"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-[#E5E5E7] shadow-sm text-center">
            <AlertCircle className="w-12 h-12 text-[#E5E5E7] mx-auto mb-4" />
            <p className="text-[#86868B]">No tasks assigned yet. Create your first task to get started.</p>
          </div>
        )}

        {tasks.length > 0 && allPriorityTasks.length === 0 && clientsAtRisk.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-[#E5E5E7] shadow-sm text-center">
            <AlertCircle className="w-12 h-12 text-[#34C759] mx-auto mb-4" />
            <p className="text-[#86868B]">All clients are healthy. No urgent items this week.</p>
          </div>
        )}
      </div>
    </div>
  )
}
