'use client'

import { Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SprintToolbarUnifiedProps {
  userAvatar?: string
  userName: string
  userRole: string
  personalTagline: string
  overdueCount: number
  completedThisWeek: number
  sprintName: string
  endDate: string
  taskCount: number
  completedCount: number
  sprintFilter: string
  onSprintFilterChange: (filter: string) => void
  onAddTask: () => void
}

export function SprintToolbarUnified({
  userAvatar,
  userName,
  userRole,
  personalTagline,
  overdueCount,
  completedThisWeek,
  sprintName,
  endDate,
  taskCount,
  completedCount,
  sprintFilter,
  onSprintFilterChange,
  onAddTask,
}: SprintToolbarUnifiedProps) {
  // Calculate days remaining
  const endDateObj = new Date(endDate)
  const today = new Date()
  const daysRemaining = Math.ceil((endDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calculate progress percentage
  const progressPercent = taskCount > 0 ? (completedCount / taskCount) * 100 : 0

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[#E5E5E7] backdrop-blur-sm backdrop-opacity-95">
      <div className="px-6 h-[72px] flex items-center justify-between gap-6">
        {/* LEFT: Identity Block */}
        <div className="flex items-center gap-3 min-w-fit">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E72] flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* Name + Stats */}
          <div className="min-w-fit">
            <p className="text-sm font-semibold text-[#1D1D1F]">{userName}</p>
            <div className="flex items-center gap-2 text-xs text-[#86868B]">
              <span>{overdueCount} Overdue</span>
              <span>•</span>
              <span>{completedThisWeek} Done Week</span>
            </div>
          </div>
        </div>

        {/* CENTER: Sprint Info */}
        <div className="flex-1 flex items-center justify-center min-w-max">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1D1D1F]">{sprintName}</p>
            <p className="text-xs text-[#86868B]">
              Ends {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {Math.max(0, daysRemaining)} days
            </p>
          </div>
        </div>

        {/* RIGHT: Completion + Controls */}
        <div className="flex items-center gap-4 min-w-fit">
          {/* Completion Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1D1D1F] min-w-[40px]">{completedCount}/{taskCount}</span>
            <div className="w-32 h-1 bg-[#E5E5E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#34C759] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Segmented Control */}
          <div className="flex gap-1 bg-[#F5F5F7] rounded-lg p-1">
            <button
              onClick={() => onSprintFilterChange('current-sprint')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded transition-all',
                sprintFilter === 'current-sprint'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              )}
            >
              Current Sprint_test
            </button>
            <button
              onClick={() => onSprintFilterChange('backlog')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded transition-all',
                sprintFilter === 'backlog'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              )}
            >
              Backlog_test
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white text-sm font-semibold rounded-lg hover:bg-[#0051D5] transition-all flex-shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
