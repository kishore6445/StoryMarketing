# PKR (Promises Kept Ratio) Implementation Plan
## With Internal Due Dates & External Promised Dates

---

## 1. DEFINITIONS & TERMINOLOGY

### Key Dates
- **Due Date (Internal Promise)**: Internal deadline - when the team commits to have work ready
- **Due Time**: The specific time on the due date when work must be ready
- **Promised Date (External Promise)**: Client-facing deadline - when the client expects delivery
- **Promised Time**: The specific time on the promised date for client delivery

### Task Completion States
- **On Time (Internal)**: Task completed by due_date + due_time
- **On Time (External)**: Task completed by promised_date + promised_time
- **Late (Internal)**: Task completed after due_date + due_time but before promised_date
- **Late (External)**: Task completed after promised_date + promised_time (client impact)
- **Not Completed**: Task status is not "done"

---

## 2. PKR CALCULATION METHODOLOGY

### Current PKR (Simplified)
```
PKR = (Completed Tasks / Total Tasks) × 100
```

### Enhanced PKR (Multi-Layer)

#### Layer 1: Internal PKR (Team Commitment)
```
Internal PKR = (Tasks Completed by Internal Due Date & Time / Total Tasks with Internal Deadlines) × 100

Categories:
- Completed On Time: Task.status = "done" AND completed_at ≤ due_date + due_time
- Completed Late: Task.status = "done" AND completed_at > due_date + due_time
- Not Completed: Task.status ≠ "done" AND due_date has passed
- In Progress: Task.status = "in_progress" (no penalty if within due date)
```

#### Layer 2: External PKR (Client Facing)
```
External PKR = (Tasks Completed by External Promised Date & Time / Total Tasks with Client Promises) × 100

Categories:
- Delivered On Time: Task completed ≤ promised_date + promised_time (SUCCESS)
- Delivered Late: Task completed > promised_date + promised_time (RISK/ISSUE)
- Not Delivered: promised_date has passed and task.status ≠ "done" (CRITICAL)
```

#### Layer 3: Commitment Quality Score
```
Commitment Score = (Tasks On Time / Total Completed Tasks) × 100

Measures: How many internal commitments were kept vs. how many were rushed/delayed
- 90-100%: Elite - Strong commitment management
- 80-89%: Good - Acceptable buffer usage
- 70-79%: Warning - Frequent use of promises vs. internal deadlines
- <70%: Critical - Too many rushed completions
```

---

## 3. DATABASE SCHEMA UPDATES

### New Fields to Add to `tasks` Table
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS (
  due_time TIME,                          -- Internal commitment time (e.g., "17:00")
  promised_date DATE,                     -- Client-facing due date
  promised_time TIME,                     -- Client-facing due time (e.g., "09:00")
  completed_at TIMESTAMPTZ,               -- Exact completion timestamp
  internal_status TEXT DEFAULT 'on_track', -- 'on_track', 'at_risk', 'overdue'
  external_status TEXT DEFAULT 'on_track'  -- 'on_track', 'at_risk', 'overdue', 'overdue_client'
);

-- Add indexes for faster PKR calculations
CREATE INDEX idx_tasks_due_date_status ON tasks(due_date, status);
CREATE INDEX idx_tasks_promised_date_status ON tasks(promised_date, status);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
```

---

## 4. PKR CALCULATION LOGIC

### Function: Calculate Internal PKR
```typescript
function calculateInternalPKR(tasks: Task[], userId?: string): PKRMetrics {
  // Filter tasks with internal deadlines
  const tasksWithDeadlines = tasks.filter(t => t.due_date);
  
  if (tasksWithDeadlines.length === 0) return { pkr: 0, total: 0, completed: 0 };
  
  // Count completed on time
  const completedOnTime = tasksWithDeadlines.filter(t => {
    if (t.status !== 'done') return false;
    const dueDateTime = combineDateTime(t.due_date, t.due_time);
    return t.completed_at <= dueDateTime;
  }).length;
  
  return {
    pkr: (completedOnTime / tasksWithDeadlines.length) * 100,
    total: tasksWithDeadlines.length,
    completed: completedOnTime,
    onTime: completedOnTime,
    late: tasksWithDeadlines.filter(t => t.status === 'done').length - completedOnTime,
    overdue: tasksWithDeadlines.filter(t => t.status !== 'done' && new Date(t.due_date) < new Date()).length
  };
}

