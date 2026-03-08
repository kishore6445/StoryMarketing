"use client"

import { AlertCircle, Clock, Zap } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export function TodaysFocus() {
  const { data, isLoading, mutate } = useSWR("/api/my-tasks", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const tasks = data?.tasks || []

  // Calculate priority score for smart ranking
  const scoredTasks = tasks
    .map((task: any) => {
      let score = 0

      // Priority scoring
      if (task.priority === "high") score += 100
      else if (task.priority === "medium") score += 50
      else score += 10

      // Due date scoring
      if (task.dueDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(task.dueDate)
        due.setHours(0, 0, 0, 0)
        const daysUntilDue = Math.ceil(
          (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilDue < 0) score += 200 // Overdue
        else if (daysUntilDue === 0) score += 150 // Due today
        else if (daysUntilDue <= 2) score += 100 // Due soon
        else score += Math.max(0, 50 - daysUntilDue * 5)
      }

      return { ...task, score }
    })
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3)

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return due < today
  }

  const daysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const days = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    const newStatus = currentStatus ? "todo" : "done"

    mutate(
      {
        tasks: (data?.tasks || []).map((t: any) =>
          t.id === taskId
            ? { ...t, completed: !t.completed, status: newStatus }
            : t
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
    } catch {
      mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="mb-6 bg-white rounded-xl border border-[#E5E5E7] p-6">
        <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          Today's Focus
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#D1D1D6] border-t-[#007AFF] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (scoredTasks.length === 0) {
    return (
      <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
        <Zap className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-emerald-700">
          Clear skies ahead! No urgent tasks. Keep maintaining momentum.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-bold text-[#1D1D1F]">Today's Focus</h3>
        <span className="text-sm font-medium text-[#86868B] bg-[#F5F5F7] px-2.5 py-1 rounded-full">
          {scoredTasks.length} top {scoredTasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scoredTasks.map((task: any, index: number) => {
          const daysLeft = daysUntilDue(task.dueDate)
          const overdue = isOverdue(task.dueDate)
          const dueSoon = daysLeft !== null && daysLeft <= 2

          // Determine border color based on priority/status
          const getBorderClasses = () => {
            if (overdue || task.priority === "high") {
              return "border-l-red-600"
            } else if (task.priority === "medium" || dueSoon) {
              return "border-l-amber-600"
            } else {
              return "border-l-emerald-600"
            }
          }

          return (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-md border border-l-4 transition-all group hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer",
                "hover:shadow-md animate-in fade-in slide-in-from-top-2 bg-white shadow-sm",
                getBorderClasses()
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <span
                  className={cn(
                    "text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0",
                    index === 0
                      ? "bg-red-600"
                      : index === 1
                      ? "bg-amber-600"
                      : "bg-emerald-600"
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-[#1D1D1F] flex-1 line-clamp-2">
                  {task.title}
                </span>
              </div>

              {overdue ? (
                <div className="flex items-center gap-1 text-xs text-red-700 font-semibold leading-tight">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Overdue
                </div>
              ) : dueSoon ? (
                <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold leading-tight">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  Due in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                </div>
              ) : daysLeft !== null ? (
                <div className="text-xs text-[#86868B] leading-tight">
                  Due in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                </div>
              ) : null}

              {task.phaseName && (
                <div className="mt-1.5 text-xs px-1.5 py-1 rounded w-fit font-medium text-[#86868B] bg-[#F5F5F7]">
                  {task.phaseName.split("-").slice(0, 2).join(" ")}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
