"use client"

import { useState } from "react"
import { ArrowLeft, Users, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { STORY_PHASES } from "@/lib/phases-config"
import { TeamMeetingScheduler } from "./team-meeting-scheduler"
import { ClientTasksOverview } from "./client-tasks-overview"
import { WeeklyReportGenerator } from "./weekly-report-generator"

interface ClientDetailViewProps {
  clientId: string
  clientName: string
  clientDescription: string
  clientBrandColor: string
  onBack: () => void
}

export function ClientDetailView({ clientId, clientName, clientDescription, clientBrandColor, onBack }: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "meetings" | "tasks" | "reports">("overview")
  // Mock data for this client
  const mockTeamMembers = [
    { id: 1, name: "Sarah Chen", role: "Creative Lead", avatar: "SC" },
    { id: 2, name: "Ravi Patel", role: "Strategy Lead", avatar: "RP" },
    { id: 3, name: "Alex Johnson", role: "Content Writer", avatar: "AJ" },
    { id: 4, name: "Jordan Smith", role: "Designer", avatar: "JS" },
  ]

  const mockKPIs = [
    { label: "Current Phase", value: "Story Writing", icon: "📝", trend: null },
    { label: "Overall Progress", value: "26%", icon: "📊", trend: "up" },
    { label: "Time to Next Phase", value: "3 weeks", icon: "⏱️", trend: null },
    { label: "Team Velocity", value: "12 tasks/week", icon: "⚡", trend: "up" },
  ]

  const mockPhaseTimeline = [
    { id: "research", name: "Story Research", status: "completed", completedDate: "Jan 15, 2026", progress: 100, daysSpent: 14 },
    { id: "writing", name: "Story Writing", status: "in-progress", startedDate: "Jan 29, 2026", progress: 65, daysSpent: 8 },
    { id: "design", name: "Story Design & Video", status: "planned", startDate: "Feb 26, 2026", progress: 0, daysPlanned: 21 },
    { id: "website", name: "Story Website", status: "planned", startDate: "Mar 19, 2026", progress: 0, daysPlanned: 18 },
    { id: "distribution", name: "Story Distribution", status: "planned", startDate: "Apr 6, 2026", progress: 0, daysPlanned: 14 },
    { id: "analytics", name: "Story Analytics", status: "planned", startDate: "Apr 20, 2026", progress: 0, daysPlanned: 10 },
    { id: "learning", name: "Story Learning", status: "planned", startDate: "Apr 30, 2026", progress: 0, daysPlanned: 7 },
  ]

  const mockMilestones = [
    { id: 1, title: "Victory Target Approved", date: "Jan 28", phase: "Research", status: "completed" },
    { id: 2, title: "First Draft Submitted", date: "Feb 15", phase: "Writing", status: "in-progress" },
    { id: 3, title: "Design Review", date: "Mar 10", phase: "Design", status: "upcoming" },
    { id: 4, title: "Campaign Launch", date: "Apr 15", phase: "Distribution", status: "upcoming" },
  ]

  const mockPhaseKPIs = [
    { phaseName: "Story Research", tasksCompleted: 12, taskTotal: 12, documentsCreated: 8, stakeholderFeedback: "Positive" },
    { phaseName: "Story Writing", tasksCompleted: 13, taskTotal: 20, documentsCreated: 5, stakeholderFeedback: "In Review" },
  ]

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#2E7D32] hover:text-[#1B5E20] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Client Header */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">{clientName}</h1>
            <p className="text-sm text-[#86868B] mt-1">{clientDescription}</p>
          </div>
          <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: clientBrandColor, opacity: 0.2 }} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#E5E5E7] overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          Project Overview
        </button>
        <button
          onClick={() => setActiveTab("meetings")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "meetings"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          Team Meetings
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "tasks"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          Tasks & Reporting
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "reports"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          Weekly Report
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div>
          <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Project Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mockKPIs.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-[#E5E5E7] p-4">
                <div className="text-xs text-[#86868B] font-medium mb-2">{kpi.label}</div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-[#1D1D1F]">{kpi.value}</div>
                  {kpi.trend === "up" && <TrendingUp className="w-4 h-4 text-[#2E7D32]" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Phase Timeline and Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase Timeline */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h2 className="text-base font-semibold text-[#1D1D1F] mb-6">Story Journey Timeline</h2>

            <div className="space-y-4">
              {mockPhaseTimeline.map((phase, idx) => (
                <div key={phase.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-[#1D1D1F]">{phase.name}</p>
                      <p className="text-xs text-[#86868B] mt-1">
                        {phase.status === "completed" && `Completed: ${phase.completedDate} (${phase.daysSpent} days)`}
                        {phase.status === "in-progress" && `In Progress since ${phase.startedDate} (${phase.daysSpent} days so far)`}
                        {phase.status === "planned" && `Starts: ${phase.startDate} (${phase.daysPlanned} days planned)`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        phase.status === "completed"
                          ? "bg-[#D1FADF] text-[#2E7D32]"
                          : phase.status === "in-progress"
                            ? "bg-[#D1E3FF] text-[#007AFF]"
                            : "bg-[#F3F3F6] text-[#86868B]"
                      }`}
                    >
                      {phase.status === "completed" && "Completed"}
                      {phase.status === "in-progress" && "In Progress"}
                      {phase.status === "planned" && "Planned"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-[#F3F3F6] rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        phase.status === "completed"
                          ? "bg-[#34C759]"
                          : phase.status === "in-progress"
                            ? "bg-[#007AFF]"
                            : "bg-[#D1D1D6]"
                      }`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>

                  {idx < mockPhaseTimeline.length - 1 && <div className="h-4 border-l-2 border-[#E5E5E7] ml-0.5" />}
                </div>
              ))}
            </div>
          </div>

          {/* Phase-by-Phase KPIs */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h2 className="text-base font-semibold text-[#1D1D1F] mb-6">Phase Performance</h2>

            <div className="space-y-4">
              {mockPhaseKPIs.map((phase, idx) => (
                <div key={idx} className="pb-4 border-b border-[#E5E5E7] last:border-0">
                  <p className="font-medium text-[#1D1D1F] mb-3">{phase.phaseName}</p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-[#F8F9FB] rounded p-2">
                      <p className="text-xs text-[#86868B]">Tasks</p>
                      <p className="font-semibold text-[#1D1D1F]">{phase.tasksCompleted}/{phase.taskTotal}</p>
                    </div>
                    <div className="bg-[#F8F9FB] rounded p-2">
                      <p className="text-xs text-[#86868B]">Documents</p>
                      <p className="font-semibold text-[#1D1D1F]">{phase.documentsCreated} created</p>
                    </div>
                    <div className="bg-[#F8F9FB] rounded p-2">
                      <p className="text-xs text-[#86868B]">Feedback</p>
                      <p className="font-semibold text-[#1D1D1F]">{phase.stakeholderFeedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h2 className="text-base font-semibold text-[#1D1D1F] mb-6">Key Milestones</h2>

            <div className="space-y-3">
              {mockMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-3 pb-3 border-b border-[#E5E5E7] last:border-0 last:pb-0">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      milestone.status === "completed" ? "bg-[#34C759]" : milestone.status === "in-progress" ? "bg-[#007AFF]" : "bg-[#D1D1D6]"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-[#1D1D1F]">{milestone.title}</p>
                      <span className="text-xs text-[#86868B]">{milestone.date}</span>
                    </div>
                    <p className="text-xs text-[#86868B] mt-1">{milestone.phase} phase</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Team and Details */}
        <div className="space-y-6">
          {/* Team Members */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#2E7D32]" />
              <h2 className="text-base font-semibold text-[#1D1D1F]">Team Members</h2>
            </div>

            <div className="space-y-3">
              {mockTeamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F9FB] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-xs font-semibold text-white">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F]">{member.name}</p>
                    <p className="text-xs text-[#86868B]">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Stats */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Quick Stats</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2">
                <span className="text-[#86868B]">Started</span>
                <span className="font-medium text-[#1D1D1F]">Jan 1, 2026</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-[#86868B]">Planned End</span>
                <span className="font-medium text-[#1D1D1F]">May 7, 2026</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-[#86868B]">Days Elapsed</span>
                <span className="font-medium text-[#1D1D1F]">31 days</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-[#86868B]">Days Remaining</span>
                <span className="font-medium text-[#1D1D1F]">95 days</span>
              </div>
              <div className="flex items-center justify-between p-2 border-t border-[#E5E5E7] pt-3">
                <span className="text-[#86868B]">Total Duration</span>
                <span className="font-medium text-[#1D1D1F]">126 days</span>
              </div>
            </div>
          </div>

          {/* Latest News */}
          <div className="bg-[#FEF2E8] border border-[#FFB547]/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#C76D00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[#C76D00] mb-1">On Schedule</p>
                <p className="text-xs text-[#9E5610]">Project is progressing within planned timeline. Next phase starts in 3 weeks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Meetings Tab */}
      {activeTab === "meetings" && <TeamMeetingScheduler clientId={clientId} clientName={clientName} />}

      {/* Tasks Overview Tab */}
      {activeTab === "tasks" && <ClientTasksOverview clientId={clientId} clientName={clientName} />}

      {/* Weekly Report Tab */}
      {activeTab === "reports" && <WeeklyReportGenerator clientId={clientId} clientName={clientName} />}
    </div>
  )
}