function combineDateTime(date: Date, time?: string): Date {
  if (!time) return new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}
```

### Function: Calculate External PKR (Client-Facing)
```typescript
function calculateExternalPKR(tasks: Task[]): PKRMetrics {
  // Filter tasks with client promises
  const tasksWithPromises = tasks.filter(t => t.promised_date);
  
  if (tasksWithPromises.length === 0) return { pkr: 100, total: 0 }; // No promises = no risk
  
  // Count delivered on time
  const deliveredOnTime = tasksWithPromises.filter(t => {
    if (t.status !== 'done') return false;
    const promisedDateTime = combineDateTime(t.promised_date, t.promised_time);
    return t.completed_at <= promisedDateTime;
  }).length;
  
  // Count overdue to client (critical)
  const overdueToClient = tasksWithPromises.filter(t => {
    const promisedDateTime = combineDateTime(t.promised_date, t.promised_time);
    return t.status !== 'done' && promisedDateTime < new Date();
  }).length;
  
  return {
    pkr: (deliveredOnTime / tasksWithPromises.length) * 100,
    total: tasksWithPromises.length,
    onTime: deliveredOnTime,
    late: tasksWithPromises.filter(t => t.status === 'done').length - deliveredOnTime,
    overdueToClient: overdueToClient,
    riskLevel: overdueToClient > 0 ? 'critical' : 'warning'
  };
}
```

### Function: Calculate Commitment Quality Score
```typescript
function calculateCommitmentQuality(tasks: Task[]): number {
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  if (completedTasks.length === 0) return 100; // No tasks completed yet
  
  const onTimeCount = completedTasks.filter(t => {
    if (!t.due_date) return true; // No deadline = not relevant
    const dueDateTime = combineDateTime(t.due_date, t.due_time);
    return t.completed_at <= dueDateTime;
  }).length;
  
  return (onTimeCount / completedTasks.length) * 100;
}
```

---

## 5. TASK STATUS AUTO-UPDATES

### Internal Status Tracking
```typescript
function updateInternalStatus(task: Task): string {
  if (!task.due_date) return 'not_scheduled';
  
  const dueDateTime = combineDateTime(task.due_date, task.due_time);
  const now = new Date();
  const daysUntilDue = (dueDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (task.status === 'done') return 'completed';
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue < 1) return 'due_today';
  if (daysUntilDue < 3) return 'at_risk';
  return 'on_track';
}
```

### External Status Tracking
```typescript
function updateExternalStatus(task: Task): string {
  if (!task.promised_date) return 'not_promised';
  
  const promisedDateTime = combineDateTime(task.promised_date, task.promised_time);
  const now = new Date();
  const daysUntilPromise = (promisedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (task.status === 'done') return 'delivered';
  if (daysUntilPromise < 0) return 'overdue_client';
  if (daysUntilPromise < 0.5) return 'critical_client';
  if (daysUntilPromise < 2) return 'at_risk_client';
  return 'on_track';
}
```

---

## 6. DASHBOARD & REPORTING DISPLAYS

### Team Analytics - PKR Breakdown
```
User: Eren

INTERNAL COMMITMENT PERFORMANCE
├── Total Tasks: 47
├── Completed On Time: 43 (91.5% - Internal PKR)
├── Completed Late: 2 (forced to rush)
├── Overdue: 2 (missed commitments)
└── Status: ELITE ✓

CLIENT-FACING PERFORMANCE  
├── Tasks with Client Promises: 35
├── Delivered On Time: 34 (97.1% - External PKR)
├── Delivered Late: 1 (client saw delay)
├── Client Overdue: 0 (no missed promises to client)
└── Status: EXCELLENT ✓

COMMITMENT QUALITY
├── Quality Score: 95.7%
├── Interpretation: "Almost no rushed work after internal deadlines"
└── Trend: Stable (↑ 2% from last sprint)

TIMELINE SUMMARY
├── Average Buffer Time: 18 hours
├── Largest Time Jump: 2 days (due < promised)
└── Risk Assessment: LOW
```

### Individual Task Card Display
```
Task: "sihba copy design"
ID: NEW-SP2-042

┌─ INTERNAL TIMELINE ──────────────────┐
│ Due: Mar 4, 2024 at 5:00 PM         │
│ Status: COMPLETED ON TIME ✓         │
│ Completed: Mar 3, 2024 at 2:30 PM   │
│ Buffer: 28.5 hours                  │
└──────────────────────────────────────┘

┌─ CLIENT PROMISE ─────────────────────┐
│ Promised: Mar 5, 2024 at 9:00 AM    │
│ Status: DELIVERED EARLY ✓           │
│ Buffer to Promise: 1.4 days         │
└──────────────────────────────────────┘

COMMITMENT GRADE: A (On time internally & externally)
```

---

## 7. ALERT RULES & ESCALATIONS

### Internal Deadline Alerts
- **3+ days before due**: "On Track" (green)
- **1-3 days before due**: "At Risk" (yellow) - alert to task owner
- **Today or overdue**: "Critical" (red) - escalate to manager

### External Deadline Alerts
- **2+ days before promised**: "On Track" (green)
- **1-2 days before promised**: "At Risk" (yellow) - alert team + client
- **Today or overdue**: "Critical" (red) - escalate to exec + client

### PKR Score Alerts
- **90-100%**: Elite (green badge)
- **80-89%**: Good (blue badge)
- **70-79%**: Warning (yellow badge)
- **<70%**: At Risk (red badge)

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: Schema & Migration
- [ ] Add due_time, promised_date, promised_time, completed_at to tasks table
- [ ] Add internal_status, external_status computed fields
- [ ] Create indexes for performance

### Phase 2: Calculation Engine
- [ ] Implement PKR calculation functions (TypeScript)
- [ ] Create API endpoint: `/api/pkr/calculate`
- [ ] Add PKR update triggers on task status change

### Phase 3: Dashboard Display
- [ ] Update Team Analytics to show 3-layer PKR
- [ ] Add individual task promise breakdown
- [ ] Create PKR analytics charts

### Phase 4: Alerts & Automation
- [ ] Implement alert rules engine
- [ ] Add task status auto-update scheduler
- [ ] Send notifications for critical deadlines

### Phase 5: Client Communication
- [ ] Add "Promise to Client" button in task UI
- [ ] Create client-view dashboard showing promised items
- [ ] Generate delivery reports with PKR metrics

---

## 9. EXAMPLE CALCULATION

### Scenario: Sprint Week
```
USER: Eren
TASKS: 10 total

Internal Deadlines:
├── Task 1: Due Mar 2, 5 PM → Completed Mar 2, 2 PM ✓ ON TIME
├── Task 2: Due Mar 2, 5 PM → Completed Mar 3, 10 AM ✗ LATE
├── Task 3: Due Mar 3, 5 PM → Completed Mar 4, 9 AM ✗ LATE
├── Task 4: Due Mar 4, 5 PM → In Progress, currently Mar 4, 6 PM ✗ OVERDUE
├── Task 5: Due Mar 5, 5 PM → Not Started, currently Mar 4, 9 AM ✓ ON TRACK
├── Task 6-10: No deadline set

INTERNAL PKR = 1 completed on time / 5 with deadlines = 20%
⚠️ WARNING: Only 20% on-time completion

External Promises:
├── Task 1: Promised Mar 3, 9 AM ✓ DELIVERED EARLY
├── Task 2: Promised Mar 5, 5 PM ✓ DELIVERED ON TIME
├── Task 3: Promised Mar 7, 5 PM ✓ WILL DELIVER ON TIME
├── Task 4: Promised Mar 5, 5 PM ✗ OVERDUE TO CLIENT
├── Task 5: Promised Mar 8, 5 PM (pending)

EXTERNAL PKR = 3 delivered on time / 4 with promises = 75%
⚠️ WARNING: 1 task overdue to client

COMMITMENT QUALITY = 1 on time / 2 completed = 50%
⚠️ CRITICAL: All completions were rushed vs. internal deadlines
```

---

## 10. NEXT STEPS

1. **Review & Approve** this PKR framework with team
2. **Create migration script** to add new date/time fields
3. **Implement calculation functions** in TypeScript
4. **Update API endpoints** to return 3-layer PKR
5. **Build dashboard components** to display metrics
6. **Set up automation** for status tracking and alerts
