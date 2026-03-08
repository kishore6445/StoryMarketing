"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MessageCircle, CheckCircle, Clock, User, FileText, Send } from "lucide-react"

interface ActivityItem {
  id: string
  type: "task_completed" | "comment" | "post_published" | "document_added" | "mention"
  actor: string
  action: string
  target: string
  timestamp: Date
  details?: string
  clientName?: string
  metadata?: Record<string, any>
}

interface ActivityFeedProps {
  clientId?: string
  limit?: number
}

export function ActivityFeed({ clientId = "client-1", limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "task_completed",
      actor: "Sarah",
      action: "completed task",
      target: "Review LinkedIn posting times for optimal engagement",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      clientName: "ABC Manufacturing",
    },
    {
      id: "2",
      type: "post_published",
      actor: "Alex",
      action: "published post to",
      target: "LinkedIn",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      details: "5 Operational Efficiency Tips for Manufacturing",
      clientName: "ABC Manufacturing",
    },
    {
      id: "3",
      type: "document_added",
      actor: "Ravi",
      action: "added document to",
      target: "Story Design - Creative Assets",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      details: "Brand Guidelines v3.pdf",
      clientName: "ABC Manufacturing",
    },
    {
      id: "4",
      type: "comment",
      actor: "Jordan",
      action: "commented on",
      target: "Story Writing Phase",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: "Great progress on the brand voice section! Consider adding more examples.",
      clientName: "ABC Manufacturing",
    },
    {
      id: "5",
      type: "task_completed",
      actor: "Soujanya",
      action: "completed task",
      target: "Update Instagram bio with latest campaign link",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      clientName: "TechStartup XYZ",
    },
  ])

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="w-5 h-5 text-[#34C759]" />
      case "post_published":
        return <Send className="w-5 h-5 text-[#007AFF]" />
      case "document_added":
        return <FileText className="w-5 h-5 text-[#FF9500]" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-[#5AC8FA]" />
      case "mention":
        return <User className="w-5 h-5 text-[#9013FE]" />
      default:
        return <Clock className="w-5 h-5 text-[#86868B]" />
    }
  }

  const getColorClass = (type: ActivityItem["type"]) => {
    switch (type) {
      case "task_completed":
        return "bg-[#E8F5E9]"
      case "post_published":
        return "bg-[#E3F2FD]"
      case "document_added":
        return "bg-[#FFF3E0]"
      case "comment":
        return "bg-[#E0F7FA]"
      case "mention":
        return "bg-[#F3E5F5]"
      default:
        return "bg-[#F5F5F7]"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return format(date, "MMM d")
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, limit).map((activity) => (
        <div key={activity.id} className={`p-4 rounded-lg border border-[#E5E5E7] ${getColorClass(activity.type)}`}>
          <div className="flex gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 pt-0.5">{getIcon(activity.type)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1D1D1F]">
                    <span className="font-semibold">{activity.actor}</span>
                    {" " + activity.action + " "}
                    <span className="font-semibold text-[#007AFF]">{activity.target}</span>
                  </p>
                </div>
                <span className="text-xs text-[#86868B] whitespace-nowrap">{formatTime(activity.timestamp)}</span>
              </div>

              {activity.details && (
                <p className="text-sm text-[#515154] mb-2">"{activity.details}"</p>
              )}

              {activity.clientName && (
                <p className="text-xs text-[#86868B]">
                  Client: <span className="font-medium">{activity.clientName}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-[#86868B]">No activity yet. Start collaborating!</p>
        </div>
      )}
    </div>
  )
}
