// Workflow Engine - Core orchestration for task states, approvals, and phase transitions
// Manages: task state machines, approval chains, phase progression, automated triggers, notifications

import type { Task } from "@/lib/types/database"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TaskStatus = "todo" | "in_progress" | "blocked" | "review" | "done" | "cancelled"
export type PhaseStatus = "not_started" | "in_progress" | "review" | "completed" | "blocked"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes_requested"

export interface WorkflowContext {
  clientId: string
  phaseId: string
  taskId?: string
  userId: string
  action: WorkflowAction
  metadata?: Record<string, unknown>
}

export type WorkflowAction =
  | "task_created"
  | "task_assigned"
  | "task_started"
  | "task_completed"
  | "task_blocked"
  | "task_unblocked"
  | "task_cancelled"
  | "phase_started"
  | "phase_submit_review"
  | "phase_approve"
  | "phase_reject"
  | "approval_requested"
  | "approval_completed"
  | "meeting_scheduled"
  | "meeting_completed"

export interface WorkflowTransition {
  id: string
  action: WorkflowAction
  fromStatus: string
  toStatus: string
  conditions?: WorkflowCondition[]
  autoExecute?: boolean
  requiresApproval?: boolean
  notifications?: NotificationRule[]
}

export interface WorkflowCondition {
  type: "all_tasks_done" | "task_count_threshold" | "time_based" | "dependency" | "custom"
  params: Record<string, unknown>
  evaluate: (context: WorkflowContext) => Promise<boolean>
}

export interface NotificationRule {
  type: "email" | "in_app" | "slack" | "webhook"
  recipients: string[]
  template: string
  timing: "immediate" | "delayed" | "batch"
}

export interface ApprovalChain {
  id: string
  phaseId: string
  steps: ApprovalStep[]
  currentStepIndex: number
  status: ApprovalStatus
  createdAt: Date
}

export interface ApprovalStep {
  id: string
  stepName: string
  approverRoles: string[]
  requiredApprovals: number
  timeoutDays?: number
  status: ApprovalStatus
  approvers: Approver[]
  completedAt?: Date
}

export interface Approver {
  userId: string
  name: string
  email: string
  role: string
  status: ApprovalStatus
  comments?: string
  approvedAt?: Date
}

export interface WorkflowEvent {
  id: string
  context: WorkflowContext
  timestamp: Date
  previousStatus: string
  newStatus: string
  approvalHistory?: ApprovalChain
  notifications?: NotificationRule[]
}

export interface WorkflowAuditLog {
  id: string
  clientId: string
  action: WorkflowAction
  entity: {
    type: "task" | "phase" | "approval"
    id: string
    name: string
  }
  changes: {
    from: Record<string, unknown>
    to: Record<string, unknown>
  }
  performedBy: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// ============================================================================
// STATE MACHINES
// ============================================================================

// Task state machine definition
export const TASK_STATE_MACHINE = {
  todo: {
    canTransitionTo: ["in_progress", "blocked", "cancelled"],
    actions: ["assign", "start", "block", "cancel"],
  },
  in_progress: {
    canTransitionTo: ["blocked", "review", "done", "todo"],
    actions: ["block", "submit_review", "complete", "reopen"],
  },
  blocked: {
    canTransitionTo: ["todo", "in_progress", "cancelled"],
    actions: ["unblock", "reopen", "cancel"],
  },
  review: {
    canTransitionTo: ["in_progress", "done", "cancelled"],
    actions: ["request_changes", "approve", "cancel"],
  },
  done: {
    canTransitionTo: ["in_progress", "cancelled"],
    actions: ["reopen", "cancel"],
  },
  cancelled: {
    canTransitionTo: ["todo"],
    actions: ["reopen"],
  },
}

// Phase state machine definition
export const PHASE_STATE_MACHINE = {
  not_started: {
    canTransitionTo: ["in_progress", "blocked"],
    actions: ["start", "block"],
  },
  in_progress: {
    canTransitionTo: ["blocked", "review", "completed"],
    actions: ["block", "submit_review", "complete"],
  },
  blocked: {
    canTransitionTo: ["in_progress"],
    actions: ["unblock"],
  },
  review: {
    canTransitionTo: ["in_progress", "completed"],
    actions: ["request_changes", "approve"],
  },
  completed: {
    canTransitionTo: ["in_progress"],
    actions: ["reopen"],
  },
}

// ============================================================================
// WORKFLOW EXECUTION ENGINE
// ============================================================================

export class WorkflowEngine {
  private auditLog: WorkflowAuditLog[] = []
  private transitions: Map<string, WorkflowTransition[]> = new Map()
  private eventListeners: Map<WorkflowAction, ((event: WorkflowEvent) => void)[]> = new Map()

