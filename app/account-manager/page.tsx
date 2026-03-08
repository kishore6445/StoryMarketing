"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { SprintSelectorDropdown } from "@/components/sprint-selector-dropdown"
import { TaskKanban } from "@/components/task-kanban"
import { TaskModalWithPKR } from "@/components/task-modal-with-pkr"
import { AlertCircle, TrendingUp, CheckCircle2, Zap, X } from "lucide-react"
import { useClient } from "@/contexts/client-context"
import type { Task } from "@/components/my-tasks-today"

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export default function AccountManagerPage() {
  const router = useRouter()
  const { selectedClientId, selectedClientName } = useClient()
  const [currentPhase, setCurrentPhase] = useState("account-manager")
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Fetch stats from API with both client and sprint filters
  const { data: statsData } = useSWR(
    `/api/account-manager/stats?clientId=${selectedClientId || 'all'}${selectedSprintId ? `&sprintId=${selectedSprintId}` : ''}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch sprints
  const { data: sprintsData, mutate: mutateSprints } = useSWR(
    selectedClientId ? `/api/clients/${selectedClientId}/sprints` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch team members for this client
  const { data: teamData } = useSWR(
    selectedClientId ? `/api/clients/${selectedClientId}/team-members` : null,
    fetcher,
    { refreshInterval: 60000 }
  )

  // Fetch sprint tasks
  const { data: tasksData, mutate: mutateTasks } = useSWR(
    selectedSprintId ? `/api/account-manager/tasks?sprintId=${selectedSprintId}&clientId=${selectedClientId}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const stats = statsData?.stats || {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    teamSize: 0,
    atRiskTasks: 0,
    todoCount: 0,
    inProgressCount: 0,
    inReviewCount: 0,
    doneCount: 0,
    weeklyVelocity: 0
  }

  const sprints = sprintsData?.sprints || []
  const teamMembers = teamData?.team_members || []
  const sprintTasks = tasksData?.tasks || []

  useEffect(() => {
    // Reset sprint selection when client changes
    setSelectedSprintId(null)
  }, [selectedClientId])

  useEffect(() => {
    // Auto-select the current sprint when sprints data loads
    if (sprints.length > 0) {
      const activeSprint = sprints.find(s => s.status === 'active')
      const defaultSprint = activeSprint || sprints[0]
      if (defaultSprint && !selectedSprintId) {
        setSelectedSprintId(defaultSprint.id)
      }
    }
  }, [sprints])

  const handleSprintUpdated = (updatedSprint: any) => {
    // Update the local sprints data
    mutateSprints((data: any) => ({
      ...data,
      sprints: data.sprints.map((s: any) => s.id === updatedSprint.id ? updatedSprint : s)
    }), false)
  }

  const handleSprintDeleted = (deletedSprintId: string) => {
    // Remove the deleted sprint from local data
    mutateSprints((data: any) => ({
      ...data,
      sprints: data.sprints.filter((s: any) => s.id !== deletedSprintId)
    }), false)
  }

  const handleEditTask = (task: Task) => {
    const taskIdentifier = task.id || task.taskId
    if (!taskIdentifier) {
      console.warn("[v0] Missing task identifier for navigation", task)
      return
    }
    router.push(`/tasks/${encodeURIComponent(taskIdentifier)}`)
  }

  const handleSaveTask = async (updatedTask: any) => {
    if (!editingTask) return

    const token = localStorage.getItem("sessionToken")
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: editingTask.id,
          ...updatedTask,
        }),
      })

      if (response.ok) {
        const attachmentsToUpload = (updatedTask.attachments || []).filter(
          (attachment: any) => attachment?.file instanceof File
        )

        for (const attachment of attachmentsToUpload) {
          const uploadFormData = new FormData()
          uploadFormData.append("file", attachment.file)

          const uploadResponse = await fetch(`/api/tasks/${encodeURIComponent(editingTask.id)}/files`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            console.error("[v0] Failed to upload attachment while saving task:", await uploadResponse.text())
          }
        }

        mutateTasks()
        setShowEditModal(false)
        setEditingTask(null)
      }
    } catch (error) {
      console.error("[v0] Error saving task:", error)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFBFC]">
        <TopNav />
        <div className="flex">
          <Sidebar currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />
          <main className="flex-1 ml-64 transition-all duration-300 mt-16 p-6 [@media(max-width:768px)]:ml-20">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* HEADER: Compact - Client Name + Sprint Selector + Completion */}
              <div className="flex items-center justify-between gap-4 h-auto">
                {/* Left: Client Name */}
                <div className="min-w-fit">
                  <h1 className="type-h1">{selectedClientName || "Client"}</h1>
                  <p className="type-caption text-[#86868B] mt-1">Client Dashboard</p>
                </div>

                {/* Center: Sprint Selector */}
                <div className="flex-1 flex justify-center">
                  <SprintSelectorDropdown
                    sprints={sprints}
                    selectedSprintId={selectedSprintId || undefined}
                    onSprintChange={setSelectedSprintId}
                    onSprintUpdated={handleSprintUpdated}
                    onSprintDeleted={handleSprintDeleted}
                    teamMembers={teamMembers}
                    clientId={selectedClientId}
                  />
                </div>

                {/* Right: Sprint Completion */}
                <div className="flex flex-col items-end gap-1 min-w-fit">
                  <div className="type-caption text-[#6B7280]">Sprint Completion</div>
                  <div className="text-2xl font-black text-[#1D1D1F]">
                    {stats.completedTasks}<span className="type-caption text-[#86868B] ml-1">of {stats.totalTasks}</span>
                  </div>
                  <div className="w-32 h-1.5 bg-[#E5E5E7] rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-[#007AFF] to-[#34C759] transition-all duration-300"
                      style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* HEALTH SNAPSHOT: 4 Cards */}
              <div className="grid grid-cols-4 gap-4">
                {/* Completion % */}
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                  <div className="type-caption text-[#6B7280] mb-2">Completion</div>
                  <div className="text-2xl font-bold text-[#1D1D1F]">{stats.completionRate}%</div>
                  <div className="type-caption text-[#86868B] mt-2">Sprint progress</div>
                </div>

                {/* Tasks Remaining */}
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                  <div className="type-caption text-[#6B7280] mb-2">Remaining</div>
                  <div className="text-2xl font-bold text-[#1D1D1F]">{stats.totalTasks - stats.completedTasks}</div>
                  <div className="type-caption text-[#86868B] mt-2">Tasks left</div>
                </div>

                {/* Overdue / At Risk */}
                <div className={`rounded-lg p-4 border ${stats.atRiskTasks > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-[#E5E7EB]'}`}>
                  <div className="type-caption mb-2" style={{ color: stats.atRiskTasks > 0 ? '#B91C1C' : '#6B7280' }}>
                    At Risk
                  </div>
                  <div className={`text-2xl font-bold ${stats.atRiskTasks > 0 ? 'text-red-600' : 'text-[#1D1D1F]'}`}>
                    {stats.atRiskTasks}
                  </div>
                  <div className="type-caption mt-2" style={{ color: stats.atRiskTasks > 0 ? '#991B1B' : '#86868B' }}>
                    Overdue tasks
                  </div>
                </div>

                {/* Weekly Velocity */}
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                  <div className="type-caption text-[#6B7280] mb-2">Velocity</div>
                  <div className="text-2xl font-bold text-[#1D1D1F]">{stats.weeklyVelocity}</div>
                  <div className="type-caption text-[#86868B] mt-2">This week</div>
                </div>
              </div>

              {/* BOTTLENECK ROW: Task Distribution */}
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                <div className="type-caption text-[#6B7280] mb-4">Task Distribution</div>
                <div className="flex items-end justify-between gap-2 h-16">
                  {/* To Do */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-2xl font-bold text-[#1D1D1F]">{stats.todoCount}</div>
                    <div className="type-caption text-[#86868B] mt-2">To Do</div>
                  </div>

                  {/* In Progress */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-2xl font-bold text-[#1D1D1F]">{stats.inProgressCount}</div>
                    <div className="type-caption text-[#86868B] mt-2">In Progress</div>
                  </div>

                  {/* In Review - Highlight if high */}
                  <div className={`flex-1 flex flex-col items-center p-2 rounded ${stats.inReviewCount > 3 ? 'bg-amber-50' : ''}`}>
                    <div className={`text-2xl font-bold ${stats.inReviewCount > 3 ? 'text-amber-600' : 'text-[#1D1D1F]'}`}>
                      {stats.inReviewCount}
                    </div>
                    <div className={`type-caption mt-2 ${stats.inReviewCount > 3 ? 'text-amber-700' : 'text-[#86868B]'}`}>
                      In Review
                    </div>
                  </div>

                  {/* Done */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-2xl font-bold text-[#1D1D1F]">{stats.doneCount}</div>
                    <div className="type-caption text-[#86868B] mt-2">Done</div>
                  </div>
                </div>
              </div>

              {/* UPCOMING SPRINT SECTION */}
              {sprints.length > 1 && (
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                  <div className="type-caption text-[#6B7280] mb-3">Upcoming Sprint</div>
                  {sprints.filter(s => s.status !== 'completed').slice(1, 2).map(sprint => (
                    <div key={sprint.id}>
                      <div className="type-body font-semibold text-[#1D1D1F]">{sprint.name}</div>
                      <div className="type-caption text-[#86868B] mt-2">
                        Starts {new Date(sprint.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RECENT ACTIVITY - Placeholder */}
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                <div className="type-caption text-[#6B7280] mb-3">Recent Activity</div>
                <div className="space-y-2 type-caption text-[#86868B]">
                  <div className="flex gap-2">
                    <span className="min-w-fit">•</span>
                    <span>Last update 2 hours ago</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="min-w-fit">•</span>
                    <span>3 tasks completed this week</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="min-w-fit">•</span>
                    <span>1 task moved to review</span>
                  </div>
                </div>
              </div>

              {/* SPRINT TASKS - Kanban View */}
              {selectedSprintId && sprintTasks.length > 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                  <div className="type-caption text-[#6B7280] mb-4">Sprint Tasks</div>
                  <TaskKanban
                    tasks={sprintTasks}
                    onTaskStatusChange={async (taskId, newStatus) => {
                      // Update task status
                      const token = localStorage.getItem("sessionToken")
                      await fetch(`/api/tasks/${taskId}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ status: newStatus }),
                      })
                      mutateTasks()
                    }}
                    onEditTask={handleEditTask}
                    isLoading={!tasksData}
                  />
                </div>
              ) : selectedSprintId ? (
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 text-center">
                  <div className="type-caption text-[#6B7280] mb-3">Sprint Tasks</div>
                  <p className="type-body text-[#86868B]">No tasks in this sprint yet. Create one to get started.</p>
                </div>
              ) : null}

              {/* Task Edit Modal */}
              {showEditModal && editingTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-[#1D1D1F]">Edit Task</h2>
                        <p className="text-xs text-[#86868B] mt-1">Update task details</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowEditModal(false)
                          setEditingTask(null)
                        }}
                        className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-all"
                      >
                        <X className="w-5 h-5 text-[#86868B]" />
                      </button>
                    </div>
                    <TaskModalWithPKR
                      task={editingTask}
                      isOpen={showEditModal}
                      onClose={() => {
                        setShowEditModal(false)
                        setEditingTask(null)
                      }}
                      onSave={handleSaveTask}
                      teamMembers={[]}
                    />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
