# PKR (Promises Kept Ratio) System Guide

## Overview

The PKR system tracks how well your team delivers on promises made to clients. It automatically calculates whether tasks are completed on time based on promised deadlines vs. actual completion times.

## How PKR Works

### Task Deadlines

Every task has two types of deadlines:

1. **Internal Deadline** (`due_date` + `due_time`)
   - Your team's target completion time
   - Used for internal planning and alerts
   - Not visible to clients by default

2. **Promised Deadline** (`promised_date` + `promised_time`)
   - The date/time you committed to the client
   - Used for PKR calculation
   - Client-facing deadline

### PKR Calculation

PKR is calculated as:

```
PKR = (Tasks Completed On Time / Total Completed Tasks) × 100
```

A task is considered "completed on time" if:
- It's marked as done/completed
- `completed_at` timestamp ≤ `promised_date` + `promised_time`

### Task Status Indicators

#### For In-Progress Tasks:

- **🟢 On Track** - More than 24 hours until promised deadline
- **🟡 At Risk** - Less than 24 hours until promised deadline
- **🔴 Delayed** - Past the promised deadline

#### For Completed Tasks:

- **✅ Completed On Time** - Finished before or at promised deadline
- **⚠️ Completed Late** - Finished after promised deadline (shows days late)

## Using the PKR System

### Creating Tasks with PKR

When creating a task in the UI:

```tsx
<TaskModalWithPKR
  isOpen={isOpen}
  onClose={onClose}
  onSave={handleSave}
  clientId={clientId}
  sprintId={sprintId}
/>
```

Fields to fill:
- **Title** - Task name (required)
- **Description** - Task details
- **Assigned To** - Team member
- **Internal Due Date** - Your team's deadline
- **Internal Due Time** - Specific time (optional)
- **Promised Date** - Client-facing deadline (optional)
- **Promised Time** - Client-facing time (optional)
- **Priority** - High/Medium/Low

### Displaying PKR Indicators

#### Individual Task Indicator

```tsx
import { PKRIndicatorBadge } from '@/components/pkr-indicator-badge'

<PKRIndicatorBadge 
  pkr={task.pkr} 
  size="md"
  showLabel={true}
/>
```

#### PKR Score Badge

```tsx
import { PKRScoreBadge } from '@/components/pkr-indicator-badge'

<PKRScoreBadge score={85.5} size="lg" />
```

#### Full PKR Metrics Display

```tsx
import { PKRMetricsDisplay } from '@/components/pkr-metrics-display'

<PKRMetricsDisplay tasks={tasks} sprintId={currentSprint} />
```

### Using the PKR Hook

```tsx
import { usePKR } from '@/hooks/use-pkr'

function MyComponent({ tasks }) {
  const { tasksWithPKR, metrics, loading, refreshPKR } = usePKR(tasks)

  if (loading) return <div>Calculating PKR...</div>

  return (
    <div>
      <h2>Overall PKR: {metrics?.overallPKR.toFixed(1)}%</h2>
      <p>Completed on time: {metrics?.onTimeTasks} / {metrics?.completedTasks}</p>
      
      {tasksWithPKR.map(task => (
        <div key={task.id}>
          {task.title} - <PKRIndicatorBadge pkr={task.pkr} />
        </div>
      ))}
    </div>
  )
}
```

## API Endpoints

### Calculate PKR

```typescript
POST /api/pkr/calculate
Body: {
  taskIds?: string[]  // Optional: specific tasks
  sprintId?: string   // Optional: all tasks in sprint
  userId?: string     // Optional: all tasks for user
}

Response: {
  tasks: TaskWithPKR[]
  metrics: PKRMetrics
}
```

### Task CRUD with PKR

Tasks API now supports PKR fields:

```typescript
POST /api/tasks
Body: {
  clientId: string
  title: string
  description?: string
  dueDate?: string
  dueTime?: string
  promisedDate?: string  // NEW
  promisedTime?: string  // NEW
  ...
}
```

## Database Schema

### New Columns in `tasks` table:

```sql
-- Time-specific fields
due_time TEXT                    -- HH:MM format
promised_date DATE               -- Client-facing deadline date
promised_time TEXT               -- Client-facing deadline time (HH:MM)
completed_at TIMESTAMPTZ         -- Actual completion timestamp

-- Status tracking
internal_status TEXT             -- For team visibility
external_status TEXT             -- For client visibility

-- Automatic triggers set these on status change
```

### Indexes for Performance:

```sql
-- Fast PKR queries
CREATE INDEX idx_tasks_pkr_calculation 
ON tasks(status, promised_date, completed_at);

-- Sprint-level PKR
CREATE INDEX idx_tasks_sprint_pkr 
ON tasks(sprint_id, status, completed_at);
```

## Best Practices

### 1. Always Set Promised Dates for Client Work

If you promise a deadline to a client, enter it in `promised_date`:

```tsx
// ✅ Good
promisedDate: "2024-02-28"
promisedTime: "17:00"

// ❌ Bad - no promised date means no PKR tracking
promisedDate: undefined
```

### 2. Use Internal Deadlines for Planning

Set `due_date` earlier than `promised_date` for buffer:

```tsx
dueDate: "2024-02-27"      // Team target
promisedDate: "2024-02-28" // Client promise
```

### 3. Mark Tasks Complete Promptly

PKR accuracy depends on timely status updates:

```tsx
// When work is done, immediately:
status: "done"
// This auto-sets completed_at via trigger
```

### 4. Monitor PKR Trends

Check PKR regularly:
- **Team Level**: Overall performance
- **Sprint Level**: Current work quality
- **Individual Level**: Personal accountability

### 5. Use PKR in Retrospectives

Review PKR metrics in sprint retrospectives:
- What caused late completions?
- Were promised dates realistic?
- How can we improve estimates?

## Interpreting PKR Scores

| PKR Score | Meaning | Action |
|-----------|---------|--------|
| 90-100% | Excellent | Maintain standards |
| 75-89% | Good | Minor improvements needed |
| 60-74% | Fair | Review estimation process |
| 50-59% | Poor | Investigate root causes |
| <50% | Critical | Immediate intervention required |

## Troubleshooting

### PKR Not Calculating

1. Check task has `promised_date` set
2. Verify task status is a completion state ('done', 'completed')
3. Ensure `completed_at` timestamp exists

### Incorrect PKR Status

1. Verify system timezone matches your location
2. Check `promised_time` format (must be HH:MM)
3. Refresh PKR calculation: `refreshPKR()`

### Performance Issues

For large datasets:
- Use pagination: `limit` query param
- Filter by sprint: `sprintId` param
- Cache results client-side with SWR

## Future Enhancements

- [ ] PKR alerts when tasks approach deadlines
- [ ] Predictive PKR based on velocity
- [ ] Client-facing PKR dashboard
- [ ] Automated status updates via integrations
- [ ] PKR-based team leaderboards
- [ ] Historical PKR trends and forecasting