  constructor() {
    this.initializeTransitions()
  }

  private initializeTransitions() {
    // Task transitions
    this.registerTransition({
      id: "start_task",
      action: "task_started",
      fromStatus: "todo",
      toStatus: "in_progress",
      autoExecute: true,
    })

    this.registerTransition({
      id: "complete_task",
      action: "task_completed",
      fromStatus: "in_progress",
      toStatus: "review",
      requiresApproval: true,
    })

    this.registerTransition({
      id: "block_task",
      action: "task_blocked",
      fromStatus: "in_progress",
      toStatus: "blocked",
      autoExecute: true,
    })

    // Phase transitions
    this.registerTransition({
      id: "start_phase",
      action: "phase_started",
      fromStatus: "not_started",
      toStatus: "in_progress",
      autoExecute: true,
    })

    this.registerTransition({
      id: "submit_phase_review",
      action: "phase_submit_review",
      fromStatus: "in_progress",
      toStatus: "review",
      conditions: [
        {
          type: "all_tasks_done",
          params: { phaseId: "" },
          evaluate: async (context) => true,
        },
      ],
      requiresApproval: true,
    })

    this.registerTransition({
      id: "approve_phase",
      action: "phase_approve",
      fromStatus: "review",
      toStatus: "completed",
      requiresApproval: true,
    })
  }

  /**
   * Register a workflow transition rule
   */
  registerTransition(transition: WorkflowTransition) {
    const key = `${transition.fromStatus}_to_${transition.toStatus}`
    if (!this.transitions.has(key)) {
      this.transitions.set(key, [])
    }
    this.transitions.get(key)!.push(transition)
  }

  /**
   * Execute a workflow action and handle state transition
   */
  async executeAction(context: WorkflowContext): Promise<WorkflowEvent | null> {
    try {
      // Validate action is allowed
      const isValid = this.validateAction(context)
      if (!isValid) {
        console.error(`[v0] Invalid workflow action: ${context.action} in context`, context)
        return null
      }

      // Check all conditions
      const conditions = this.getTransitionConditions(context)
      for (const condition of conditions) {
        const isMet = await condition.evaluate(context)
        if (!isMet) {
          console.warn(`[v0] Workflow condition not met for action: ${context.action}`, condition)
          return null
        }
      }

      // Create audit log entry
      const auditEntry: WorkflowAuditLog = {
        id: `audit_${Date.now()}`,
        clientId: context.clientId,
        action: context.action,
        entity: {
          type: context.taskId ? "task" : "phase",
          id: context.taskId || context.phaseId,
          name: context.metadata?.name as string,
        },
        changes: {
          from: { status: context.metadata?.fromStatus },
          to: { status: context.metadata?.toStatus },
        },
        performedBy: context.userId,
        timestamp: new Date(),
        metadata: context.metadata,
      }
      this.auditLog.push(auditEntry)

      // Build event
      const event: WorkflowEvent = {
        id: `event_${Date.now()}`,
        context,
        timestamp: new Date(),
        previousStatus: context.metadata?.fromStatus as string,
        newStatus: context.metadata?.toStatus as string,
      }

      // Emit event
      this.emitEvent(context.action, event)

      return event
    } catch (error) {
      console.error("[v0] Workflow execution error:", error)
      return null
    }
  }

  /**
   * Build approval chain for phase or task
   */
  buildApprovalChain(
    phaseId: string,
    approverRoles: string[],
    approvers: Array<{ userId: string; name: string; email: string; role: string }>
  ): ApprovalChain {
    return {
      id: `approval_${Date.now()}`,
      phaseId,
      currentStepIndex: 0,
      status: "pending",
      createdAt: new Date(),
      steps: [
        {
          id: "step_1",
          stepName: "Initial Review",
          approverRoles,
          requiredApprovals: 1,
          timeoutDays: 7,
          status: "pending",
          approvers: approvers.map((a) => ({
            userId: a.userId,
            name: a.name,
            email: a.email,
            role: a.role,
            status: "pending",
          })),
        },
      ],
    }
  }

