"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from "swr"

interface CalendarPost {
  id: string
  content: string
  platforms: string[]
  scheduled_time: string
  scheduled_date: string
  status: "draft" | "scheduled" | "published" | "failed" | "cancelled"
}

interface ContentCalendarViewProps {
  clientId?: string | null
  onCreatePost: () => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ContentCalendarView({ clientId, onCreatePost }: ContentCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getPostsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return posts.filter((post: CalendarPost) => post.scheduled_date === dateStr)
  }

  // Expose mutate function for parent components to trigger refresh
  if (typeof window !== 'undefined') {
    (window as any).__calendarMutate = mutate
  }

  if (isLoading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <div className="text-center text-[#86868B] py-8">
          <p>Failed to load calendar</p>
          <Button onClick={() => mutate()} variant="outline" className="mt-4 bg-transparent">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const hasAnyPosts = posts.length > 0

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#1D1D1F]">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={onCreatePost} className="bg-[#007AFF] text-white hover:bg-[#0051D5]" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
          <button onClick={previousMonth} className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#86868B]" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!hasAnyPosts && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F5F5F7] rounded-full mb-4">
            <Plus className="w-8 h-8 text-[#86868B]" />
          </div>
          <h3 className="text-lg font-medium text-[#1D1D1F] mb-2">No scheduled posts</h3>
          <p className="text-sm text-[#86868B] mb-6">Start by scheduling your first post for this month</p>
          <Button onClick={onCreatePost} className="bg-[#007AFF] text-white hover:bg-[#0051D5]">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Your First Post
          </Button>
        </div>
      )}

      {/* Calendar Grid */}
      {hasAnyPosts && (
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-[#86868B] py-2">
              {day}
            </div>
          ))}

          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1
            const dayPosts = getPostsForDate(day)
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={day}
                className={`aspect-square border border-[#E5E5E7] rounded-lg p-2 hover:bg-[#F5F5F7] transition-colors ${
                  isToday ? "ring-2 ring-[#007AFF]" : ""
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-[#007AFF]" : "text-[#1D1D1F]"}`}>{day}</div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post: CalendarPost) => (
                    <div
                      key={post.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : post.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-[#007AFF]/10 text-[#007AFF]'
                      }`}
                      title={post.content}
                    >
                      {post.platforms[0] || 'Post'}
                    </div>
                  ))}
                  {dayPosts.length > 2 && <div className="text-[10px] text-[#86868B]">+{dayPosts.length - 2} more</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
