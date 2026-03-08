"use client"

import React from "react"

import { useState } from "react"
import { Plus, Trash2, GripVertical, X, Check } from "lucide-react"
import type { WorkflowRule, ApprovalStep, ApprovalRole } from "@/lib/workflow-config"
import useSWR from "swr"

interface User {
  id: string
  name: string
  email: string
  role: string
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())
}

interface WorkflowBuilderProps {
  workflowName?: string
  onSave?: (workflow: {
    name: string
    description?: string
    triggerAction: string
    approvalSteps: ApprovalStep[]
    requireAllApprovals: boolean
    parallelApprovals?: boolean
    allowBypass?: boolean
    bypassRoles?: string[]
  }) => void
  onCancel?: () => void
  initialWorkflow?: {
    id?: string
    name: string
    description?: string
    triggerAction?: string
    trigger_action?: string
    approvalSteps?: ApprovalStep[]
    workflow_steps?: Array<{
      id: string
      step_number: number
      title: string
      owner_role: string
      department?: string
      sop_link?: string
      timeout_days: number
      can_reject: boolean
      can_delegate: boolean
    }>
    requireAllApprovals?: boolean
    require_all_approvals?: boolean
    parallelApprovals?: boolean
    parallel_approvals?: boolean
  }
}

const APPROVAL_ROLES: ApprovalRole[] = [
  "manager",
  "director",
  "executive",
  "compliance_officer",
  "client",
  "custom",
]

const DEPARTMENTS = [
  "Marketing",
  "Finance",
  "Legal",
  "Compliance",
  "Operations",
  "Executive",
]

