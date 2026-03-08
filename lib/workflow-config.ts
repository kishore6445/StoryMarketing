// Workflow Configuration System
// Allows defining custom workflows for different departments, clients, and roles
// Supports hierarchy-based approval chains

export type ApprovalRole = "requester" | "manager" | "director" | "executive" | "compliance_officer" | "client" | "custom"

export interface ApprovalStep {
  id: string
  stepNumber: number
  role: ApprovalRole
  title: string
  description?: string
  timeoutDays?: number
  canReject: boolean
  canDelegate: boolean
  requiredComments?: boolean
  notifyOnApproval?: boolean
  notifyOnRejection?: boolean
  sopIds?: string[] // SOPs to follow during this step
  requiredSOPAcknowledgement?: boolean // Must acknowledge SOPs before approving
}

export interface WorkflowRule {
  id: string
  name: string
  description: string
  triggerAction: "phase_submit" | "task_completion" | "content_approval" | "campaign_launch"
  approvalSteps: ApprovalStep[]
  escalationPolicy?: {
    escalateAfterDays: number
    escalateTo: ApprovalRole
  }
  parallelApprovals?: boolean
  requireAllApprovals: boolean
  autoRejectOnTimeout?: boolean
  allowBypass?: boolean
  bypassRoles?: ApprovalRole[]
  nextPhaseId?: string // Auto-advance to next phase after approval
  nextPhaseSOPIds?: string[] // SOPs to show when advancing to next phase
}

