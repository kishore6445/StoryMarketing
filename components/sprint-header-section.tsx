'use client'

import { Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SprintHeaderSectionProps {
  sprintName: string
  clientName: string
  endDate: string
  status: 'planning' | 'active' | 'completed'
  taskCount: number
  completedCount: number
  userProfilePhoto?: string
  userName?: string
  userRole?: string
  personalTagline?: string
  overdueCount?: number
  completedThisWeek?: number
  isBacklogView?: boolean
}

export function SprintHeaderSection({
  sprintName,
  clientName,
  endDate,
  status,
  taskCount,
  completedCount,
  userProfilePhoto,
  userName = "Team Member",
  userRole = "Operator",
  personalTagline = "Execution Over Excuses.",
  overdueCount = 0,
  completedThisWeek = 0,
  isBacklogView = false,
}: SprintHeaderSectionProps) {
  const calculateDaysRemaining = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysRemaining
  }

  const daysRemaining = calculateDaysRemaining()
  const progressPercent = Math.round((completedCount / taskCount) * 100)
  const isUrgent = daysRemaining <= 3

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (initials: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"]
    return colors[initials.charCodeAt(0) % colors.length]
  }

  return (
    <div className="bg-white border-b border-[#E5E7EB]">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* LEFT BLOCK: Identity with subtle background - reduced padding */}
        <div className="flex items-start gap-3 flex-shrink-0 min-w-fit bg-[#FAFBFC] px-3 py-2.5 rounded-lg">
          {/* Profile Photo */}
          {userProfilePhoto ? (
            <img
              src={userProfilePhoto}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-[#E5E5E7] shadow-sm"
            />
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 border border-[#E5E5E7] shadow-sm",
              getAvatarColor(getInitials(userName))
            )}>
              {getInitials(userName)}
            </div>
          )}

          {/* Name + Role + Tagline */}
          <div className="flex flex-col gap-0.5 min-w-fit">
            <h2 className="text-sm font-bold text-[#1D1D1F] leading-tight">{userName}</h2>
            <p className="text-xs text-[#6B7280] leading-tight">{userRole}</p>
            <p className="text-xs italic text-[#6B7280] leading-tight mt-0.5">"{personalTagline}"</p>
            
            {/* Micro-Metrics - Clearer labels */}
            <div className="flex gap-4 text-xs mt-1 pt-1 border-t border-[#E5E7EB]">
              <span className="text-[#6B7280]">
                Overdue: <span className={cn("font-semibold", overdueCount > 0 ? "text-red-600" : "text-[#6B7280]")}>{overdueCount}</span>
              </span>
              <span className="text-[#6B7280] whitespace-nowrap">
                Done Week: <span className="font-semibold text-[#007AFF]">{completedThisWeek}</span>
              </span>
            </div>
          </div>
        </div>

        {/* CENTER BLOCK: Sprint Context - shifted left, tighter vertical spacing */}
        <div className="flex-1 flex flex-col gap-0.5 items-start min-w-0 ml-4">
          <h1 className="text-lg font-black text-[#1D1D1F]">{sprintName}</h1>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Ends {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className={cn(
              "font-semibold",
              isUrgent ? "text-red-600" : daysRemaining <= 7 ? "text-amber-600" : "text-[#6B7280]"
            )}>
              {daysRemaining > 0 ? `${daysRemaining}d` : 'Due'}
            </span>
          </div>
        </div>

        {/* RIGHT BLOCK: Single Progress Indicator - improved label */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 min-w-fit">
          <div className="text-right">
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Sprint Completion</div>
            <div className="text-lg font-black text-[#1D1D1F] leading-none mt-0.5">
              {completedCount}<span className="text-xs text-[#86868B] font-medium ml-1">of {taskCount}</span>
            </div>
          </div>
          {/* Mini Progress Bar */}
          <div className="w-32 h-1.5 bg-[#E5E5E7] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#007AFF] to-[#34C759] transition-all duration-300"
              style={{ width: `${taskCount > 0 ? (completedCount / taskCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
