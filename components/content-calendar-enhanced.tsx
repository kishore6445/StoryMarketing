"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Lock, Zap } from "lucide-react"
import useSWR from "swr"

interface CalendarPost {
  id: string
  content: string
  platforms: string[]
  scheduled_date: string
  scheduled_time: string
  status: "draft" | "scheduled" | "published" | "failed" | "cancelled"
}

interface BlackoutDate {
  id: string
  date: Date
  reason: string
  type: "holiday" | "maintenance" | "client-request" | "event"
}

interface PlatformSchedule {
  platform: string
  optimalTimes: string[]
  maxFrequency: number
  contentTypes: string[]
  color: string
}

interface ContentCalendarEnhancedProps {
  clientId?: string
  onCreatePost?: () => void
  onViewBlackouts?: () => void
}

const fetcher = (url: string) => {
  const token = localStorage.getItem('sessionToken')
  console.log('[v0] Calendar fetching:', url, 'Token:', token ? 'Present' : 'Missing')
  return fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((res) => {
    console.log('[v0] Calendar response status:', res.status)
    return res.json()
  })
}

export function ContentCalendarEnhanced({
  clientId,
  onCreatePost = () => {},
  onViewBlackouts = () => {},
}: ContentCalendarEnhancedProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<"month" | "week">("month")
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null)

  // Fetch posts from API with caching
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const apiUrl = clientId 
    ? `/api/posts/calendar?clientId=${clientId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
    : `/api/posts/calendar?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  const posts = data?.posts || []

  // Blackout dates - TODO: Make dynamic with API
  const blackoutDates: BlackoutDate[] = []

  // Platform schedules
  const platformSchedules: PlatformSchedule[] = [
    {
      platform: "LinkedIn",
      optimalTimes: ["9:00 AM", "12:30 PM", "5:00 PM"],
      maxFrequency: 3,
      contentTypes: ["text", "image", "video"],
      color: "#0A66C2",
    },
    {
      platform: "Instagram",
      optimalTimes: ["9:00 AM", "6:00 PM", "8:00 PM"],
      maxFrequency: 2,
      contentTypes: ["image", "video", "carousel"],
      color: "#E1306C",
    },
    {
      platform: "Twitter",
      optimalTimes: ["8:00 AM", "1:00 PM", "5:00 PM", "9:00 PM"],
      maxFrequency: 5,
      contentTypes: ["text", "image"],
      color: "#1DA1F2",
    },
    {
      platform: "Facebook",
      optimalTimes: ["1:00 PM", "3:00 PM", "7:00 PM"],
      maxFrequency: 2,
      contentTypes: ["text", "image", "video"],
      color: "#1877F2",
    },
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const isBlackoutDate = (date: Date): BlackoutDate | null => {
    return (
      blackoutDates.find(
        (bd) =>
          bd.date.getDate() === date.getDate() &&
          bd.date.getMonth() === date.getMonth() &&
          bd.date.getFullYear() === date.getFullYear()
      ) || null
    )
  }

  const getPostsForDate = (date: Date): CalendarPost[] => {
    const dateStr = date.toISOString().split("T")[0]
    return posts.filter((post: CalendarPost) => post.scheduled_date === dateStr)
  }

  const getPublishingFrequency = (platform: string) => {
    const postsForPlatform = posts.filter((post: CalendarPost) => post.platforms.includes(platform))
    const schedule = platformSchedules.find((s) => s.platform === platform)
    return {
      count: postsForPlatform.length,
      maxFrequency: schedule?.maxFrequency || 0,
      isOptimal: postsForPlatform.length <= (schedule?.maxFrequency || 0),
    }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Content Calendar</h1>
          <p className="text-sm text-[#86868B]">Plan content distribution, manage blackout dates, optimize posting schedule</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#F5F5F7] rounded w-1/3" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#F5F5F7] rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Content Calendar</h1>
          <p className="text-sm text-[#86868B]">Plan content distribution, manage blackout dates, optimize posting schedule</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <div className="text-center text-[#86868B] py-8">
            <p>Failed to load calendar</p>
            <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5]">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasAnyPosts = posts.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Content Calendar</h1>
        <p className="text-sm text-[#86868B]">Plan content distribution, manage blackout dates, optimize posting schedule</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewType("month")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              viewType === "month"
                ? "bg-[#2E7D32] text-white"
                : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EBEBED]"
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setViewType("week")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              viewType === "week"
                ? "bg-[#2E7D32] text-white"
                : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EBEBED]"
            }`}
          >
            Week View
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewBlackouts}
            className="px-4 py-2 rounded-lg bg-[#FFF3E0] text-[#E65100] hover:bg-[#FFE0B2] transition-colors font-medium text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Blackout Dates
          </button>
          <button
            onClick={onCreatePost}
            className="px-4 py-2 rounded-lg bg-[#2E7D32] text-white hover:bg-[#1B5E20] transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* Platform Frequency Overview */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Publishing Frequency Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformSchedules.map((schedule) => {
            const freq = getPublishingFrequency(schedule.platform)
            return (
              <div
                key={schedule.platform}
                onClick={() => setSelectedPlatform(selectedPlatform === schedule.platform ? null : schedule.platform)}
                className="p-4 border border-[#E5E5E7] rounded-lg hover:bg-[#F8F9FB] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-[#1D1D1F]" style={{ color: schedule.color }}>
                    {schedule.platform}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      freq.isOptimal
                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                        : "bg-[#FFEBEE] text-[#C62828]"
                    }`}
                  >
                    {freq.isOptimal ? "On Track" : "Over Limit"}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-[#86868B]">Posts this month</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#1D1D1F]">{freq.count}</span>
                    <span className="text-sm text-[#86868B]">/ {freq.maxFrequency} max</span>
                  </div>

                  <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        freq.isOptimal ? "bg-[#34C759]" : "bg-[#FF3B30]"
                      }`}
                      style={{ width: `${Math.min((freq.count / freq.maxFrequency) * 100, 100)}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#86868B] mt-2">Optimal times: {schedule.optimalTimes.slice(0, 2).join(", ")}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[#1D1D1F]">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
              }
              className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#1D1D1F]" />
            </button>
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
              }
              className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#1D1D1F]" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center py-2 text-xs font-semibold text-[#86868B] uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const posts = getPostsForDate(date)
            const blackout = isBlackoutDate(date)

            return (
              <div
                key={day}
                className={`aspect-square rounded-lg border border-[#E5E5E7] p-2 text-xs transition-colors ${
                  blackout
                    ? "bg-[#FFEBEE] border-[#FFCDD2] cursor-not-allowed"
                    : posts.length > 0
                      ? "bg-[#E8F5E9] border-[#2E7D32]"
                      : "hover:bg-[#F8F9FB]"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-[#1D1D1F]">{day}</span>
                  {blackout && <Lock className="w-3 h-3 text-[#FF3B30]" />}
                </div>

                {blackout && (
                  <div className="text-[#C62828] font-medium mb-1" title={blackout.reason}>
                    {blackout.type === "holiday" && "🚫"}
                    {blackout.type === "maintenance" && "⚙️"}
                    {blackout.type === "client-request" && "🤝"}
                    {blackout.type === "event" && "📅"}
                  </div>
                )}

                {posts.length > 0 && (
                  <div className="space-y-0.5">
                    {posts.slice(0, 2).map((post: CalendarPost) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPost(post)
                        }}
                        className="px-1 py-0.5 rounded text-[10px] text-white font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: platformSchedules.find((s) => s.platform === post.platforms[0])?.color || '#007AFF',
                        }}
                        title={post.content}
                      >
                        {post.platforms[0] || 'Post'}
                      </div>
                    ))}
                    {posts.length > 2 && <div className="text-[#86868B] text-[10px]">+{posts.length - 2} more</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Platform-Specific Schedule Details */}
      {selectedPlatform && (
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">
            {selectedPlatform} Optimal Schedule
          </h2>

          {platformSchedules
            .filter((s) => s.platform === selectedPlatform)
            .map((schedule) => (
              <div key={schedule.platform} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] mb-2">Best Posting Times</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {schedule.optimalTimes.map((time) => (
                      <div
                        key={time}
                        className="p-3 rounded-lg bg-[#F5F5F7] text-center border border-[#E5E5E7]"
                      >
                        <p className="font-medium text-[#1D1D1F] text-sm">{time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] mb-2">Recommended Content Types</h3>
                  <div className="flex gap-2 flex-wrap">
                    {schedule.contentTypes.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-sm font-medium"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ))}
                  </div>
                </div> */}

                <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg">
                  <div className="flex gap-2">
                    <Zap className="w-5 h-5 text-[#2E7D32] flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#2E7D32] text-sm">Recommended Frequency</p>
                      <p className="text-sm text-[#1B5E20] mt-1">
                        Post up to {schedule.maxFrequency} times per week for optimal engagement without audience fatigue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Post Details</h2>
              <button onClick={() => setSelectedPost(null)} className="text-[#86868B] hover:text-[#1D1D1F]">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-1">Content</label>
                <p className="text-[#1D1D1F] bg-[#F5F5F7] p-3 rounded-lg">{selectedPost.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#86868B] mb-1">Platforms</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPost.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{
                          backgroundColor: platformSchedules.find((s) => s.platform === platform)?.color || '#007AFF',
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#86868B] mb-1">Status</label>
                  <select
                    value={selectedPost.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as CalendarPost['status']
                      const token = localStorage.getItem('sessionToken')
                      
                      try {
                        const response = await fetch(`/api/posts/${selectedPost.id}/status`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                          body: JSON.stringify({ status: newStatus }),
                        })

                        if (response.ok) {
                          setSelectedPost({ ...selectedPost, status: newStatus })
                          mutate() // Refresh calendar
                        }
                      } catch (error) {
                        console.error('[v0] Failed to update status:', error)
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#86868B] mb-1">Scheduled Date</label>
                  <p className="text-[#1D1D1F] bg-[#F5F5F7] p-3 rounded-lg">{selectedPost.scheduled_date}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#86868B] mb-1">Scheduled Time</label>
                  <p className="text-[#1D1D1F] bg-[#F5F5F7] p-3 rounded-lg">{selectedPost.scheduled_time}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blackout Dates Summary */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Blackout Dates This Month</h2>

        {blackoutDates.length > 0 ? (
          <div className="space-y-2">
            {blackoutDates.map((blackout) => (
              <div
                key={blackout.id}
                className="flex items-center gap-3 p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg"
              >
                <div className="text-lg">
                  {blackout.type === "holiday" && "🚫"}
                  {blackout.type === "maintenance" && "⚙️"}
                  {blackout.type === "client-request" && "🤝"}
                  {blackout.type === "event" && "📅"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1D1D1F] text-sm">{blackout.reason}</p>
                  <p className="text-xs text-[#C62828]">
                    {blackout.date.toLocaleDateString("default", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#86868B]">No blackout dates scheduled for this month.</p>
        )}
      </div>
    </div>
  )
}