export interface DepartmentWorkflowConfig {
  id: string
  departmentId: string
  departmentName: string
  workflows: WorkflowRule[]
  hierarchy?: {
    level: number
    parentDepartment?: string
    inheritsRulesFrom?: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface ClientWorkflowConfig {
  id: string
  clientId: string
  clientName: string
  requiresCompliance: boolean
  complianceFramework?: "hipaa" | "gdpr" | "sox" | "pci" | "custom"
  workflows: WorkflowRule[]
  customApprovers?: {
    role: string
    email: string
    department?: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  category: "marketing" | "compliance" | "finance" | "legal" | "content" | "campaign" | "custom"
  description: string
  approvalSteps: ApprovalStep[]
  isDefault: boolean
  createdBy: string
  createdAt: string
}

// Pre-defined workflow templates
export const DEFAULT_WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  simple_approval: {
    id: "simple_approval",
    name: "Simple Approval",
    category: "custom",
    description: "Single manager approval",
    isDefault: true,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    approvalSteps: [
      {
        id: "step_1",
        stepNumber: 1,
        role: "manager",
        title: "Manager Review",
        description: "Manager reviews and approves",
        timeoutDays: 2,
        canReject: true,
        canDelegate: true,
        requiredComments: false,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
    ],
  },

  multi_level_approval: {
    id: "multi_level_approval",
    name: "Multi-Level Approval",
    category: "custom",
    description: "Manager → Director → Executive approval",
    isDefault: true,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    approvalSteps: [
      {
        id: "step_1",
        stepNumber: 1,
        role: "manager",
        title: "Manager Review",
        timeoutDays: 1,
        canReject: true,
        canDelegate: true,
        requiredComments: false,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
      {
        id: "step_2",
        stepNumber: 2,
        role: "director",
        title: "Director Review",
        timeoutDays: 2,
        canReject: true,
        canDelegate: false,
        requiredComments: true,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
      {
        id: "step_3",
        stepNumber: 3,
        role: "executive",
        title: "Executive Approval",
        timeoutDays: 3,
        canReject: true,
        canDelegate: false,
        requiredComments: false,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
    ],
  },

  compliance_approval: {
    id: "compliance_approval",
    name: "Compliance Approval",
    category: "compliance",
    description: "Compliance officer + Manager approval (parallel)",
    isDefault: true,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    approvalSteps: [
      {
        id: "step_1",
        stepNumber: 1,
        role: "compliance_officer",
        title: "Compliance Review",
        description: "Compliance check for regulatory requirements",
        timeoutDays: 1,
        canReject: true,
        canDelegate: false,
        requiredComments: true,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
      {
        id: "step_2",
        stepNumber: 2,
        role: "manager",
        title: "Manager Approval",
        timeoutDays: 1,
        canReject: true,
        canDelegate: true,
        requiredComments: false,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
    ],
  },

  client_approval: {
    id: "client_approval",
    name: "Client Approval",
    category: "content",
    description: "Internal review → Client approval",
    isDefault: true,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    approvalSteps: [
      {
        id: "step_1",
        stepNumber: 1,
        role: "manager",
        title: "Internal Review",
        timeoutDays: 1,
        canReject: true,
        canDelegate: true,
        requiredComments: false,
        notifyOnApproval: false,
        notifyOnRejection: true,
      },
      {
        id: "step_2",
        stepNumber: 2,
        role: "client",
        title: "Client Approval",
        timeoutDays: 3,
        canReject: true,
        canDelegate: false,
        requiredComments: true,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
    ],
  },

  campaign_launch: {
    id: "campaign_launch",
    name: "Campaign Launch Approval",
    category: "campaign",
    description: "Creative → Strategy → Manager → Executive approval",
    isDefault: true,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    approvalSteps: [
      {
        id: "step_1",
        stepNumber: 1,
        role: "custom",
        title: "Creative Team Review",
        description: "Design and messaging review",
        timeoutDays: 1,
        canReject: true,
        canDelegate: true,
        requiredComments: true,
        notifyOnApproval: false,
        notifyOnRejection: true,
      },
      {
        id: "step_2",
        stepNumber: 2,
        role: "manager",
        title: "Strategy Validation",
        timeoutDays: 1,
        canReject: true,
        canDelegate: true,
        requiredComments: true,
        notifyOnApproval: false,
        notifyOnRejection: true,
      },
      {
        id: "step_3",
        stepNumber: 3,
        role: "director",
        title: "Director Approval",
        timeoutDays: 2,
        canReject: true,
        canDelegate: false,
        requiredComments: false,
        notifyOnApproval: true,
        notifyOnRejection: true,
      },
    ],
  },
}

// Workflow context resolver - determines which workflow to use based on context
export function resolveWorkflow(context: {
  clientId?: string
  departmentId?: string
  phase?: string
  actionType: "phase_submit" | "task_completion" | "content_approval" | "campaign_launch"
  userRole?: string
}): WorkflowRule | null {
  // This will be populated by actual workflow configurations from database
  // For now, return based on action type
  const template = getTemplateForAction(context.actionType)
  if (template) {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      triggerAction: context.actionType,
      approvalSteps: template.approvalSteps,
      requireAllApprovals: true,
      parallelApprovals: false,
    }
  }
  return null
}

function getTemplateForAction(actionType: string): WorkflowTemplate | null {
  const templateMap: Record<string, string> = {
    phase_submit: "multi_level_approval",
    task_completion: "simple_approval",
    content_approval: "compliance_approval",
    campaign_launch: "campaign_launch",
  }
  const templateId = templateMap[actionType]
  return templateId ? DEFAULT_WORKFLOW_TEMPLATES[templateId] : null
}

// Hierarchy resolver - determines approval chain based on department hierarchy
export function getApprovalChainForHierarchy(
  department: string,
  requestingUserRole: string,
  workflowSteps: ApprovalStep[]
): ApprovalStep[] {
  // Filter and order approval steps based on requesting user's role
  const filteredSteps = workflowSteps.filter((step) => {
    // If user is already at or above the approval level, they don't need approval
    return getRoleHierarchyLevel(step.role) > getRoleHierarchyLevel(requestingUserRole)
  })

  return filteredSteps.sort((a, b) => a.stepNumber - b.stepNumber)
}

// Role hierarchy: lower number = higher authority
function getRoleHierarchyLevel(role: string): number {
  const hierarchy: Record<string, number> = {
    executive: 0,
    director: 1,
    manager: 2,
    compliance_officer: 1.5,
    requester: 4,
    client: 3,
    custom: 2.5,
  }
  return hierarchy[role] || 5
}

// Determine if user can bypass approval
export function canBypassApproval(userRole: string, workflowRule: WorkflowRule): boolean {
  if (!workflowRule.allowBypass || !workflowRule.bypassRoles) {
    return false
  }
  return workflowRule.bypassRoles.includes(userRole as ApprovalRole)
}
