"use client"

import { ChevronDown, LogOut, Settings, BarChart3, User } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SprintToolbarPremiumProps {
  userProfile?: {
    id: string
    fullName?: string
    displayName?: string
    profilePhotoUrl?: string
    role?: string
    personalMotto?: string
  }
  overdueTasks: number
  completedThisWeek: number
  sprintName: string
  endDate: string
  daysRemaining: number
  completedTasks: number
  totalTasks: number
  sprintFilter: "current-sprint" | "backlog"
  onSprintFilterChange: (filter: "current-sprint" | "backlog") => void
  onAddTask: () => void
  onLogout?: () => void
}

export function SprintToolbarPremium({
  userProfile,
  overdueTasks,
  completedThisWeek,
  sprintName,
  endDate,
  daysRemaining,
  completedTasks,
  totalTasks,
  sprintFilter,
  onSprintFilterChange,
  onAddTask,
  onLogout,
}: SprintToolbarPremiumProps) {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)

  const getUserInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.split(" ")
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase()
  }

  const getUserName = () => {
    return userProfile?.displayName || userProfile?.fullName || "User"
  }

  const getFormattedEndDate = () => {
    const date = new Date(endDate)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[#E5E5E7] backdrop-blur-sm bg-white/95">
      <div className="px-6 py-3 flex items-center justify-between gap-6" style={{ minHeight: "64px" }}>
        {/* LEFT: Personal Identity Block */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-semibold text-sm hover:opacity-90 transition-opacity relative"
              title={getUserName()}
            >
              {userProfile?.profilePhotoUrl ? (
                <img
                  src={userProfile.profilePhotoUrl}
                  alt={getUserName()}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getUserInitials(getUserName())
              )}
            </button>

            {/* Avatar Dropdown Menu */}
            {showAvatarMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[#E5E5E7] rounded-lg shadow-lg min-w-48 z-50">
                <div className="p-3 border-b border-[#E5E5E7]">
                  <p className="font-semibold text-[#1D1D1F] text-sm">{getUserName()}</p>
                  <p className="text-xs text-[#86868B]">{userProfile?.role || "Team Member"}</p>
                </div>
                <button className="w-full px-3 py-2 text-left text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors">
                  <BarChart3 className="w-4 h-4" />
                  My Metrics
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full px-3 py-2 text-left text-sm text-[#FF3B30] hover:bg-[#FFF5F7] flex items-center gap-2 transition-colors border-t border-[#E5E5E7]"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Identity Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1D1D1F] truncate">{getUserName()}</p>
            {userProfile?.personalMotto && (
              <p className="text-xs text-[#86868B] truncate">{userProfile.personalMotto}</p>
            )}
            {!userProfile?.personalMotto && userProfile?.role && (
              <p className="text-xs text-[#86868B] truncate">{userProfile.role}</p>
            )}

            {/* Inline Stats */}
            <div className="flex items-center gap-3 mt-1">
              {overdueTasks > 0 && (
                <span className="text-xs text-[#FF3B30] font-medium">
                  Overdue: <span className="font-semibold">{overdueTasks}</span>
                </span>
              )}
              <span className="text-xs text-[#34C759] font-medium">
                Done Week: <span className="font-semibold">{completedThisWeek}</span>
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Sprint Information */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <p className="text-sm font-semibold text-[#1D1D1F]">{sprintName}</p>
          <p className="text-xs text-[#86868B]">
            Ends {getFormattedEndDate()} • <span className="font-medium">{daysRemaining}d</span> left
          </p>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {/* Segmented Control */}
          <div className="flex items-center gap-1 bg-[#F5F5F7] rounded-full p-1">
            <button
              onClick={() => onSprintFilterChange("current-sprint")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                sprintFilter === "current-sprint"
                  ? "bg-white text-[#007AFF] shadow-sm"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              )}
            >
              Current Sprint
            </button>
            <button
              onClick={() => onSprintFilterChange("backlog")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                sprintFilter === "backlog"
                  ? "bg-white text-[#007AFF] shadow-sm"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              )}
            >
              Backlog
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs font-semibold text-[#1D1D1F]">
              {completedTasks} / {totalTasks}
            </p>
            <div className="w-24 h-1 bg-[#E5E5E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#34C759] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Add Task Button */}
          <button
            onClick={onAddTask}
            className="px-4 py-2 bg-[#007AFF] text-white text-xs font-semibold rounded-lg hover:bg-[#0051D5] transition-colors flex items-center gap-1 flex-shrink-0"
          >
            + Add Task
          </button>
        </div>
      </div>
    </div>
  )
}
