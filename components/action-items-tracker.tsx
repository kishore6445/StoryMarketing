"use client"

import { CheckCircle2, AlertCircle, Clock, User, Calendar, Flag } from "lucide-react"

interface ActionItem {
  id: string
  description: string
  owner: string
  dueDate: string
  status: "pending" | "in_progress" | "completed"
  priority: "high" | "medium" | "low"
  owner_avatar?: string
}

export function ActionItemsTracker({ actionItems = [] }: { actionItems?: ActionItem[] }) {
  const mockActionItems: ActionItem[] =
    actionItems.length > 0
      ? actionItems
      : [
          {
            id: "ai-1",
            description: "Revise website copy with stronger competitive positioning",
            owner: "John Smith",
            dueDate: "2026-02-05",
            status: "in_progress",
            priority: "high",
            owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          },
          {
            id: "ai-2",
            description: "Schedule LinkedIn launch kickoff meeting",
            owner: "Sarah Chen",
            dueDate: "2026-02-09",
            status: "pending",
            priority: "medium",
            owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          },
          {
            id: "ai-3",
            description: "Gather customer testimonials for website",
            owner: "ABC Manufacturing",
            dueDate: "2026-02-07",
            status: "pending",
            priority: "high",
            owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ABC",
          },
          {
            id: "ai-4",
            description: "Review brand guidelines documentation",
            owner: "Michael Johnson",
            dueDate: "2026-02-06",
            status: "completed",
            priority: "low",
            owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
          },
        ]

  const statusConfig = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      bg: "bg-[#FFF3E0]",
      text: "text-[#E65100]",
      label: "Pending",
    },
    in_progress: {
      icon: <AlertCircle className="w-4 h-4" />,
      bg: "bg-[#E3F2FD]",
      text: "text-[#0051C3]",
      label: "In Progress",
    },
    completed: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      bg: "bg-[#E8F5E9]",
      text: "text-[#2E7D32]",
      label: "Completed",
    },
  }

  const priorityConfig = {
    high: { icon: "🔴", label: "High", color: "text-[#D32F2F]" },
    medium: { icon: "🟡", label: "Medium", color: "text-[#E65100]" },
    low: { icon: "🟢", label: "Low", color: "text-[#2E7D32]" },
  }

  const overdue = mockActionItems.filter(
    (ai) => ai.status !== "completed" && new Date(ai.dueDate) < new Date()
  ).length

  const dueThisWeek = mockActionItems.filter((ai) => {
    const dueDate = new Date(ai.dueDate)
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return ai.status !== "completed" && dueDate >= today && dueDate <= sevenDaysFromNow
  }).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#1D1D1F] flex items-center gap-2">
          <Flag className="w-5 h-5 text-[#007AFF]" />
          Action Items Tracker
        </h2>
        <p className="text-sm text-[#86868B]">{mockActionItems.filter((ai) => ai.status !== "completed").length} active items</p>
      </div>

      {/* Alert Badges */}
      <div className="flex gap-3">
        {overdue > 0 && (
          <div className="px-4 py-2 bg-[#FFEBEE] border border-[#D32F2F] rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D32F2F]" />
            <span className="text-sm font-medium text-[#D32F2F]">{overdue} overdue</span>
          </div>
        )}
        {dueThisWeek > 0 && (
          <div className="px-4 py-2 bg-[#FFF3E0] border border-[#E65100] rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E65100]" />
            <span className="text-sm font-medium text-[#E65100]">{dueThisWeek} due this week</span>
          </div>
        )}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {mockActionItems.map((action) => (
          <div
            key={action.id}
            className={`border rounded-lg p-4 ${
              action.status === "completed"
                ? "bg-[#F8F9FB] border-[#E5E5E7]"
                : "bg-white border-[#E5E5E7] hover:border-[#D1D1D6]"
            } transition-colors`}
          >
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className={`${statusConfig[action.status].bg} ${statusConfig[action.status].text} rounded-lg p-2 flex-shrink-0 mt-1`}>
                {statusConfig[action.status].icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`font-medium ${action.status === "completed" ? "line-through text-[#86868B]" : "text-[#1D1D1F]"}`}>
                  {action.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#86868B]">
                  {/* Owner */}
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span>{action.owner}</span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(action.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-1">
                    <span className="text-base">{priorityConfig[action.priority].icon}</span>
                    <span className={priorityConfig[action.priority].color}>{priorityConfig[action.priority].label}</span>
                  </div>

                  {/* Status Badge */}
                  <div className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${statusConfig[action.status].bg} ${statusConfig[action.status].text}`}>
                    {statusConfig[action.status].label}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
