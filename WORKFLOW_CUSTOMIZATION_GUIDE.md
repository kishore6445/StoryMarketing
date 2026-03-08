# Workflow Customization Guide - Department & Client Specific Approval Chains

## Overview

The Workflow Customization System allows you to define department-specific and client-specific approval workflows that automatically route tasks and phases through the correct approval chain based on organizational hierarchy and client requirements.

## Key Features

### 1. Department-Based Workflows
- Define approval workflows per department (Marketing, Finance, HR, etc.)
- Supports organizational hierarchy (parent/child departments)
- Rules inherit from parent departments if configured
- Role-based approval chains (Manager → Director → Executive)

### 2. Client-Based Workflows  
- Custom workflows specific to each client
- Compliance framework support (HIPAA, GDPR, SOX, PCI)
- Custom approvers per client (Legal, Compliance, etc.)
- Client approval integration in workflow

### 3. Approval Step Configuration
Each approval step can be customized with:
- **Role**: Who must approve (Manager, Director, Executive, Compliance Officer, Client, Custom)
- **Timeout**: Days until auto-escalation
- **Can Reject**: Whether approver can reject
- **Can Delegate**: Whether approver can delegate to someone else
- **Require Comments**: Force approver to leave feedback
- **Notifications**: Alert on approval/rejection

### 4. Workflow Modes
- **Sequential**: Approvers must complete one after another
- **Parallel**: All approvers review simultaneously
- **Escalation**: Auto-escalate if not approved within timeout

---

## Where to Access

**Sidebar Navigation:**
- Go to: **Collaboration > Workflow Manager**
- Two tabs: Department Workflows | Client Workflows

---

## Using the Workflow Manager

### Creating a Department Workflow

1. **Click** "New Department Workflow"
2. **Configure Workflow:**
   - Enter Workflow Name (e.g., "Campaign Launch Approval")
   - Add Description
   - Select Trigger Action (Phase Submit, Task Completion, Content Approval, Campaign Launch)
   - Choose Approval Mode (Sequential or Parallel)
3. **Add Approval Steps:**
   - Click "Add Step"
   - Select Role (Manager, Director, Executive, etc.)
   - Set timeout in days
   - Configure permissions (can reject, can delegate, etc.)
   - Reorder steps using up/down arrows
4. **Save Workflow**

### Creating a Client Workflow

1. **Click** "New Client Workflow"
2. **Select Client** and compliance requirements
3. **Add Custom Approvers** (e.g., Client Legal Team, Compliance Officer)
4. **Build Approval Steps** (same as department workflow)
5. **Save Workflow**

---

## How Workflows Execute

### Example: Campaign Launch for Marketing Department

```
User submits campaign for approval
    ↓
Workflow Engine checks:
  - Client: ABC Manufacturing
  - Department: Marketing
  - Action: campaign_launch
    ↓
Resolves to: "Campaign Launch Approval" workflow
    ↓
Step 1: Manager Review (1 day timeout)
  - Task sent to User's Manager
  - Manager can approve, reject, or delegate
  - If timeout: Escalate to Director
    ↓
Step 2: Director Approval (2 days timeout)
  - Director reviews campaign
  - Must provide comments
  - Cannot delegate
    ↓
IF Compliance Required:
  Step 3: Compliance Check (parallel)
  - Compliance Officer reviews
  - Checks brand guidelines, legal terms
    ↓
Step Final: Campaign Live
  - Notifications sent to team
  - Task marked complete
```

---

## Built-In Workflow Templates

### 1. Simple Approval
**Use for:** Low-risk tasks, internal content
**Steps:**
- Manager Review (2 days, can reject/delegate)

### 2. Multi-Level Approval
**Use for:** Phase completions, major decisions
**Steps:**
- Manager Review (1 day)
- Director Review (2 days, requires comments)
- Executive Approval (3 days)

### 3. Compliance Approval
**Use for:** Regulated content, compliance-sensitive industries
**Steps:**
- Compliance Officer Review (1 day, parallel, requires comments)
- Manager Approval (1 day, can delegate)

### 4. Client Approval
**Use for:** Content requiring client sign-off
**Steps:**
- Internal Review (1 day)
- Client Approval (3 days, requires comments)

### 5. Campaign Launch
**Use for:** Full campaign publishing
**Steps:**
- Creative Team Review (1 day, requires comments)
- Strategy Validation (1 day, requires comments)
- Director Approval (2 days)

---

## Department Hierarchy & Role Resolution

The system automatically determines required approvals based on the requesting user's role:

```
Role Hierarchy (top to bottom authority):
1. Executive (can bypass most workflows)
2. Director
3. Compliance Officer
4. Manager
5. Team Member / Client
```

**Example:**
- If a **Manager** submits content for approval → Requires Director + Executive approval
- If a **Director** submits → Only requires Executive approval
- If an **Executive** submits → Can bypass (if allowed)

