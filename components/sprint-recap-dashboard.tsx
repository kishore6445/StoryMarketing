"use client"

import { useState } from "react"
import { Calendar, Users, TrendingUp } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { SprintStatsCard } from "./sprint-stats-card"
import { CompletedTasksList } from "./completed-tasks-list"

interface TeamMember {
  id: string
  full_name: string
  email: string
}

interface Task {
  id: string
  task_id?: string
  title: string
  client_name: string
  due_date: string
  completed_date: string
  status: string
}

interface SprintStats {
  totalTasks: number
  completedTasks: number
  completionPercentage: number
  onTimeCount: number
  overdueCount: number
  completedTasks: Task[]
}

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json())
}

type DateRange = "this-week" | "this-month" | "custom"

export function SprintRecapDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange>("this-week")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  // Fetch team members
  const { data: teamData, isLoading: teamLoading } = useSWR("/api/team/members", fetcher, {
    revalidateOnFocus: false,
  })

  const teamMembers: TeamMember[] = teamData?.members || []

  // Build query params for sprint stats
  const queryParams = new URLSearchParams()
  if (selectedUserId) queryParams.append("userId", selectedUserId)
  queryParams.append("dateRange", dateRange)
  if (dateRange === "custom") {
    if (customStartDate) queryParams.append("startDate", customStartDate)
    if (customEndDate) queryParams.append("endDate", customEndDate)
  }

  // Fetch sprint stats for selected user
  const { data: statsData, isLoading: statsLoading } = useSWR(
    selectedUserId ? `/api/sprint-recap?${queryParams}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const sprintStats: SprintStats | null = statsData || null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sprint Recap</h1>
            <p className="text-gray-600">Weekly and monthly completion stats for your team</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* User Selection */}
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filters */}
            {selectedUserId && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex gap-2">
                  <button
                    onClick={() => setDateRange("this-week")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      dateRange === "this-week"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateRange("this-month")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      dateRange === "this-month"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDateRange("custom")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      dateRange === "custom"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    Custom Range
                  </button>
                </div>
              </div>
            )}

            {/* Custom Date Inputs */}
            {selectedUserId && dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedUserId ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Select a team member to view their sprint recap</p>
          </div>
        ) : statsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <p className="text-gray-600 mt-3">Loading stats...</p>
          </div>
        ) : sprintStats ? (
          <div className="space-y-6">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <SprintStatsCard
                label="Total Tasks"
                value={sprintStats.totalTasks}
                subtext="in this period"
              />
              <SprintStatsCard
                label="Completed"
                value={sprintStats.completedTasks}
                subtext="tasks finished"
                highlight
              />
              <SprintStatsCard
                label="Completion %"
                value={`${sprintStats.completionPercentage}%`}
                subtext="of assigned work"
              />
              <SprintStatsCard
                label="On Time"
                value={sprintStats.onTimeCount}
                subtext="finished early"
              />
              <SprintStatsCard
                label="Overdue"
                value={sprintStats.overdueCount}
                subtext="completed late"
                isWarning={sprintStats.overdueCount > 0}
              />
            </div>

            {/* Completed Tasks List */}
            <CompletedTasksList tasks={sprintStats.completedTasks || []} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No tasks found for the selected period</p>
          </div>
        )}
      </div>
    </div>
  )
}
