"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SprintWeekSelectorProps {
  weekStart: string // ISO date format
  onWeekChange: (newWeekStart: string) => void
}

export function SprintWeekSelector({ weekStart, onWeekChange }: SprintWeekSelectorProps) {
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const handlePrevWeek = () => {
    const prevWeek = new Date(startDate)
    prevWeek.setDate(prevWeek.getDate() - 7)
    onWeekChange(prevWeek.toISOString().split("T")[0])
  }

  const handleNextWeek = () => {
    const nextWeek = new Date(startDate)
    nextWeek.setDate(nextWeek.getDate() + 7)
    onWeekChange(nextWeek.toISOString().split("T")[0])
  }

  const isCurrentWeek = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return today >= start && today <= end
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <button
        onClick={handlePrevWeek}
        className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-all"
      >
        <ChevronLeft className="w-5 h-5 text-[#86868B]" />
      </button>

      <div className="flex-1 text-center">
        <p className="text-sm font-medium text-[#1D1D1F]">
          {formatDate(startDate)} - {formatDate(endDate)}
        </p>
        {isCurrentWeek() && (
          <p className="text-xs text-[#007AFF]">Current Week</p>
        )}
      </div>

      <button
        onClick={handleNextWeek}
        className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-all"
      >
        <ChevronRight className="w-5 h-5 text-[#86868B]" />
      </button>
    </div>
  )
}