  /**
   * Process approval
   */
  async processApproval(
    approvalChainId: string,
    approverId: string,
    status: ApprovalStatus,
    comments?: string
  ): Promise<boolean> {
    try {
      // In production: update approval chain in database
      console.log(`[v0] Processing approval: ${approvalChainId} by ${approverId}`)

      // Check if all approvals are complete
      const allApproved = status === "approved"

      if (allApproved) {
        // Trigger phase completion or task completion
        console.log("[v0] All approvals received, triggering phase/task completion")
        return true
      }

      return false
    } catch (error) {
      console.error("[v0] Approval processing error:", error)
      return false
    }
  }

  /**
   * Subscribe to workflow events
   */
  onAction(action: WorkflowAction, callback: (event: WorkflowEvent) => void) {
    if (!this.eventListeners.has(action)) {
      this.eventListeners.set(action, [])
    }
    this.eventListeners.get(action)!.push(callback)
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(action: WorkflowAction, event: WorkflowEvent) {
    const listeners = this.eventListeners.get(action) || []
    listeners.forEach((callback) => callback(event))
  }

  /**
   * Validate action is allowed
   */
  private validateAction(context: WorkflowContext): boolean {
    // Check if action exists
    const allowedActions: WorkflowAction[] = [
      "task_created",
      "task_assigned",
      "task_started",
      "task_completed",
      "task_blocked",
      "task_unblocked",
      "task_cancelled",
      "phase_started",
      "phase_submit_review",
      "phase_approve",
      "phase_reject",
      "approval_requested",
      "approval_completed",
      "meeting_scheduled",
      "meeting_completed",
    ]
    return allowedActions.includes(context.action)
  }

  /**
   * Get transition conditions
   */
  private getTransitionConditions(context: WorkflowContext): WorkflowCondition[] {
    const transitions = Array.from(this.transitions.values()).flat()
    return transitions
      .filter((t) => t.action === context.action)
      .flatMap((t) => t.conditions || [])
  }

  /**
   * Get audit log
   */
  getAuditLog(clientId: string): WorkflowAuditLog[] {
    return this.auditLog.filter((log) => log.clientId === clientId)
  }

  /**
   * Check task dependencies are met
   */
  async canTaskBegin(taskId: string, dependencies: string[]): Promise<boolean> {
    // In production: check if all dependent tasks are completed
    return dependencies.length === 0
  }

  /**
   * Check phase can be completed
   */
  async canPhaseBeCompleted(phaseId: string, tasks: Task[]): Promise<boolean> {
    // All tasks must be done or deferred
    return tasks.every((t) => t.status === "done" || t.status === "cancelled")
  }
}

// ============================================================================
// WORKFLOW HOOKS
// ============================================================================

// Create singleton instance
export const workflowEngine = new WorkflowEngine()

/**
 * Hook: When task status changes
 */
export function onTaskStatusChange(callback: (event: WorkflowEvent) => void) {
  workflowEngine.onAction("task_started", callback)
  workflowEngine.onAction("task_completed", callback)
  workflowEngine.onAction("task_blocked", callback)
}

/**
 * Hook: When phase transitions
 */
export function onPhaseTransition(callback: (event: WorkflowEvent) => void) {
  workflowEngine.onAction("phase_started", callback)
  workflowEngine.onAction("phase_submit_review", callback)
  workflowEngine.onAction("phase_approve", callback)
}

/**
 * Hook: When approval chain is triggered
 */
export function onApprovalRequired(callback: (event: WorkflowEvent) => void) {
  workflowEngine.onAction("approval_requested", callback)
  workflowEngine.onAction("approval_completed", callback)
}

/**
 * Hook: On any workflow action
 */
export function onWorkflowAction(callback: (event: WorkflowEvent) => void) {
  const actions: WorkflowAction[] = [
    "task_created",
    "task_assigned",
    "task_started",
    "task_completed",
    "task_blocked",
    "task_unblocked",
    "task_cancelled",
    "phase_started",
    "phase_submit_review",
    "phase_approve",
    "phase_reject",
    "approval_requested",
    "approval_completed",
    "meeting_scheduled",
    "meeting_completed",
  ]
  actions.forEach((action) => workflowEngine.onAction(action, callback))
}
