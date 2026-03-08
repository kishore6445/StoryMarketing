# Workflow Engine Documentation

## Overview

The Workflow Engine is the core orchestration system for managing task states, approvals, and phase transitions in the Story Marketing OS. It implements finite state machines for tasks and phases, handles approval chains, manages notifications, and maintains a complete audit trail of all actions.

**Location:** `/lib/workflow-engine.ts`
**UI Dashboard:** Sidebar > Collaboration > Workflow Engine

---

## Architecture

### 1. Core Components

#### State Machines
- **Task State Machine**: Defines valid transitions between task statuses
  - States: `todo` → `in_progress` → `blocked` / `review` → `done` / `cancelled`
  - Prevents invalid state transitions
  - Supports rollback operations

- **Phase State Machine**: Defines valid transitions between phase statuses
  - States: `not_started` → `in_progress` → `blocked` / `review` → `completed`
  - Gates transitions on completion conditions
  - Supports phase reopen

#### Workflow Actions
Supported workflow actions that trigger state transitions:
- `task_created` - New task is created
- `task_assigned` - Task assigned to team member
- `task_started` - Task moved to in_progress
- `task_completed` - Task submitted for review
- `task_blocked` - Task blocked by dependency
- `task_unblocked` - Dependency resolved
- `task_cancelled` - Task cancelled
- `phase_started` - Phase initiated
- `phase_submit_review` - Phase ready for approval
- `phase_approve` - Phase approved to proceed
- `phase_reject` - Phase rejected, needs changes
- `approval_requested` - Approval chain initiated
- `approval_completed` - All approvals received
- `meeting_scheduled` - Team meeting created
- `meeting_completed` - Meeting finished

### 2. Approval System

#### Approval Chain Structure
```typescript
ApprovalChain {
  id: string
  phaseId: string
  steps: ApprovalStep[]
  currentStepIndex: number
  status: "pending" | "approved" | "rejected" | "changes_requested"
}

ApprovalStep {
  id: string
  stepName: string
  approverRoles: string[]           // e.g., ["director", "client"]
  requiredApprovals: number         // how many must approve
  timeoutDays: number               // optional deadline
  approvers: Approver[]
}

Approver {
  userId: string
  status: "pending" | "approved" | "rejected" | "changes_requested"
  comments: string
  approvedAt: Date
}
```

#### Multi-Step Approval Flow
1. User submits task/phase for review
2. Approval chain is created with defined steps
3. Approvers receive notifications
4. Each approver reviews and provides feedback
5. When all required approvals received → move to next step
6. When all steps complete → auto-transition to next phase
7. If rejected → return to previous state for changes

### 3. Audit Trail

Every workflow action is logged with:
- Action type and timestamp
- Entity affected (task/phase/approval)
- User who performed action
- Previous and new states
- Metadata and comments
- Complete state change history

**Access:** Workflow Dashboard > Workflow Audit Trail

---

## Usage

### For Developers

#### 1. Execute a Workflow Action

```typescript
import { workflowEngine } from "@/lib/workflow-engine"

const event = await workflowEngine.executeAction({
  clientId: "client-1",
  phaseId: "research",
  taskId: "task-123",
  userId: "user-456",
  action: "task_completed",
  metadata: {
    fromStatus: "in_progress",
    toStatus: "review",
    name: "Complete market research"
  }
})
```

#### 2. Listen to Workflow Events

```typescript
import { onTaskStatusChange, onPhaseTransition, onApprovalRequired } from "@/lib/workflow-engine"

// Listen to task changes
onTaskStatusChange((event) => {
  console.log("Task status changed:", event.previousStatus, "→", event.newStatus)
})

// Listen to phase transitions
onPhaseTransition((event) => {
  console.log("Phase transitioned:", event.context.phaseId)
})

// Listen to approvals
onApprovalRequired((event) => {
  // Send notifications to approvers
})
```

#### 3. Create Approval Chain

```typescript
const chain = workflowEngine.buildApprovalChain(
  "phase-research",
  ["manager", "client"],
  [
    { userId: "user-1", name: "Sarah", email: "sarah@agency.com", role: "manager" },
    { userId: "user-2", name: "John", email: "john@client.com", role: "client" }
  ]
)
```

#### 4. Process Approval

```typescript
const isComplete = await workflowEngine.processApproval(
  "approval_chain_123",
  "user-1",
  "approved",
  "Looks good, approved!"
)

// If all approvals complete, returns true
// Automatically triggers next workflow action
```

#### 5. Check Audit Log

```typescript
const logs = workflowEngine.getAuditLog("client-1")
console.log(logs) // All workflow actions for client
```

### For Non-Technical Users

Access via **Sidebar > Collaboration > Workflow Engine**

#### Dashboard Sections:

1. **Key Metrics**
   - Total Actions: All workflow executions
   - Tasks Completed: Successfully transitioned to done
   - Awaiting Approval: Pending stakeholder review
   - Phases in Review: Awaiting phase approval
   - Blocked Tasks: Waiting for dependencies
   - Last 24 Hours: Activity snapshot

