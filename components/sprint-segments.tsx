'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Calendar, Users, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  status: 'planning' | 'active' | 'completed'
}

interface Task {
  id: string
  title: string
  dueDate: string
  assignedTo: string
  phase: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
}

interface SprintSegmentsProps {
  sprints: Sprint[]
  tasks: Task[]
  backlogTasks: Task[]
  onAddTask?: () => void
  isLoading?: boolean
}

export function SprintSegments({
  sprints,
  tasks,
  backlogTasks,
  onAddTask,
  isLoading = false,
}: SprintSegmentsProps) {
  // Categorize sprints
  const activeSprints = sprints.filter((s) => s.status === 'active')
  const previousSprints = sprints.filter((s) => s.status === 'completed')
  const planningSprints = sprints.filter((s) => s.status === 'planning')

  return (
    <div className="space-y-6">
      {/* Overview Cards - Quick Sprint Status */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium uppercase mb-1">Active</div>
          <div className="text-2xl font-bold text-blue-900">{activeSprints.length}</div>
          <div className="text-xs text-blue-600 mt-1">{tasks.filter(t => activeSprints.some(s => s.id === t.sprintId)).length} tasks</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-xs text-purple-600 font-medium uppercase mb-1">Planning</div>
          <div className="text-2xl font-bold text-purple-900">{planningSprints.length}</div>
          <div className="text-xs text-purple-600 mt-1">Next up</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-600 font-medium uppercase mb-1">Completed</div>
          <div className="text-2xl font-bold text-gray-900">{previousSprints.length}</div>
          <div className="text-xs text-gray-600 mt-1">Sprints</div>
        </div>
      </div>

      {/* Active Sprints - Always Visible */}
      {activeSprints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#007AFF]" />
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Currently Running</h3>
          </div>
          <div className="space-y-2">
            {activeSprints.map((sprint) => {
              const sprintTasks = tasks.filter(t => t.sprintId === sprint.id)
              const completedTasks = sprintTasks.filter(t => t.status === 'done').length
              const progressPercent = sprintTasks.length > 0 ? (completedTasks / sprintTasks.length) * 100 : 0

              return (
                <div key={sprint.id} className="border border-[#E5E5E7] rounded-lg p-4 bg-white hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1D1D1F]">{sprint.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#86868B]">
                        <Calendar className="w-3 h-3" />
                        {sprint.start_date} → {sprint.end_date}
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-xs font-medium">Active</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#86868B]">Progress</span>
                      <span className="text-[#1D1D1F] font-medium">{completedTasks}/{sprintTasks.length} tasks</span>
                    </div>
                    <div className="w-full bg-[#E5E5E7] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Planning/Upcoming Sprints */}
      {planningSprints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#FF9500]" />
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Upcoming Sprints</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {planningSprints.map((sprint) => {
              const sprintTasks = tasks.filter(t => t.sprintId === sprint.id)
              return (
                <div key={sprint.id} className="border border-[#E5E5E7] rounded-lg p-3 bg-[#FFFBF0] hover:bg-[#FFF8E6] transition-all">
                  <h4 className="font-medium text-[#1D1D1F] text-sm truncate">{sprint.name}</h4>
                  <div className="text-xs text-[#86868B] mt-1 line-clamp-1">{sprint.start_date}</div>
                  <div className="mt-2 text-xs font-medium text-[#FF9500]">{sprintTasks.length} tasks planned</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Previous Sprints - Collapsible */}
      {previousSprints.length > 0 && (
        <div className="space-y-3">
          <details className="group">
            <summary className="cursor-pointer flex items-center gap-2 font-semibold text-[#1D1D1F] text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
              <span>Completed Sprints</span>
              <ChevronDown className="w-4 h-4 text-[#86868B] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="space-y-2 mt-3">
              {previousSprints.map((sprint) => {
                const sprintTasks = tasks.filter(t => t.sprintId === sprint.id)
                return (
                  <div key={sprint.id} className="border border-[#E5E5E7] rounded-lg p-3 bg-[#F5FFF5] text-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#1D1D1F]">{sprint.name}</h4>
                      <span className="text-xs bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded">Completed</span>
                    </div>
                    <div className="text-xs text-[#86868B] mt-1">{sprint.end_date}</div>
                    <div className="text-xs text-[#34C759] font-medium mt-1">{sprintTasks.length} tasks delivered</div>
                  </div>
                )
              })}
            </div>
          </details>
        </div>
      )}

      {/* Backlog Tasks */}
      {backlogTasks.length > 0 && (
        <div className="space-y-3">
          <details className="group">
            <summary className="cursor-pointer flex items-center gap-2 font-semibold text-[#1D1D1F] text-sm">
              <AlertCircle className="w-4 h-4 text-[#86868B]" />
              <span>Unscheduled ({backlogTasks.length})</span>
              <ChevronDown className="w-4 h-4 text-[#86868B] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="space-y-2 mt-3 max-h-64 overflow-y-auto">
              {backlogTasks.map((task) => (
                <div key={task.id} className="border border-[#E5E5E7] rounded-lg p-2.5 bg-[#F5F5F7] text-sm hover:bg-[#E8E8ED] transition-all">
                  <p className="font-medium text-[#1D1D1F]">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#86868B]">
                    <span className="bg-[#E5E5E7] px-2 py-0.5 rounded">{task.phase}</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Empty State */}
      {activeSprints.length === 0 && planningSprints.length === 0 && (
        <div className="text-center py-8 bg-[#F5F5F7] rounded-lg">
          <Clock className="w-8 h-8 text-[#D1D1D6] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#1D1D1F]">No sprints yet</p>
          <p className="text-xs text-[#86868B] mt-1">Create your first sprint to get started</p>
        </div>
      )}
    </div>
  )
}
