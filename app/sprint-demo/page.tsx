"use client"

import { SprintKanbanDemo } from "@/components/sprint-kanban-demo"
import { AlertCircle, TrendingUp, Users, CheckCircle2 } from "lucide-react"

export default function SprintDemoPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1D1D1F] mb-3">Sprint Planning & Management</h1>
          <p className="text-lg text-[#86868B]">
            Manage sprints, track progress, and coordinate team workload across multiple projects and clients.
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#E3F2FF] to-[#DCEAFF] border border-[#007AFF]/20 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#007AFF] rounded-lg p-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-[#0051CC] uppercase tracking-wide">Total Tasks</div>
            </div>
            <div className="text-3xl font-bold text-[#1D1D1F]">42</div>
            <div className="text-sm text-[#86868B] mt-2">Across all sprints</div>
          </div>

          <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFF3CC] border border-[#FF9500]/20 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#FF9500] rounded-lg p-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide">Completion Rate</div>
            </div>
            <div className="text-3xl font-bold text-[#1D1D1F]">62%</div>
            <div className="text-sm text-[#86868B] mt-2">Tasks completed this cycle</div>
          </div>

          <div className="bg-gradient-to-br from-[#F0E6FF] to-[#E8D9FF] border border-[#9370DB]/30 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#9370DB] rounded-lg p-2">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-[#6B4FA1] uppercase tracking-wide">Team Size</div>
            </div>
            <div className="text-3xl font-bold text-[#1D1D1F]">8</div>
            <div className="text-sm text-[#86868B] mt-2">Team members active</div>
          </div>

          <div className="bg-gradient-to-br from-[#FFE5E5] to-[#FFDADA] border border-[#FF3B30]/20 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#FF3B30] rounded-lg p-2">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wide">At Risk</div>
            </div>
            <div className="text-3xl font-bold text-[#1D1D1F]">3</div>
            <div className="text-sm text-[#86868B] mt-2">Tasks overdue or blocked</div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg">
          <SprintKanbanDemo />
        </div>

        {/* Feature Overview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Sprint Management Features</h2>
            <ul className="space-y-3 text-sm text-[#86868B]">
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Create Sprints:</span>
                <span>Add new sprints with custom dates and statuses (Planning, Active, Completed)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Edit Sprints:</span>
                <span>Update sprint details and change status as work progresses</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Delete Sprints:</span>
                <span>Remove sprints with confirmation to prevent accidental deletion</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Progress Tracking:</span>
                <span>Visual progress bars show completion percentage for active sprints</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Kanban Board:</span>
                <span>Expandable kanban views show tasks organized by status</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Backlog Management:</span>
                <span>Unscheduled tasks stored in backlog for future sprint planning</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Analytics & Insights</h2>
            <ul className="space-y-3 text-sm text-[#86868B]">
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Sprint Overview:</span>
                <span>Count of active, planning, and completed sprints at a glance</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Task Completion:</span>
                <span>Total completed tasks across all sprints</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Team Metrics:</span>
                <span>Number of active team members and workload distribution</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Client Filtering:</span>
                <span>Filter tasks by client to see project-specific workload</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Sprint Selection:</span>
                <span>Quickly select and view any sprint's kanban board</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1D1D1F] min-w-fit">Status Transitions:</span>
                <span>Move sprints through planning → active → completed lifecycle</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
