"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"

interface PhaseProgress {
  id: string
  name: string
  completedTasks: number
  totalTasks: number
  progress: number
  status: "not_started" | "in_progress" | "completed"
}

interface ProgressTrackerProps {
  phases: PhaseProgress[]
}

export function ProgressTracker({ phases }: ProgressTrackerProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())

  const overallProgress = useMemo(() => {
    const totalCompleted = phases.reduce((sum, p) => sum + p.completedTasks, 0)
    const totalTasks = phases.reduce((sum, p) => sum + p.totalTasks, 0)
    return totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
  }, [phases])

  const completedPhases = phases.filter((p) => p.status === "completed").length
  const inProgressPhases = phases.filter((p) => p.status === "in_progress").length

  const togglePhase = (phaseId: string) => {
    const newSet = new Set(expandedPhases)
    if (newSet.has(phaseId)) {
      newSet.delete(phaseId)
    } else {
      newSet.add(phaseId)
    }
    setExpandedPhases(newSet)
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#D1FADF]"
      case "in_progress":
        return "bg-[#D1E3FF]"
      default:
        return "bg-[#F3F3F6]"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#2E7D32] text-white"
      case "in_progress":
        return "bg-[#007AFF] text-white"
      default:
        return "bg-[#86868B] text-white"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-[#2E7D32]"
    if (progress >= 50) return "bg-[#007AFF]"
    if (progress > 0) return "bg-[#FF9500]"
    return "bg-[#E5E5E7]"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600"
      case "in_progress":
        return "bg-blue-600"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Overall Journey Progress</h3>
              <span className="text-3xl font-semibold text-[#1D1D1F]">{overallProgress}%</span>
            </div>
            <p className="text-sm text-[#86868B]">
              {completedPhases} completed • {inProgressPhases} in progress • {phases.length - completedPhases - inProgressPhases} remaining
            </p>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-[#E5E5E7] rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getProgressColor(overallProgress)} transition-all duration-500`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[#D1FADF] rounded-lg">
              <div className="text-2xl font-semibold text-[#2E7D32]">{completedPhases}</div>
              <div className="text-xs text-[#86868B] mt-1">Completed</div>
            </div>
            <div className="text-center p-3 bg-[#D1E3FF] rounded-lg">
              <div className="text-2xl font-semibold text-[#007AFF]">{inProgressPhases}</div>
              <div className="text-xs text-[#86868B] mt-1">In Progress</div>
            </div>
            <div className="text-center p-3 bg-[#F3F3F6] rounded-lg">
              <div className="text-2xl font-semibold text-[#86868B]">{phases.length - completedPhases - inProgressPhases}</div>
              <div className="text-xs text-[#86868B] mt-1">Not Started</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase-by-Phase Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider">Phase Breakdown</h3>
        {phases.map((phase) => (
          <div key={phase.id}>
            <button
              onClick={() => togglePhase(phase.id)}
              className={`w-full p-4 rounded-lg border border-[#E5E5E7] ${getStatusBgColor(phase.status)} hover:border-[#86868B] transition-colors flex items-start justify-between`}
            >
              <div className="text-left flex-1">
                <h4 className="font-medium text-[#1D1D1F]">{phase.name}</h4>
                <p className="text-xs text-[#86868B] mt-1">
                  {phase.completedTasks} of {phase.totalTasks} tasks completed
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <span className="text-lg font-semibold text-[#1D1D1F]">{phase.progress}%</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#86868B] transition-transform ${expandedPhases.has(phase.id) ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {/* Expanded Details */}
            {expandedPhases.has(phase.id) && (
              <div className="mt-2 ml-4 p-4 bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg space-y-3">
                {/* Progress Bar */}
                <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#E5E5E7]">
                  <div
                    className={`h-full ${getProgressColor(phase.progress)} transition-all duration-300`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(phase.status)}`}
                >
                  {phase.status === "completed" && "Completed"}
                  {phase.status === "in_progress" && "In Progress"}
                  {phase.status === "not_started" && "Not Started"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