2. **Workflow Audit Trail**
   - Complete log of all actions with timestamps
   - Filter by action type
   - View detailed metadata
   - Track who made each change
   - See state transitions

3. **State Machine Info**
   - Task state machine diagram
   - Phase state machine diagram
   - Valid transitions per state

---

## Conditions & Validation

### Transition Conditions

Before a state transition occurs, the workflow engine validates:

1. **Action Validity** - Is this action allowed in the system?
2. **State Validity** - Can this state transition from current state?
3. **Dependencies** - Are all prerequisites met? (e.g., all tasks done)
4. **Time Checks** - Has enough time passed? (time-based conditions)
5. **Custom Rules** - Do custom business rules pass?

### Built-in Conditions

- `all_tasks_done` - All tasks in phase must be completed
- `task_count_threshold` - Minimum tasks must be complete (%)
- `time_based` - Days elapsed must reach minimum
- `dependency` - Blocking task must be resolved
- `custom` - Custom business logic

---

## Notifications

When workflow actions occur, notifications are triggered based on rules:

```typescript
NotificationRule {
  type: "email" | "in_app" | "slack" | "webhook"
  recipients: ["user-1", "user-2"]
  template: "task_completed_notification"
  timing: "immediate" | "delayed" | "batch"
}
```

**Automatic Notifications:**
- Task assigned → assigned user
- Task completed → phase lead
- Phase submitted for review → approvers
- Approval requested → approvers
- Phase approved → team lead

---

## Database Integration

When database is integrated, replace mock implementation with:

```typescript
// In WorkflowEngine class methods:
const audit = await db.workflow_audit_logs.insert({
  client_id: context.clientId,
  action: context.action,
  // ... rest of fields
})

const approval = await db.approval_chains.update(approvalChainId, {
  status: 'approved'
})
```

---

## Common Workflows

### Task Completion Workflow
1. User marks task "In Progress"
2. User completes task and submits
3. Workflow engine transitions task to "Review"
4. Approval chain created if required
5. Approver reviews and approves
6. Task auto-transitions to "Done"
7. Audit log records all steps

### Phase Completion Workflow
1. All tasks in phase must be done/cancelled
2. Phase lead clicks "Complete Phase"
3. Workflow engine validates all conditions
4. Phase transitions to "Review"
5. Multi-step approval chain starts
6. When all approvals received → Phase "Completed"
7. Next phase becomes available
8. Team notified of progress

### Phase Rollback Workflow
1. Phase was completed and approved
2. Need to reopen for changes
3. Phase lead clicks "Reopen Phase"
4. Workflow engine transitions to "In Progress"
5. Previous tasks revert to "In Progress"
6. Audit log shows rollback reason
7. Team continues work

---

## Error Handling

The workflow engine includes error handling for:
- Invalid state transitions
- Condition evaluation failures
- Missing required data
- Approval processing errors
- Notification failures

**Check:** Audit trail for error details and recovery steps

---

## Best Practices

1. **Always attach metadata** to workflow actions for audit trail clarity
2. **Use timestamps** to track action timing and duration
3. **Keep approval chains simple** - max 3-4 steps per phase
4. **Review audit logs regularly** - identify bottlenecks
5. **Test conditions** before deploying custom logic
6. **Monitor blocked tasks** - resolve dependencies quickly
7. **Set approval timeouts** - prevent indefinite pending approvals

---

## Integration Examples

### In React Components

```typescript
"use client"

import { workflowEngine, onTaskStatusChange } from "@/lib/workflow-engine"
import { useEffect } from "react"

export function TaskComponent() {
  useEffect(() => {
    // Listen to task changes
    onTaskStatusChange((event) => {
      console.log("Task updated:", event)
      // Refresh UI
    })
  }, [])

  const handleCompleteTask = async () => {
    const event = await workflowEngine.executeAction({
      clientId: selectedClientId,
      taskId: taskId,
      userId: currentUserId,
      action: "task_completed",
      metadata: {
        fromStatus: "in_progress",
        toStatus: "review"
      }
    })

    if (event) {
      console.log("Task completed successfully")
    }
  }

  return <button onClick={handleCompleteTask}>Complete Task</button>
}
```

### In API Routes

```typescript
// app/api/workflow/action/route.ts
import { workflowEngine } from "@/lib/workflow-engine"

export async function POST(request: Request) {
  const { action, context } = await request.json()

  const event = await workflowEngine.executeAction({
    ...context,
    userId: session.user.id
  })

  return Response.json(event)
}
```

---

## FAQ

**Q: Can I modify state machines?**
A: Yes, in `WorkflowEngine.initializeTransitions()` method

**Q: How long are audit logs kept?**
A: Until explicitly deleted. Plan database retention policy.

**Q: Can approvals be parallelized?**
A: Yes, use multiple approval steps with `requiredApprovals: 1`

**Q: What if approver doesn't respond?**
A: Use `timeoutDays` to auto-escalate or reject

**Q: Can tasks skip phases?**
A: No, workflow engine enforces sequential phase progression

---

## Support

For questions or issues with the workflow engine, contact the development team or refer to the codebase in `/lib/workflow-engine.ts`
