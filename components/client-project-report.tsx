"use client"

import { TrendingUp, Target, CheckCircle2, AlertCircle, Calendar } from "lucide-react"

interface ProjectMetrics {
  tasksCompleted: number
  tasksInProgress: number
  tasksPending: number
  overallProgress: number
  completionRate: number
  nextMilestone: string
  nextMilestoneDate: string
}

// DATA SOURCES:
// ============
// 1. tasksCompleted: From workflow phases with status "completed" in current project
// 2. tasksInProgress: From workflow phases with status "in_progress" 
// 3. tasksPending: From workflow phases with status "pending_approval" or "draft"
// 4. overallProgress: Calculated from (tasksCompleted / totalTasks) * 100
// 5. completionRate: From RecordCampaignMetrics - tracked weekly completion %
// 6. nextMilestone: From ContentCalendarEnhanced - next scheduled milestone date
// 7. nextMilestoneDate: From ContentCalendarEnhanced - milestone due date

export function ClientReportCard({ metrics }: { metrics: ProjectMetrics }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#1D1D1F] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#007AFF]" />
          Project Status Report
        </h2>
        <p className="text-sm text-[#86868B]">Week of {new Date().toLocaleDateString()}</p>
      </div>

      {/* Main Progress Card */}
      <div className="bg-gradient-to-br from-[#E3F2FD] to-[#F3F5F9] border border-[#0071E3]/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-[#86868B] mb-1">Overall Progress</p>
            <p className="text-3xl font-bold text-[#1D1D1F]">{metrics.overallProgress}%</p>
          </div>
          <TrendingUp className="w-12 h-12 text-[#0071E3]" />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#007AFF] to-[#0051C3] h-full transition-all duration-500"
            style={{ width: `${metrics.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Status Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Completed - From workflow phases table */}
        <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <p className="text-xs font-semibold text-[#2E7D32]">COMPLETED</p>
          </div>
          <p className="text-2xl font-bold text-[#2E7D32]">{metrics.tasksCompleted}</p>
          <p className="text-xs text-[#2E7D32]/70 mt-1">tasks done</p>
        </div>

        {/* In Progress - From workflow phases table */}
        <div className="bg-[#FFF3E0] border border-[#FF9800] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#E65100]" />
            <p className="text-xs font-semibold text-[#E65100]">IN PROGRESS</p>
          </div>
          <p className="text-2xl font-bold text-[#E65100]">{metrics.tasksInProgress}</p>
          <p className="text-xs text-[#E65100]/70 mt-1">tasks active</p>
        </div>

        {/* Pending - From workflow phases table */}
        <div className="bg-[#FFEBEE] border border-[#F44336] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-[#D32F2F]" />
            <p className="text-xs font-semibold text-[#D32F2F]">PENDING</p>
          </div>
          <p className="text-2xl font-bold text-[#D32F2F]">{metrics.tasksPending}</p>
          <p className="text-xs text-[#D32F2F]/70 mt-1">awaiting review</p>
        </div>
      </div>

      {/* Completion Rate - From RecordCampaignMetrics */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <p className="text-sm font-medium text-[#1D1D1F] mb-3">Weekly Completion Rate</p>
        <p className="text-xs text-[#86868B] mb-3">
          Tracked from campaign metrics and task status updates
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#86868B]">This week</span>
            <span className="text-sm font-semibold text-[#1D1D1F]">{metrics.completionRate}%</span>
          </div>
          <div className="w-full bg-[#F5F5F7] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#34C759] h-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Milestone - From ContentCalendarEnhanced */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#86868B] mb-1">Next Milestone</p>
            <p className="text-base font-semibold text-[#1D1D1F]">{metrics.nextMilestone}</p>
            <p className="text-xs text-[#86868B] mt-1">Due {metrics.nextMilestoneDate}</p>
            <p className="text-xs text-[#86868B] mt-2">From content calendar schedule</p>
          </div>
        </div>
      </div>
    </div>
  )
}