---

## Client Compliance Framework Integration

When a client requires compliance, the system adds mandatory steps:

| Framework | Key Approvers | Required Checks |
|-----------|---------------|-----------------|
| **GDPR** | Data Officer, Legal | Data privacy, user consent |
| **HIPAA** | Compliance Officer, Medical Review | Patient data protection |
| **SOX** | Audit Committee, Finance | Financial disclosure |
| **PCI** | Security Officer, Compliance | Payment card security |

---

## Advanced Features

### Escalation Policies
Define what happens if an approver doesn't respond:
```
If not approved within 2 days → Escalate to Manager
If not approved within 3 days → Escalate to Director
If not approved within 5 days → Auto-approve or reject based on rule
```

### Bypass Rules
Allow specific roles to bypass approval:
```
- Executives can bypass for urgent campaigns
- Compliance Officer can bypass for routine internal content
```

### Delegation
Approvers can reassign approval to:
- Another person with same role
- Their manager
- A designated backup

---

## Workflow Audit Trail

Every workflow execution is logged:
- Who triggered it
- Which approvers were notified
- Approval/rejection decisions
- Comments and feedback
- Timestamps for all actions
- Escalations triggered

**Access Audit Trail:**
- Sidebar: Collaboration > Workflow Engine
- View "Workflow Audit Trail" section
- Filter by date, user, phase, client

---

## Common Workflow Scenarios

### Scenario 1: Fast-Track Approval (Marketing Campaign)
**Setup:**
- Sequential workflow
- Manager: 1 day, can approve immediately
- Director: 1 day, quick review
- Total: Can be done in 2 days

### Scenario 2: Compliance-Heavy (Financial Services)
**Setup:**
- Parallel workflow (compliance + manager simultaneous)
- Compliance Officer: 2 days, requires detailed comments
- Manager: 1 day
- Director: 2 days, final approval
- Total: 2-4 days

### Scenario 3: Client Gatekeeping (B2B SaaS)
**Setup:**
- Internal review (1 day)
- Client approval (unlimited, client decides timing)
- Doesn't proceed without client sign-off

### Scenario 4: Executive Attention (Board-Level Decisions)
**Setup:**
- Manager: 1 day, initial review
- Director: 1 day, validation
- Executive: 3 days, final decision
- Escalation: If Director rejects, goes to Executive for override

---

## Best Practices

1. **Keep workflows simple** - 3-4 steps max for best throughput
2. **Set realistic timeouts** - Too short = bottleneck, too long = delays
3. **Use parallel for non-conflicting roles** - Speeds up turnaround
4. **Document why each step exists** - Help team understand approval logic
5. **Review workflows quarterly** - Adjust based on performance metrics
6. **Test with sandbox accounts** - Before deploying to production
7. **Archive old workflows** - Keep manager clean and organized

---

## Workflow Performance Metrics

Track these metrics to optimize workflows:

| Metric | Target | Warning |
|--------|--------|---------|
| Avg Approval Time | 2-3 days | >7 days |
| Rejection Rate | 5-10% | >20% |
| Escalation Rate | <5% | >15% |
| Delegation Rate | <10% | >30% |
| Approval Timeout Hits | 0% | >5% |

---

## Integrations with Other System Components

**Workflow Manager integrates with:**

1. **Phase Completion** - Routes phase sign-off through configured workflow
2. **Content Approval** - Sends content through department/client approval chain
3. **Campaign Launch** - Mandatory multi-step approval before publishing
4. **Team Meetings** - Tracks meeting approvals in workflow
5. **Compliance & Safety** - Adds compliance checks to workflow
6. **Audit Trail** - Records all workflow actions for compliance

---

## API Reference (For Database Integration)

```typescript
// Trigger workflow
await triggerWorkflow({
  clientId: string
  departmentId: string
  action: "phase_submit" | "task_completion" | "content_approval" | "campaign_launch"
  itemId: string
  userId: string
})

// Get workflow for context
const workflow = await resolveWorkflow({
  clientId?: string
  departmentId?: string
  action: string
  userRole?: string
})

// Record approval
await recordApproval({
  workflowInstanceId: string
  stepId: string
  approverId: string
  decision: "approved" | "rejected" | "changes_requested"
  comments?: string
})

// Get audit trail
const auditLog = await getWorkflowAuditTrail({
  workflowId?: string
  clientId?: string
  departmentId?: string
  dateFrom: Date
  dateTo: Date
})
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow never completing | Check timeout settings, ensure all approvers added |
| Wrong approvers assigned | Verify department hierarchy, user roles configured |
| Escalation not triggering | Check timeout days set correctly |
| Client not seeing approval | Verify client added as custom approver |
| Audit trail incomplete | Check user permissions to view logs |
