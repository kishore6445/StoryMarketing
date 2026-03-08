"use client"

import { CheckCircle2, Circle, AlertCircle } from "lucide-react"

interface TimelinePhase {
  id: string
  name: string
  progress: number
  status: "not_started" | "in_progress" | "completed"
}

interface PhaseTimelineProps {
  phases: TimelinePhase[]
  currentPhase?: string
}

export function PhaseTimeline({ phases, currentPhase }: PhaseTimelineProps) {
  return (
    <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider mb-6">
        Journey Timeline
      </h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-5 left-6 right-0 h-1 bg-[#E5E5E7]" />

        {/* Timeline Items */}
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`relative flex items-start gap-4 ${
                currentPhase === phase.id ? "opacity-100" : "opacity-70"
              }`}
            >
              {/* Checkpoint */}
              <div className="relative z-10 mt-1">
                {phase.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : phase.status === "in_progress" ? (
                  <AlertCircle className="w-5 h-5 text-blue-600 animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5 text-[#D1D1D6]" />
                )}
              </div>

              {/* Phase Info */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-[#1D1D1F]">{phase.name}</h4>
                  <span className="text-xs font-semibold text-[#86868B]">{phase.progress}%</span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full bg-[#E5E5E7] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      phase.status === "completed"
                        ? "bg-green-500"
                        : phase.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-[#D1D1D6]"
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>

                {/* Status */}
                <div className="mt-2 text-xs text-[#86868B]">
                  {phase.status === "completed" && "Completed"}
                  {phase.status === "in_progress" && "In progress"}
                  {phase.status === "not_started" && "Not started"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
