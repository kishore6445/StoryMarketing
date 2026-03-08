"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { TodaysFocus } from "./todays-focus"
import { cn } from "@/lib/utils"

export function CollapsibleTodaysFocus({ taskCount = 3, hasDueTasks = true }: { taskCount?: number; hasDueTasks?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (taskCount === 0) return null

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 w-full px-4 py-2.5 rounded transition-all group",
          "border-[#E5E7EB] hover:bg-[#F9FAFB]",
          "border border-[#E5E7EB]"
        )}
      >
        <span className="text-sm font-semibold text-[#111111] uppercase tracking-tight">
          FOCUS: {taskCount} DUE TODAY
        </span>
        <ChevronDown className={cn(
          "w-3 h-3 text-[#6B7280] transition-transform flex-shrink-0 ml-auto",
          isExpanded && "rotate-180"
        )} />
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        isExpanded ? "max-h-96" : "max-h-0"
      )}>
        <div className="pt-1">
          <TodaysFocus />
        </div>
      </div>
    </div>
  )
}
