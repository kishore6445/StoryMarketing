"use client"

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from "swr"

interface CompactSprintHeaderProps {
  sprintName: string
  clientName: string
  endDate: string
  taskCount: number
  completedCount: number
  pkr?: number
  atRisk?: number
  overdue?: number
  isBacklogView?: boolean
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  profile_photo_url: string | null
  display_name: string | null
  personal_motto: string | null
}

export function CompactSprintHeader({
  sprintName,
  clientName,
  endDate,
  taskCount,
  completedCount,
  pkr = 92,
  atRisk = 0,
  overdue = 0,
  isBacklogView = false,
}: CompactSprintHeaderProps) {
  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null

  const { data: profile } = useSWR(
    token ? "/api/user/profile" : null,
    async (url: string) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      return res.json() as Promise<UserProfile>
    },
    { revalidateOnFocus: false, refreshInterval: 30000 }
  )

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = profile?.display_name || profile?.full_name?.split(" ")[0] || "User"
  const userRole = profile?.role || "Team Member"
  const userInitials = getInitials(profile?.full_name || "U")
  const personalMotto = profile?.personal_motto || ""

  return (
    <>
      {/* Main Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] transition-all duration-200">
        <div className="bg-gradient-to-b from-[#F9FAFB] to-white px-6 py-2.5 gap-3">
          <div className="flex items-start justify-between gap-3">
            {/* LEFT: User Profile Section */}
            <div className="flex items-start gap-2.5 flex-shrink-0">
              {/* Avatar */}
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-[#E5E7EB] hover:ring-[#007AFF] transition-all cursor-pointer"
                />
              ) : (
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-1 ring-[#E5E7EB] hover:ring-[#007AFF] transition-all cursor-pointer",
                  getAvatarColor(userInitials)
                )}>
                  {userInitials}
                </div>
              )}

              {/* User Info */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="text-sm font-bold text-[#111111] truncate leading-[1.2]">
                  {displayName}
                </div>
                <div className="text-xs text-[#9CA3AF] truncate leading-[1.2]">
                  {personalMotto || userRole}
                </div>
              </div>
            </div>

            {/* MIDDLE: Sprint Info - Tighter Layout */}
            <div className="flex-1 min-w-0 flex items-start gap-2">
              <div className="min-w-0">
                <div className="text-2xl font-black text-[#111111] truncate leading-[1.2] tracking-tight">
                  {sprintName}
                </div>
                {clientName && (
                  <div className="text-[10px] text-[#BDBDBE] truncate leading-[1.2] mt-0.5">
                    {clientName}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Sprint Completion - Stronger (Hidden in Backlog) */}
            {!isBacklogView && (
              <div className="flex items-start gap-3 flex-shrink-0">
                <div className="text-left">
                  <div className="text-[9px] text-[#BDBDBE] font-semibold leading-[1.2] uppercase tracking-widest">Completion</div>
                  <div className="text-xl font-black text-[#111111] leading-[1.2] mt-0.5">
                    {completedCount}<span className="text-[10px] font-black text-[#111111] ml-0.5">of {taskCount}</span>
                  </div>
                  <div className="w-20 h-1 bg-[#E5E5E7] rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-[#007AFF] transition-all duration-300"
                      style={{ width: `${taskCount > 0 ? (completedCount / taskCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Settings */}
                <button
                  className="p-1.5 rounded hover:bg-[#F5F5F7] transition-colors text-[#6B7280] hover:text-[#111111]"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Backlog View - Just Settings */}
            {isBacklogView && (
              <button
                className="p-1.5 rounded hover:bg-[#F5F5F7] transition-colors text-[#6B7280] hover:text-[#111111]"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
