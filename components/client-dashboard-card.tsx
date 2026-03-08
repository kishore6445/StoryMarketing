"use client"

import { useState } from "react"
import { ChevronDown, Users, Clock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

interface ClientDashboardCardProps {
  clientId: string
  clientName: string
  currentPhase: string
  progress: number
  teamSize: number
  tasksDue: number
  upcomingDeadline: string
  onViewPhaseDetails: () => void
  onViewTasks: () => void
  onViewMeetings: () => void
  onViewReports: () => void
}

export function ClientDashboardCard({
  clientId,
  clientName,
  currentPhase,
  progress,
  teamSize,
  tasksDue,
  upcomingDeadline,
  onViewPhaseDetails,
  onViewTasks,
  onViewMeetings,
  onViewReports,
}: ClientDashboardCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FB] transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Client Badge */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{clientName.charAt(0)}</span>
          </div>

          {/* Client Info */}
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-[#1D1D1F]">{clientName}</h3>
            <p className="text-sm text-[#86868B]">{currentPhase}</p>
          </div>

          {/* Progress Ring */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(#2E7D32 0deg ${progress * 3.6}deg, #E5E5E7 ${progress * 3.6}deg 360deg)`,
              }} />
              <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                <span className="text-sm font-semibold text-[#1D1D1F]">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        <ChevronDown
          className={`w-5 h-5 text-[#86868B] transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Quick Stats Row */}
      <div className="px-6 py-3 bg-[#F8F9FB] border-t border-[#E5E5E7] flex gap-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#86868B]" />
          <span className="text-sm text-[#515154]">{teamSize} team members</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#86868B]" />
          <span className="text-sm text-[#515154]">{tasksDue} tasks due</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#86868B]" />
          <span className="text-sm text-[#515154]">Due {upcomingDeadline}</span>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-[#E5E5E7] p-6 space-y-4">
          {/* Phase Progress Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-[#1D1D1F]">Current Phase Progress</h4>
            <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2E7D32] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[#86868B]">{progress}% complete • On track</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onViewPhaseDetails}
              className="px-4 py-2 border border-[#E5E5E7] rounded-lg text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Phase Details
            </button>
            <button
              onClick={onViewTasks}
              className="px-4 py-2 border border-[#E5E5E7] rounded-lg text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Tasks
            </button>
            <button
              onClick={onViewMeetings}
              className="px-4 py-2 border border-[#E5E5E7] rounded-lg text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Meetings
            </button>
            <button
              onClick={onViewReports}
              className="px-4 py-2 border border-[#E5E5E7] rounded-lg text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Reports
            </button>
          </div>

          {/* Next Phase Info */}
          <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded p-3">
            <p className="text-xs font-medium text-[#86868B] mb-1">Next Phase</p>
            <p className="text-sm font-semibold text-[#1D1D1F]">Story Design & Video</p>
            <p className="text-xs text-[#86868B]">Starts in 3 weeks • 21 days planned</p>
          </div>
        </div>
      )}
    </div>
  )
}
