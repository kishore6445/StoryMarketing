"use client"

import { useState } from "react"
import { Bell, X, CheckCircle2, AlertCircle, Clock, Share2 } from "lucide-react"

export interface Notification {
  id: string
  type: "scheduled" | "published" | "failed" | "reminder" | "engagement"
  title: string
  description: string
  platform: "linkedin" | "facebook" | "twitter" | "instagram" | "youtube"
  timestamp: string
  read: boolean
  actionUrl?: string
  metadata?: {
    postId?: string
    engagementCount?: number
    reach?: number
  }
}

interface NotificationCenterProps {
  notifications?: Notification[]
  onNotificationRead?: (id: string) => void
  onNotificationDismiss?: (id: string) => void
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "published":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />
    case "failed":
      return <AlertCircle className="w-5 h-5 text-red-600" />
    case "scheduled":
      return <Clock className="w-5 h-5 text-blue-600" />
    case "engagement":
      return <Share2 className="w-5 h-5 text-purple-600" />
    default:
      return <Bell className="w-5 h-5 text-[#86868B]" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "published":
      return "bg-green-50 border-green-200"
    case "failed":
      return "bg-red-50 border-red-200"
    case "scheduled":
      return "bg-blue-50 border-blue-200"
    case "engagement":
      return "bg-purple-50 border-purple-200"
    default:
      return "bg-[#F5F5F7] border-[#E5E5E7]"
  }
}

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "linkedin":
      return "bg-blue-100 text-blue-800"
    case "facebook":
      return "bg-blue-100 text-blue-800"
    case "twitter":
      return "bg-black/10 text-black"
    case "instagram":
      return "bg-pink-100 text-pink-800"
    case "youtube":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "published",
    title: "Post Published Successfully",
    description: 'Your LinkedIn post "5 AI Trends to Watch in 2026" has been published',
    platform: "linkedin",
    timestamp: "2 minutes ago",
    read: false,
    metadata: {
      postId: "post-123",
      reach: 1250,
      engagementCount: 42,
    },
  },
  {
    id: "notif-2",
    type: "scheduled",
    title: "Post Scheduled",
    description: 'Post "Q1 Marketing Strategy" scheduled for Mar 15, 2026 at 9:00 AM',
    platform: "linkedin",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "notif-3",
    type: "engagement",
    title: "High Engagement!",
    description: "Your LinkedIn post reached 5,000+ people today",
    platform: "linkedin",
    timestamp: "3 hours ago",
    read: true,
    metadata: {
      postId: "post-456",
      reach: 5200,
      engagementCount: 187,
    },
  },
  {
    id: "notif-4",
    type: "failed",
    title: "Post Failed to Publish",
    description: 'Failed to publish "Company Update" to Facebook - Invalid media format',
    platform: "facebook",
    timestamp: "5 hours ago",
    read: true,
  },
  {
    id: "notif-5",
    type: "reminder",
    title: "Upcoming Post",
    description: "Reminder: Your post is scheduled to publish in 1 hour",
    platform: "twitter",
    timestamp: "1 day ago",
    read: true,
  },
]

export function NotificationCenter({
  notifications = DEFAULT_NOTIFICATIONS,
  onNotificationRead,
  onNotificationDismiss,
}: NotificationCenterProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [readIds, setReadIds] = useState<string[]>([])

  const handleDismiss = (id: string) => {
    setDismissedIds([...dismissedIds, id])
    onNotificationDismiss?.(id)
  }

  const handleRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds([...readIds, id])
      onNotificationRead?.(id)
    }
  }

  const visibleNotifications = notifications.filter((n) => !dismissedIds.includes(n.id))
  const unreadCount = visibleNotifications.filter((n) => !n.read && !readIds.includes(n.id)).length

  return (
    <div className="space-y-4">
      {/* Header with Unread Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#1D1D1F]" />
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Notifications</h2>
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {visibleNotifications.length === 0 ? (
          <div className="p-6 text-center text-[#86868B]">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleRead(notification.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${getNotificationColor(
                notification.type
              )} ${readIds.includes(notification.id) || notification.read ? "opacity-75" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-[#1D1D1F] text-sm">{notification.title}</h3>
                      <p className="text-xs text-[#86868B] mt-1">{notification.description}</p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDismiss(notification.id)
                      }}
                      className="flex-shrink-0 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getPlatformColor(
                        notification.platform
                      )}`}
                    >
                      {notification.platform.charAt(0).toUpperCase() + notification.platform.slice(1)}
                    </span>
                    <span className="text-xs text-[#86868B]">{notification.timestamp}</span>

                    {notification.metadata?.reach && (
                      <span className="text-xs text-[#86868B]">
                        Reach: {notification.metadata.reach.toLocaleString()}
                      </span>
                    )}
                    {notification.metadata?.engagementCount && (
                      <span className="text-xs text-[#86868B]">
                        Engagement: {notification.metadata.engagementCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
