"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { AlertCircle, Copy, Check, ChevronDown, ChevronUp, Calendar, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CommandCenterDashboard() {
  const { data, isLoading, error } = useSWR("/api/my-tasks", fetcher)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <p className="text-[#86868B]">Loading Command Center...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <p className="text-[#FF3B30]">Error loading data. Please try again.</p>
      </div>
    )
  }

  const tasks = data.tasks || []

  // Today and tomorrow
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  // Categorize tasks
  const overdueTasks = tasks.filter(
    (t: any) => t.status !== "done" && new Date(t.dueDate || t.promisedDate) < today
  )

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

  // Calculate PKR
  const completedCount = tasks.filter((t: any) => t.status === "done" || t.completed).length
  const totalCount = tasks.length
  const pkr = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Calculate clients at risk
  const clientMap = new Map<string, { tasks: any[]; overdue: number }>()
  tasks.forEach((task: any) => {
    const clientName = task.clientName || "Unassigned"
    if (!clientMap.has(clientName)) {
      clientMap.set(clientName, { tasks: [], overdue: 0 })
    }
    const client = clientMap.get(clientName)!
    client.tasks.push(task)
    if (task.status !== "done" && new Date(task.dueDate || task.promisedDate) < today) {
      client.overdue++
    }
  })

  const clientsAtRisk = Array.from(clientMap.entries())
    .map(([name, data]) => {
      const doneTasks = data.tasks.filter((t: any) => t.status === "done" || t.completed).length
      const pkrValue = data.tasks.length > 0 ? Math.round((doneTasks / data.tasks.length) * 100) : 0
      return {
        name,
        pkr: pkrValue,
        overdue: data.overdue,
        tasks: data.tasks,
        isAtRisk: pkrValue < 70 || data.overdue > 0,
      }
    })
    .filter((c) => c.isAtRisk)
    .sort((a, b) => a.pkr - b.pkr)

  const copyStandup = () => {
    let text = "Morning Standup – Priorities\n\n"

    if (overdueTasks.length > 0) {
      text += "Overdue:\n"
      overdueTasks.forEach((t: any) => {
        text += `• ${t.title} — ${t.clientName || "—"}\n`
      })
      text += "\n"
    }

    if (dueTodayTasks.length > 0) {
      text += "Due Today:\n"
      dueTodayTasks.forEach((t: any) => {
        text += `• ${t.title} — ${t.clientName || "—"}\n`
      })
      text += "\n"
    }

    if (dueTomorrowTasks.length > 0) {
      text += "Due Tomorrow:\n"
      dueTomorrowTasks.forEach((t: any) => {
        text += `• ${t.title} — ${t.clientName || "—"}\n`
      })
    }

    navigator.clipboard.writeText(text)
    setCopiedId("standup")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleExpand = (clientName: string) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName)
    } else {
      newExpanded.add(clientName)
    }
    setExpandedClients(newExpanded)
  }

  const allPriorityTasks = [...overdueTasks, ...dueTodayTasks, ...dueTomorrowTasks]

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E7] px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-1">Command Center</h1>
        <p className="text-[#86868B]">Weekly delivery snapshot · PKR · Overdue · Risk</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7]">
            <p className="text-[#86868B] text-sm font-medium mb-4">Team PKR %</p>
            <div className="text-5xl font-bold text-[#1D1D1F] mb-2">{pkr}%</div>
            <p className="text-[#86868B] text-sm">
              {completedCount} of {totalCount} delivered
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7]">
            <p className="text-[#86868B] text-sm font-medium mb-4">Overdue</p>
            <div className={cn("text-5xl font-bold mb-2", overdueTasks.length > 0 ? "text-[#FF3B30]" : "text-[#1D1D1F]")}>
              {overdueTasks.length}
            </div>
            <p className="text-[#86868B] text-sm">Need attention</p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7]">
            <p className="text-[#86868B] text-sm font-medium mb-4">Clients At Risk</p>
            <div className={cn("text-5xl font-bold mb-2", clientsAtRisk.length > 0 ? "text-[#FF9500]" : "text-[#1D1D1F]")}>
              {clientsAtRisk.length}
            </div>
            <p className="text-[#86868B] text-sm">Priority follow-ups</p>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="bg-white rounded-xl p-8 border border-[#E5E5E7]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#007AFF]" />
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Today's Focus</h2>
            </div>
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
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#86868B]">
                          To Do_test
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
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#86868B]">
                          To Do_test
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
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#86868B]">
                          To Do_test
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
          <div className="bg-white rounded-xl p-8 border border-[#E5E5E7]">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-[#FF9500]" />
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Clients At Risk</h2>
            </div>

            <div className="space-y-0 border border-[#E5E5E7] rounded-lg overflow-hidden">
              {clientsAtRisk.map((client, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => toggleExpand(client.name)}
                    className="w-full flex items-center justify-between py-4 px-4 border-b border-[#E5E5E7] hover:bg-[#F9FAFB] transition-all last:border-b-0"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-[#1D1D1F] font-medium">{client.name}</span>
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", client.pkr < 70 ? "bg-[#FFEBEE] text-[#FF3B30]" : "bg-[#E8F5E9] text-[#2E7D32]")}>
                        {client.pkr}% PKR
                      </span>
                      {client.overdue > 0 && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#FFEBEE] text-[#FF3B30]">
                          {client.overdue} overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[#86868B]">
                      <span className="text-sm">{client.tasks.length} tasks</span>
                      {expandedClients.has(client.name) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {expandedClients.has(client.name) && (
                    <div className="bg-[#F9FAFB] p-4 border-t border-[#E5E5E7]">
                      <div className="space-y-2">
                        {client.tasks.map((task: any) => (
                          <div key={task.id} className="flex items-start gap-3 p-3 bg-white rounded border border-[#E5E5E7]">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#1D1D1F] font-medium truncate">{task.title}</p>
                              <p className="text-xs text-[#86868B] mt-1">
                                Due:{" "}
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "—"}
                              </p>
                            </div>
                            <span className={cn("text-xs font-medium px-2 py-1 rounded whitespace-nowrap", task.status === "done" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#F5F5F7] text-[#86868B]")}>
                              {task.status === "done" ? "Done" : "To Do"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-[#E5E5E7] text-center">
            <AlertCircle className="w-12 h-12 text-[#E5E5E7] mx-auto mb-4" />
            <p className="text-[#86868B]">No tasks assigned yet.</p>
          </div>
        )}

        {tasks.length > 0 && allPriorityTasks.length === 0 && clientsAtRisk.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-[#E5E5E7] text-center">
            <AlertCircle className="w-12 h-12 text-[#34C759] mx-auto mb-4" />
            <p className="text-[#86868B]">All clients healthy. No urgent items this week.</p>
          </div>
        )}
      </div>
    </div>
  )
}
