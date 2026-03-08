"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { RoleBasedLayout } from "@/components/role-based-layout"
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"
import { ClientReportCard } from "@/components/client-report-card"
interface PortalData {
  client: { id: string; name: string }
  powerMoves: Array<{
    id: string
    phase: string
    description: string
    completed: boolean
    dueDate: string
    createdAt: string
  }>
  meetings: Array<{
    id: string
    title: string
    date: string
    time: string
    status: string
    summary: string
    keyDecisions: string[]
    notes: string
  }>
  actionItems: Array<{
    id: string
    meetingId: string
    meetingTitle: string
    meetingDate: string
    description: string
    assignedTo: string
    dueDate: string
    completed: boolean
  }>
  workflows: Array<{
    id: string
    name: string
    status: string
    currentStep: {
      id: string
      stepNumber: number
      title: string
      description: string
      status: string
      owner: string
      department: string
    } | null
    totalSteps: number
    completedSteps: number
  }>
}

export default function ClientPortalPage() {
  const [portalData, setPortalData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const token = localStorage.getItem('sessionToken')
        const response = await fetch('/api/client-portal', {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        })

        if (response.ok) {
          const data = await response.json()
          setPortalData(data)
        }
      } catch (error) {
        console.error('[v0] Error fetching portal data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortalData()
  }, [])

  if (loading) {
    return (
      <AuthGuard>
        <RoleBasedLayout userRole="client">
          <div className="flex items-center justify-center py-12">
            <div className="text-[#86868B]">Loading your dashboard...</div>
          </div>
        </RoleBasedLayout>
      </AuthGuard>
    )
  }

  if (!portalData) {
    return (
      <AuthGuard>
        <RoleBasedLayout userRole="client">
          <div className="flex items-center justify-center py-12">
            <div className="text-[#86868B]">No data available</div>
          </div>
        </RoleBasedLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <RoleBasedLayout userRole="client">
        <div className="space-y-8">
          {/* Welcome Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#1D1D1F]">Welcome, {portalData.client.name}</h1>
            <p className="text-[#86868B] mt-1">Here's your project overview</p>
          </div>

          {/* Power Moves */}
          <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Your Power Moves</h2>
            {portalData.powerMoves.length === 0 ? (
              <p className="text-sm text-[#86868B]">No power moves assigned yet</p>
            ) : (
              <div className="space-y-3">
                {portalData.powerMoves.map((move) => (
                  <div key={move.id} className="flex items-start gap-3 p-3 border border-[#E5E5E7] rounded-lg">
                    {move.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#34C759] flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#007AFF] bg-[#E3F2FD] px-2 py-0.5 rounded">
                          {move.phase}
                        </span>
                        {move.dueDate && (
                          <span className="text-xs text-[#86868B]">
                            Due: {new Date(move.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${move.completed ? 'text-[#86868B] line-through' : 'text-[#1D1D1F]'}`}>
                        {move.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meetings */}
          <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Your Meetings</h2>
            {portalData.meetings.length === 0 ? (
              <p className="text-sm text-[#86868B]">No meetings scheduled</p>
            ) : (
              <div className="space-y-4">
                {portalData.meetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 border border-[#E5E5E7] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#1D1D1F]">{meeting.title || "Team Meeting"}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        meeting.status === 'completed' 
                          ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                          : 'bg-[#FFF3E0] text-[#E65100]'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                    <div className="text-sm text-[#86868B] mb-2">
                      {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                    </div>
                    {meeting.summary && (
                      <p className="text-sm text-[#515154] mt-2">{meeting.summary}</p>
                    )}
                    {meeting.keyDecisions && meeting.keyDecisions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-[#1D1D1F] mb-1">Key Decisions:</p>
                        <ul className="space-y-1">
                          {meeting.keyDecisions.map((decision, idx) => (
                            <li key={idx} className="text-sm text-[#515154] flex gap-2">
                              <span className="text-[#007AFF]">•</span>
                              <span>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Action Items</h2>
            {portalData.actionItems.length === 0 ? (
              <p className="text-sm text-[#86868B]">No action items</p>
            ) : (
              <div className="space-y-3">
                {portalData.actionItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border border-[#E5E5E7] rounded-lg">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#34C759] flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-[#FF9500] flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${item.completed ? 'text-[#86868B] line-through' : 'text-[#1D1D1F]'} mb-1`}>
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#86868B]">
                        <span>From: {item.meetingTitle}</span>
                        <span>•</span>
                        <span>Assigned to: {item.assignedTo}</span>
                        {item.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workflows */}
          {portalData.workflows.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
              <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Workflows Requiring Your Attention</h2>
              <div className="space-y-4">
                {portalData.workflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border border-[#E5E5E7] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#1D1D1F]">{workflow.name}</h3>
                      <span className="text-xs text-[#86868B]">
                        {workflow.completedSteps} of {workflow.totalSteps} steps completed
                      </span>
                    </div>
                    {workflow.currentStep ? (
                      <div className="mt-3 p-3 bg-[#F8F9FB] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-[#FF9500]" />
                            <span className="text-sm font-medium text-[#1D1D1F]">
                              Step {workflow.currentStep.stepNumber}: {workflow.currentStep.title}
                            </span>
                          </div>
                          {workflow.currentStep.status !== "approved" && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem("sessionToken")
                                const response = await fetch("/api/workflow-steps/approve", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                                  },
                                  body: JSON.stringify({ 
                                    workflowStepId: workflow.currentStep.id,
                                    status: "approved"
                                  })
                                })
                                if (response.ok) {
                                  window.location.reload()
                                } else {
                                  console.error("[v0] Approval failed:", await response.text())
                                }
                              }}
                              className="px-3 py-1 bg-[#34C759] text-white rounded-lg text-xs font-medium hover:bg-[#2E7D32] transition-colors"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[#515154] ml-6">
                          {workflow.currentStep.description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#86868B] mt-2">All steps completed or pending previous steps</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Report Card */}
          <ClientReportCard />
        </div>
      </RoleBasedLayout>
    </AuthGuard>
  )
}