export function WorkflowBuilder({
  workflowName = "New Workflow",
  onSave,
  onCancel,
  initialWorkflow,
}: WorkflowBuilderProps) {
  // Transform initialWorkflow if it's from database format
  const getInitialSteps = (): ApprovalStep[] => {
    if (initialWorkflow?.approvalSteps) {
      return initialWorkflow.approvalSteps
    }
    if (initialWorkflow?.workflow_steps) {
      return initialWorkflow.workflow_steps.map((step) => ({
        id: step.id,
        stepNumber: step.step_number,
        role: step.owner_role as ApprovalRole,
        title: step.title,
        timeoutDays: step.timeout_days,
        canReject: step.can_reject,
        canDelegate: step.can_delegate,
        requiredComments: false,
        notifyOnApproval: true,
        notifyOnRejection: true,
        department: step.department,
        sopLink: step.sop_link,
      }))
    }
    return []
  }

  const [workflow, setWorkflow] = useState({
    id: initialWorkflow?.id || `workflow_${Date.now()}`,
    name: initialWorkflow?.name || workflowName,
    description: initialWorkflow?.description || "",
    triggerAction: initialWorkflow?.triggerAction || initialWorkflow?.trigger_action || "phase_submit",
    requireAllApprovals: initialWorkflow?.requireAllApprovals ?? initialWorkflow?.require_all_approvals ?? true,
    parallelApprovals: initialWorkflow?.parallelApprovals ?? initialWorkflow?.parallel_approvals ?? false,
    allowBypass: false,
  })

  const [steps, setSteps] = useState<ApprovalStep[]>(getInitialSteps())
  const [draggedStep, setDraggedStep] = useState<string | null>(null)

  // Fetch users from API
  const { data: usersData } = useSWR("/api/team-members", fetcher, {
    revalidateOnFocus: false,
  })
  const users: User[] = (usersData?.users || []).map((u: any) => ({
    id: u.id,
    name: u.full_name || u.name,
    email: u.email,
    role: u.role,
  }))

  const addApprovalStep = () => {
    const newStep: ApprovalStep = {
      id: `step_${Date.now()}`,
      stepNumber: steps.length + 1,
      role: "manager",
      title: "Approval Step",
      timeoutDays: 2,
      canReject: true,
      canDelegate: true,
      requiredComments: false,
      notifyOnApproval: true,
      notifyOnRejection: true,
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (stepId: string) => {
    const updated = steps.filter((s) => s.id !== stepId).map((s, idx) => ({ ...s, stepNumber: idx + 1 }))
    setSteps(updated)
  }

  const updateStep = (stepId: string, updates: Partial<ApprovalStep>) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)))
  }

  const handleDragStart = (stepId: string) => {
    setDraggedStep(stepId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetStepId: string) => {
    if (!draggedStep || draggedStep === targetStepId) return

    const draggedIndex = steps.findIndex((s) => s.id === draggedStep)
    const targetIndex = steps.findIndex((s) => s.id === targetStepId)

    const newSteps = [...steps]
    ;[newSteps[draggedIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[draggedIndex]]

    newSteps.forEach((step, idx) => {
      step.stepNumber = idx + 1
    })

    setSteps(newSteps)
    setDraggedStep(null)
  }

  const handleSave = () => {
    if (!workflow.name?.trim()) {
      alert("Please enter a workflow name")
      return
    }
    if (steps.length === 0) {
      alert("Please add at least one approval step")
      return
    }

    if (onSave) {
      onSave({
        name: workflow.name,
        description: workflow.description,
        triggerAction: workflow.triggerAction,
        approvalSteps: steps.map((step) => ({
          ...step,
          sopLink: step.sopIds?.[0],
          ownerUserId: step.customApproverEmail, // Pass the selected user ID
        })),
        requireAllApprovals: workflow.requireAllApprovals,
        parallelApprovals: workflow.parallelApprovals,
        allowBypass: workflow.allowBypass,
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E7]">
          <div>
            <h2 className="text-xl font-semibold text-[#1D1D1F]">New Workflow Template</h2>
            <p className="text-sm text-[#86868B]">Define workflow steps with default owners and SOPs</p>
          </div>
          <button onClick={onCancel} className="text-[#86868B] hover:text-[#1D1D1F]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={workflow.name || ""}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              placeholder="e.g., Standard Content Production"
              className="w-full px-4 py-3 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">Description</label>
            <textarea
              value={workflow.description || ""}
              onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
              placeholder="Brief description of this workflow..."
              className="w-full px-4 py-3 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              rows={2}
            />
          </div>

          {/* Scope and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">Scope</label>
              <select className="w-full px-4 py-3 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
                <option>Global</option>
                <option>Department</option>
                <option>Client</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">Status</label>
              <select
                value={workflow.parallelApprovals ? "Active" : "Active"}
                className="w-full px-4 py-3 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          {/* Workflow Steps Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-[#1D1D1F]">Workflow Steps</label>
              <button
                onClick={addApprovalStep}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#007AFF] hover:text-[#0051C3] font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.length === 0 ? (
                <div className="bg-[#F8F9FB] border border-dashed border-[#E5E5E7] rounded-lg p-8 text-center">
                  <p className="text-sm text-[#86868B]">No workflow steps yet. Add your first step to get started.</p>
                </div>
              ) : (
                steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(step.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(step.id)}
                    className={`border border-[#E5E5E7] rounded-lg p-4 bg-white transition-all cursor-move ${
                      draggedStep === step.id ? "opacity-50" : ""
                    }`}
                  >
                    {/* Step Summary */}
                    <div className="flex items-start gap-4">
                      <GripVertical className="w-5 h-5 text-[#D1D1D6] mt-1 flex-shrink-0" />
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center font-semibold text-sm text-[#1D1D1F]">
                        {step.stepNumber}
                      </div>

                      <div className="flex-grow min-w-0">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          placeholder="Step name"
                          className="w-full font-medium text-[#1D1D1F] mb-3 px-0 py-1 border-0 border-b border-transparent hover:border-[#E5E5E7] focus:border-[#2E7D32] focus:outline-none bg-transparent"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-[#86868B] font-medium mb-1">Owner</label>
                            <select
                              value={step.customApproverEmail || step.role}
                              onChange={(e) => {
                                const value = e.target.value
                                const selectedUser = users.find((u) => u.id === value)
                                if (selectedUser) {
                                  updateStep(step.id, { 
                                    role: "custom" as ApprovalRole, 
                                    customApproverEmail: selectedUser.id,
                                    customApproverName: selectedUser.name,
                                  })
                                } else {
                                  updateStep(step.id, { 
                                    role: value as ApprovalRole,
                                    customApproverEmail: undefined,
                                    customApproverName: undefined,
                                  })
                                }
                              }}
                              className="w-full px-3 py-2 border border-[#E5E5E7] rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                            >
                              {/* <optgroup label="Roles">
                                {APPROVAL_ROLES.map((role) => (
                                  <option key={role} value={role}>
                                    {role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                  </option> 
                                ))}
                              </optgroup> */}
                              {users.length > 0 && (
                                <optgroup label="Team Members">
                                  {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                      {user.name} ({user.role})
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </div>

                          {/* <div>
                            <label className="block text-xs text-[#86868B] font-medium mb-1">Department</label>
                            <select 
                              value={step.department || ""}
                              onChange={(e) => updateStep(step.id, { department: e.target.value })}
                              className="w-full px-3 py-2 border border-[#E5E5E7] rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                            >
                              <option value="">Select Department</option>
                              {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                            </select>
                          </div> */}
                        </div>

                        <div>
                          <label className="block text-xs text-[#86868B] font-medium mb-1 mt-3">SOP Link (optional)</label>
                          <input
                            type="text"
                            value={step.sopIds?.[0] || ""}
                            onChange={(e) => updateStep(step.id, { sopIds: e.target.value ? [e.target.value] : [] })}
                            placeholder="Link to SOP documentation..."
                            className="w-full px-3 py-2 border border-[#E5E5E7] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2E7D32] bg-white"
                          />
                        </div>

                        {/* Additional Options */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <label className="flex items-center gap-2 text-xs">
                            <input 
                              type="checkbox" 
                              checked={step.canReject} 
                              onChange={(e) => updateStep(step.id, { canReject: e.target.checked })}
                              className="w-4 h-4 rounded" 
                            />
                            <span className="text-[#515154]">Can Reject</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs">
                            <input 
                              type="checkbox" 
                              checked={step.canDelegate} 
                              onChange={(e) => updateStep(step.id, { canDelegate: e.target.checked })}
                              className="w-4 h-4 rounded" 
                            />
                            <span className="text-[#515154]">Can Delegate</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="number"
                              placeholder="Days"
                              value={step.timeoutDays || 2}
                              onChange={(e) => updateStep(step.id, { timeoutDays: parseInt(e.target.value) || 2 })}
                              className="w-16 px-2 py-1 border border-[#E5E5E7] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                            />
                            <span className="text-[#515154]">days timeout</span>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => removeStep(step.id)}
                        className="text-[#FF3B30] hover:text-[#C41C15] flex-shrink-0 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end p-6 border-t border-[#E5E5E7] bg-[#F8F9FB]">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-[#1D1D1F] font-medium hover:bg-[#E5E5E7] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#0071E3] text-white font-medium rounded-lg hover:bg-[#0051C3] transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>
    </div>
  )
}
