"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Settings, ChevronRight, Building2, Users } from "lucide-react"
import { WorkflowBuilder } from "./workflow-builder"
import useSWR from "swr"

interface WorkflowStep {
  id: string
  workflow_id: string
  step_number: number
  title: string
  description?: string
  owner_role: string
  owner_user_id?: string
  department?: string
  sop_link?: string
  timeout_days: number
  can_reject: boolean
  can_delegate: boolean
  required_comments: boolean
  notify_on_approval: boolean
  notify_on_rejection: boolean
}

interface Workflow {
  id: string
  name: string
  description?: string
  scope: "global" | "department" | "client"
  department_id?: string
  client_id?: string
  trigger_action: string
  require_all_approvals: boolean
  parallel_approvals: boolean
  allow_bypass: boolean
  bypass_roles?: string[]
  status: "active" | "draft" | "archived"
  created_by?: string
  created_at: string
  updated_at: string
  workflow_steps: WorkflowStep[]
}

interface WorkflowManagerProps {
  activeTab?: "departments" | "clients"
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())
}

export function WorkflowManager({ activeTab: initialTab = "departments" }: WorkflowManagerProps) {
  const [activeTab, setActiveTab] = useState<"departments" | "clients">(initialTab)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)

  // Fetch workflows from API with SWR
  const { data, error, isLoading, mutate } = useSWR("/api/workflows?status=active", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  const workflows: Workflow[] = data?.workflows || []

  // Filter workflows by scope
  const departmentWorkflows = workflows.filter((w) => w.scope === "department" || w.scope === "global")
  const clientWorkflows = workflows.filter((w) => w.scope === "client")

  const departmentConfigs = [
    {
      id: "1",
      departmentName: "Engineering",
      hierarchy: {
        parentDepartment: "Product",
      },
      workflows: departmentWorkflows,
    },
  ]

  const clientConfigs = [
    {
      id: "1",
      clientName: "Client A",
      requiresCompliance: true,
      complianceFramework: "ISO 27001",
      customApprovers: [
        { role: "Manager", email: "manager@clienta.com" },
        { role: "Approver", email: "approver@clienta.com" },
      ],
      workflows: clientWorkflows,
    },
  ]

  const handleSaveWorkflow = async (workflowData: {
    name: string
    description?: string
    triggerAction: string
    approvalSteps: Array<{
      id: string
      stepNumber: number
      role: string
      title: string
      description?: string
      timeoutDays?: number
      canReject: boolean
      canDelegate: boolean
      requiredComments?: boolean
      notifyOnApproval?: boolean
      notifyOnRejection?: boolean
      sopLink?: string
      department?: string
      ownerUserId?: string
    }>
    requireAllApprovals: boolean
    parallelApprovals?: boolean
    allowBypass?: boolean
    bypassRoles?: string[]
  }) => {
    const token = localStorage.getItem("sessionToken")
    const scope = activeTab === "departments" ? "department" : "client"

    const steps = workflowData.approvalSteps.map((step, index) => ({
      stepNumber: index + 1,
      title: step.title,
      description: step.description,
      ownerRole: step.role,
      ownerUserId: step.customApproverEmail || step.ownerUserId || null,
      department: step.department,
      sopLink: step.sopLink,
      timeoutDays: step.timeoutDays || 2,
      canReject: step.canReject,
      canDelegate: step.canDelegate,
      requiredComments: step.requiredComments,
      notifyOnApproval: step.notifyOnApproval,
      notifyOnRejection: step.notifyOnRejection,
    }))

    try {
      if (editingWorkflow) {
        // Update existing workflow
        const response = await fetch(`/api/workflows/${editingWorkflow.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: workflowData.name,
            description: workflowData.description,
            triggerAction: workflowData.triggerAction,
            requireAllApprovals: workflowData.requireAllApprovals,
            parallelApprovals: workflowData.parallelApprovals,
            allowBypass: workflowData.allowBypass,
            bypassRoles: workflowData.bypassRoles,
            steps,
          }),
        })

        if (response.ok) {
          mutate() // Refresh data
        }
      } else {
        // Create new workflow
        const response = await fetch("/api/workflows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: workflowData.name,
            description: workflowData.description,
            scope,
            triggerAction: workflowData.triggerAction,
            requireAllApprovals: workflowData.requireAllApprovals,
            parallelApprovals: workflowData.parallelApprovals,
            allowBypass: workflowData.allowBypass,
            bypassRoles: workflowData.bypassRoles,
            steps,
          }),
        })

        if (response.ok) {
          mutate() // Refresh data
        }
      }
    } catch (error) {
      console.error("[v0] Error saving workflow:", error)
    }

    setShowBuilder(false)
    setEditingWorkflow(null)
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return

    const token = localStorage.getItem("sessionToken")

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        mutate() // Refresh data
      }
    } catch (error) {
      console.error("[v0] Error deleting workflow:", error)
    }
  }

  // Transform workflow to WorkflowRule format for builder
  const transformToBuilderFormat = (workflow: Workflow) => ({
    id: workflow.id,
    name: workflow.name,
    description: workflow.description || "",
    triggerAction: workflow.trigger_action as "phase_submit" | "task_completion" | "content_approval" | "campaign_launch",
    approvalSteps: workflow.workflow_steps.map((step) => ({
      id: step.id,
      stepNumber: step.step_number,
      role: step.owner_role as "manager" | "director" | "executive" | "compliance_officer" | "client" | "custom" | "requester",
      title: step.title,
      description: step.description,
      timeoutDays: step.timeout_days,
      canReject: step.can_reject,
      canDelegate: step.can_delegate,
      requiredComments: step.required_comments,
      notifyOnApproval: step.notify_on_approval,
      notifyOnRejection: step.notify_on_rejection,
      sopLink: step.sop_link,
      department: step.department,
      ownerUserId: step.owner_user_id,
    })),
    requireAllApprovals: workflow.require_all_approvals,
    parallelApprovals: workflow.parallel_approvals,
    allowBypass: workflow.allow_bypass,
    bypassRoles: workflow.bypass_roles,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Workflow Management</h1>
          <p className="text-sm text-[#86868B]">Define and manage custom approval workflows for departments and clients</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#F5F5F7] rounded w-1/3" />
            <div className="h-24 bg-[#F5F5F7] rounded" />
            <div className="h-24 bg-[#F5F5F7] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Workflow Management</h1>
          <p className="text-sm text-[#86868B]">Define and manage custom approval workflows for departments and clients</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <div className="text-center text-[#86868B] py-8">
            <p>Failed to load workflows</p>
            <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5]">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Workflow Management</h1>
        <p className="text-sm text-[#86868B]">Define and manage custom approval workflows for departments and clients</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-[#E5E5E7]">
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "departments"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Department Workflows
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "clients"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          <Users className="w-4 h-4" />
          Client Workflows
        </button>
      </div>

      {!showBuilder ? (
        <>
          {activeTab === "departments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1D1D1F]">Departments</h2>
                <button
                  onClick={() => {
                    setEditingWorkflow(null)
                    setShowBuilder(true)
                  }}
                  className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Department Workflow
                </button>
              </div>

              <div className="space-y-3">
                {departmentWorkflows.length === 0 ? (
                  <div className="bg-white border border-[#E5E5E7] rounded-lg p-8 text-center">
                    <Building2 className="w-12 h-12 text-[#86868B] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">No department workflows yet</h3>
                    <p className="text-sm text-[#86868B] mb-4">Create your first workflow to automate approvals</p>
                    <button
                      onClick={() => {
                        setEditingWorkflow(null)
                        setShowBuilder(true)
                      }}
                      className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create Workflow
                    </button>
                  </div>
                ) : (
                  departmentWorkflows.map((workflow) => (
                    <div key={workflow.id} className="bg-white border border-[#E5E5E7] rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#1D1D1F] flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#2E7D32]" />
                            {workflow.name}
                          </h3>
                          <p className="text-xs text-[#86868B] mt-1">{workflow.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingWorkflow(workflow)
                              setShowBuilder(true)
                            }}
                            className="p-2 hover:bg-[#F5F5F7] rounded transition-colors text-[#007AFF]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            className="p-2 hover:bg-[#F5F5F7] rounded transition-colors text-[#FF3B30]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <span className="text-xs px-2 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded">
                          Trigger: {workflow.trigger_action}
                        </span>
                        <span className="text-xs px-2 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded">
                          Steps: {workflow.workflow_steps.length}
                        </span>
                        {workflow.parallel_approvals && (
                          <span className="text-xs px-2 py-1 bg-[#FFF3E0] border border-[#FFB547] text-[#9E5610] rounded">
                            Parallel
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {workflow.workflow_steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-[#1D1D1F]">{step.title}</span>
                            <span className="text-[#86868B]">({step.owner_role})</span>
                            {step.sop_link && (
                              <a href={step.sop_link} target="_blank" rel="noopener noreferrer" className="text-[#007AFF] text-xs hover:underline">
                                SOP
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1D1D1F]">Clients</h2>
                <button
                  onClick={() => {
                    setEditingWorkflow(null)
                    setShowBuilder(true)
                  }}
                  className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Client Workflow
                </button>
              </div>

              <div className="space-y-3">
                {clientWorkflows.length === 0 ? (
                  <div className="bg-white border border-[#E5E5E7] rounded-lg p-8 text-center">
                    <Users className="w-12 h-12 text-[#86868B] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">No client workflows yet</h3>
                    <p className="text-sm text-[#86868B] mb-4">Create workflows for client-specific approval processes</p>
                    <button
                      onClick={() => {
                        setEditingWorkflow(null)
                        setShowBuilder(true)
                      }}
                      className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create Workflow
                    </button>
                  </div>
                ) : (
                  clientWorkflows.map((workflow) => (
                    <div key={workflow.id} className="bg-white border border-[#E5E5E7] rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#1D1D1F] flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#2E7D32]" />
                            {workflow.name}
                          </h3>
                          <p className="text-xs text-[#86868B] mt-1">{workflow.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingWorkflow(workflow)
                              setShowBuilder(true)
                            }}
                            className="p-2 hover:bg-[#F5F5F7] rounded transition-colors text-[#007AFF]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            className="p-2 hover:bg-[#F5F5F7] rounded transition-colors text-[#FF3B30]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <span className="text-xs px-2 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded">
                          Trigger: {workflow.trigger_action}
                        </span>
                        <span className="text-xs px-2 py-1 bg-[#F5F5F7] border border-[#E5E5E7] rounded">
                          Steps: {workflow.workflow_steps.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {workflow.workflow_steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-[#1D1D1F]">{step.title}</span>
                            <span className="text-[#86868B]">({step.owner_role})</span>
                            {step.sop_link && (
                              <a href={step.sop_link} target="_blank" rel="noopener noreferrer" className="text-[#007AFF] text-xs hover:underline">
                                SOP
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-8">
          <WorkflowBuilder
            workflowName={editingWorkflow?.name || "New Workflow"}
            initialWorkflow={editingWorkflow || undefined}
            onSave={handleSaveWorkflow}
            onCancel={() => {
              setShowBuilder(false)
              setEditingWorkflow(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
