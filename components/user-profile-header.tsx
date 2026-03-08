"use client"

import { Settings, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfileHeaderProps {
  userName?: string
  userRole?: string
  userInitials?: string
  status?: "on-track" | "at-risk" | "idle"
}

export function UserProfileHeader({
  userName = "Sarah Chen",
  userRole = "Product Manager",
  userInitials = "SC",
  status = "on-track",
}: UserProfileHeaderProps) {
  const getAvatarColor = (initials: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
    ]
    return colors[initials.charCodeAt(0) % colors.length]
  }

  const getStatusBadgeColor = (stat: string) => {
    switch (stat) {
      case "on-track":
        return "bg-emerald-100 text-emerald-700"
      case "at-risk":
        return "bg-amber-100 text-amber-700"
      case "idle":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusLabel = (stat: string) => {
    switch (stat) {
      case "on-track":
        return "On Track"
      case "at-risk":
        return "At Risk"
      case "idle":
        return "Idle"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[#E5E5E7] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Avatar and User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-[#E5E5E7] hover:ring-[#007AFF] transition-all cursor-pointer",
            getAvatarColor(userInitials)
          )}>
            {userInitials}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#1D1D1F] truncate">
              {userName}
            </h3>
            <p className="text-xs text-[#86868B] truncate">
              {userRole}
            </p>
          </div>

          {/* Status Badge */}
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0",
            getStatusBadgeColor(status)
          )}>
            {getStatusLabel(status)}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            className="p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors text-[#86868B] hover:text-[#1D1D1F]"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors text-[#86868B] hover:text-[#1D1D1F]"
            title="Menu"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
