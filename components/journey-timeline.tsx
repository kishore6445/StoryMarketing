'use client';

import { CheckCircle2, Circle, Clock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { STORY_PHASES } from "@/lib/phases-config"

const timelinePhases = [
  { ...STORY_PHASES[0], status: "completed", progress: 100, lastUpdate: "5 days ago" },
  { ...STORY_PHASES[1], status: "in-progress", progress: 65, lastUpdate: "2 days ago" },
  { ...STORY_PHASES[2], status: "not-started", progress: 0, lastUpdate: "—" },
  { ...STORY_PHASES[3], status: "not-started", progress: 0, lastUpdate: "—" },
  { ...STORY_PHASES[4], status: "not-started", progress: 0, lastUpdate: "—" },
  { ...STORY_PHASES[5], status: "not-started", progress: 0, lastUpdate: "—" },
  { ...STORY_PHASES[6], status: "not-started", progress: 0, lastUpdate: "—" },
]

export function JourneyTimeline() {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(["research", "writing"])
  )

  const togglePhase = (phaseId: string) => {
    const newSet = new Set(expandedPhases)
    if (newSet.has(phaseId)) {
      newSet.delete(phaseId)
    } else {
      newSet.add(phaseId)
    }
    setExpandedPhases(newSet)
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
      <div className="space-y-2">
        {timelinePhases.map((phase, index) => (
          <div key={phase.id}>
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full hover:bg-[#F8F9FB] p-4 rounded-lg transition-colors flex items-center gap-4"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {phase.status === "completed" && <CheckCircle2 className="w-6 h-6 text-[#34C759]" />}
                {phase.status === "in-progress" && <Clock className="w-6 h-6 text-[#007AFF] animate-pulse" />}
                {phase.status === "not-started" && <Circle className="w-6 h-6 text-[#D1D1D6]" />}
              </div>

              {/* Phase Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-medium text-[#1D1D1F]">{phase.name}</div>
                    <div className="text-xs text-[#86868B] mt-0.5">{phase.tagline}</div>
                  </div>
                  <span className="text-sm font-semibold text-[#1D1D1F]">{phase.progress}%</span>
                </div>
              </div>

              {/* Chevron */}
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-[#86868B] transition-transform",
                  expandedPhases.has(phase.id) && "rotate-180"
                )}
              />
            </button>

            {/* Expanded Content */}
            {expandedPhases.has(phase.id) && (
              <div className="ml-10 mb-2 space-y-2">
                {/* Progress Bar */}
                <div className="w-full bg-[#E5E5E7] rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      phase.status === "completed" && "bg-[#34C759]",
                      phase.status === "in-progress" && "bg-[#007AFF]",
                      phase.status === "not-started" && "bg-[#D1D1D6]"
                    )}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>

                {/* Status Badge */}
                <div
                  className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-medium",
                    phase.status === "completed" && "bg-[#D1FADF] text-[#2E7D32]",
                    phase.status === "in-progress" && "bg-[#D1E3FF] text-[#007AFF]",
                    phase.status === "not-started" && "bg-[#F3F3F6] text-[#86868B]",
                  )}
                >
                  {phase.status === "completed" && "Completed"}
                  {phase.status === "in-progress" && "In Progress"}
                  {phase.status === "not-started" && "Not Started"}
                </div>
              </div>
            )}

            {/* Connector Line */}
            {index < timelinePhases.length - 1 && (
              <div className="ml-3 h-4 w-px bg-[#E5E5E7]" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
