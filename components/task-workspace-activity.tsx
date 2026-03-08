"use client"

import { useEffect, useState } from "react"
import { Plus, Users, CheckCircle2, Edit2, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityEvent {
  id: string
  type: "created" | "status_changed" | "assigned" | "deadline_changed" | "moved" | "updated"
  actor: { name: string; avatar?: string }
  description: string
  details?: any
  createdAt: string
}

interface TaskWorkspaceActivityProps {
  taskId: string
}

export function TaskWorkspaceActivity({ taskId }: TaskWorkspaceActivityProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("sessionToken")
        const response = await fetch(`/api/tasks/${taskId}/activity`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Activities loaded:", data)
          // Map API response to component format
          setActivities(data.map((a: any) => ({
            id: a.id,
            type: a.action_type,
            actor: { name: a.actor?.full_name || "Unknown" },
            description: a.description || getActivityLabel(a.action_type),
            details: { old_value: a.old_value, new_value: a.new_value },
            createdAt: a.created_at
          })))
        }
      } catch (error) {
        console.error("[v0] Error loading activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (taskId) {
      loadActivities()
    }
  }, [taskId])

  const getActivityIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "created":
        return <Plus className="w-5 h-5 text-green-600" />
      case "status_changed":
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />
      case "assigned":
        return <Users className="w-5 h-5 text-purple-600" />
      case "deadline_changed":
        return <Clock className="w-5 h-5 text-orange-600" />
      case "moved":
        return <FileText className="w-5 h-5 text-indigo-600" />
      case "updated":
        return <Edit2 className="w-5 h-5 text-gray-600" />
      default:
        return <Edit2 className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityLabel = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "created":
        return "Task created"
      case "status_changed":
        return "Status changed"
      case "assigned":
        return "Assignee changed"
      case "deadline_changed":
        return "Deadline changed"
      case "moved":
        return "Task moved"
      case "updated":
        return "Task updated"
      default:
        return "Updated"
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">Loading activity...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline - Show Latest 5 Activities */}
      <div className="relative">
        {activities.slice(0, 5).map((activity, index) => (
          <div key={activity.id} className="flex gap-4 pb-6">
            {/* Timeline Line */}
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center z-10 relative">
                {getActivityIcon(activity.type)}
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Activity Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {getActivityLabel(activity.type)}
                  </h4>
                  <p className="text-xs text-gray-600">
                    by {activity.actor.name}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString()} at{" "}
                  {new Date(activity.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>

              {/* Activity Details */}
              {activity.details && (
                <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2 border-l-2 border-gray-200">
                  {activity.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
