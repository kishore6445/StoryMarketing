"use client"

import { useState } from "react"
import { Filter, Download, Calendar, ListChecks, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientTask {
  id: string
  title: string
  phase: string
  status: "pending" | "in-progress" | "completed"
  priority: "high" | "medium" | "low"
  assignee: string
  dueDate: Date
  completedDate?: Date
  description: string
  section: string
}

interface ClientTasksOverviewProps {
  clientId: string
  clientName: string
  tasks?: ClientTask[]
}

export function ClientTasksOverview({ clientId, clientName, tasks = [] }: ClientTasksOverviewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "all">("week")
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "in-progress" | "completed">("all")
  const [selectedPhase, setSelectedPhase] = useState<"all" | string>("all")

  // Mock data
  const mockTasks: ClientTask[] = [
    {
      id: "task-1",
      title: "Finalize positioning statement",
      phase: "Story Research",
      status: "completed",
      priority: "high",
      assignee: "Sarah Chen",
      dueDate: new Date(2026, 0, 28),
      completedDate: new Date(2026, 0, 27),
      description: "Define hero, villain, problem statement",
      section: "Positioning",
    },
    {
      id: "task-2",
      title: "Create content brief template",
      phase: "Story Writing",
      status: "in-progress",
      priority: "high",
      assignee: "Jordan Smith",
      dueDate: new Date(2026, 1, 7),
      description: "Template for consistent messaging",
      section: "Content Strategy",
    },
    {
      id: "task-3",
      title: "Review competitor analysis",
      phase: "Story Research",
      status: "completed",
      priority: "medium",
      assignee: "Alex Rodriguez",
      dueDate: new Date(2026, 0, 30),
      completedDate: new Date(2026, 0, 29),
      description: "Analyze top 3 competitors",
      section: "Market Research",
    },
    {
      id: "task-4",
      title: "Design brand visual identity",
      phase: "Story Design & Video",
      status: "pending",
      priority: "high",
      assignee: "Morgan Garcia",
      dueDate: new Date(2026, 1, 14),
      description: "Logo, color palette, typography",
      section: "Design System",
    },
    {
      id: "task-5",
      title: "Record hero testimonial video",
      phase: "Story Design & Video",
      status: "pending",
      priority: "medium",
      assignee: "Casey Anderson",
      dueDate: new Date(2026, 1, 21),
      description: "30-second hero story video",
      section: "Video Production",
    },
    {
      id: "task-6",
      title: "Set up social media channels",
      phase: "Story Website",
      status: "in-progress",
      priority: "medium",
      assignee: "Ravi Patel",
      dueDate: new Date(2026, 1, 10),
      description: "LinkedIn, Twitter, Instagram profiles",
      section: "Distribution Setup",
    },
  ]

  const allTasks = tasks.length > 0 ? tasks : mockTasks
  const phases = Array.from(new Set(allTasks.map((t) => t.phase)))

  // Filter tasks
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const filteredTasks = allTasks.filter((task) => {
    let timeframeMatch = true
    if (selectedTimeframe === "week") {
      timeframeMatch = task.dueDate >= weekAgo && task.dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (selectedTimeframe === "month") {
      timeframeMatch = task.dueDate >= monthAgo && task.dueDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    const statusMatch = selectedStatus === "all" || task.status === selectedStatus
    const phaseMatch = selectedPhase === "all" || task.phase === selectedPhase

    return timeframeMatch && statusMatch && phaseMatch
  })

  const statsCount = {
    total: allTasks.length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    inProgress: allTasks.filter((t) => t.status === "in-progress").length,
    pending: allTasks.filter((t) => t.status === "pending").length,
  }

  const generateReport = () => {
    const report = `
Client: ${clientName}
Report Period: ${selectedTimeframe === "week" ? "This Week" : selectedTimeframe === "month" ? "This Month" : "All Time"}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
-------
Total Tasks: ${filteredTasks.length}
Completed: ${filteredTasks.filter((t) => t.status === "completed").length}
In Progress: ${filteredTasks.filter((t) => t.status === "in-progress").length}
Pending: ${filteredTasks.filter((t) => t.status === "pending").length}

TASKS
-----
${filteredTasks
  .map(
    (task) =>
      `[${task.status.toUpperCase()}] ${task.title}
  Phase: ${task.phase}
  Assignee: ${task.assignee}
  Due: ${task.dueDate.toLocaleDateString()}
  Priority: ${task.priority.toUpperCase()}
`
  )
  .join("\n")}
    `
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${clientName}-tasks-report-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F]">Client Tasks Overview</h2>
          <p className="text-sm text-[#86868B] mt-1">All tasks for {clientName} - basis for weekly reporting</p>
        </div>
        <button
          onClick={generateReport}
          className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#0051C3] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-1">Total Tasks</div>
          <div className="text-2xl font-bold text-[#1D1D1F]">{statsCount.total}</div>
        </div>
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-1">Completed</div>
          <div className="text-2xl font-bold text-[#34C759]">{statsCount.completed}</div>
        </div>
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-1">In Progress</div>
          <div className="text-2xl font-bold text-[#007AFF]">{statsCount.inProgress}</div>
        </div>
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-1">Pending</div>
          <div className="text-2xl font-bold text-[#FFB547]">{statsCount.pending}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-[#86868B]" />

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTimeframe("week")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              selectedTimeframe === "week"
                ? "bg-[#2E7D32] text-white"
                : "bg-[#F5F5F7] text-[#515154] hover:bg-[#EBEBED]"
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedTimeframe("month")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              selectedTimeframe === "month"
                ? "bg-[#2E7D32] text-white"
                : "bg-[#F5F5F7] text-[#515154] hover:bg-[#EBEBED]"
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedTimeframe("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              selectedTimeframe === "all"
                ? "bg-[#2E7D32] text-white"
                : "bg-[#F5F5F7] text-[#515154] hover:bg-[#EBEBED]"
            )}
          >
            All Time
          </button>
        </div>

        <div className="w-px h-6 bg-[#E5E5E7]" />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-1.5 border border-[#D1D1D6] rounded-lg text-sm font-medium bg-white text-[#1D1D1F] cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
          className="px-3 py-1.5 border border-[#D1D1D6] rounded-lg text-sm font-medium bg-white text-[#1D1D1F] cursor-pointer"
        >
          <option value="all">All Phases</option>
          {phases.map((phase) => (
            <option key={phase} value={phase}>
              {phase}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E7] bg-[#F8F9FB]">
                <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Task</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Phase</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Assignee</th>
                <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Due Date</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-[#E5E5E7] hover:bg-[#F8F9FB] transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-[#1D1D1F]">{task.title}</div>
                      <div className="text-xs text-[#86868B] mt-1">{task.section}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#515154]">{task.phase}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        task.status === "completed" && "bg-[#E8F5E9] text-[#2E7D32]",
                        task.status === "in-progress" && "bg-[#E3F2FD] text-[#0051C3]",
                        task.status === "pending" && "bg-[#FFF3E0] text-[#9E5610]"
                      )}
                    >
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#515154]">{task.assignee}</td>
                  <td className="py-3 px-4 text-[#515154]">{task.dueDate.toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        task.priority === "high" && "bg-[#FFEBEE] text-[#C41E00]",
                        task.priority === "medium" && "bg-[#FFF3E0] text-[#9E5610]",
                        task.priority === "low" && "bg-[#F0F4C3] text-[#7A7C00]"
                      )}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center">
            <ListChecks className="w-12 h-12 text-[#D1D1D6] mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">No tasks found for selected filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
