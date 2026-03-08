# Data Flow Architecture - Client Portal Report Card

## Overview
The Client Portal Report Card aggregates data from multiple systems to provide a comprehensive project status view to clients. Data flows from task management, content calendars, and campaign metrics.

## Data Sources & Collection Points

### 1. Task Status Metrics
**Source**: Workflow Phases & Tasks Database
**Components**: `workflow-config.ts`, Task phase tracking
**Data Points**:
- `tasksCompleted`: Count of phases with status = "completed"
- `tasksInProgress`: Count of phases with status = "in_progress"
- `tasksPending`: Count of phases with status = "pending_approval" OR "draft"
- `overallProgress`: (tasksCompleted / totalTasks) × 100

**Query Pattern**:
```sql
SELECT 
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'pending_approval' OR status = 'draft' THEN 1 END) as pending
FROM phases
WHERE client_id = ?
AND project_id = ?
```

---

### 2. Completion Rate (Weekly)
**Source**: RecordCampaignMetrics component & Campaign Metrics Database
**Components**: `record-campaign-metrics.tsx`
**Data Points**:
- `completionRate`: Percentage of tasks/content completed this week
- Tracked via metric_values in MetricRecording table

**Query Pattern**:
```sql
SELECT 
  (COUNT(CASE WHEN status = 'published' THEN 1 END) / COUNT(*)) * 100 as weekly_rate
FROM content_pieces
WHERE campaign_id IN (SELECT id FROM campaigns WHERE client_id = ?)
AND published_date >= DATE_TRUNC('week', NOW())
```

---

### 3. Next Milestone Information
**Source**: ContentCalendarEnhanced component & Content Calendar Database
**Components**: `content-calendar-enhanced.tsx`
**Data Points**:
- `nextMilestone`: Name of upcoming scheduled content/milestone
- `nextMilestoneDate`: Due date of next milestone

**Query Pattern**:
```sql
SELECT 
  content_name as milestone,
  published_date as due_date
FROM content_calendar
WHERE client_id = ?
AND published_date > NOW()
ORDER BY published_date ASC
LIMIT 1
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT PORTAL PAGE                         │
│              /app/client-portal/page.tsx                     │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────────┐    ┌───────▼──────────┐
    │ Phases Table │    │ Campaign Metrics │
    │ (Task Status)│    │   & Calendar     │
    └────┬─────────┘    └───────┬──────────┘
         │                      │
    ┌────▼──────────────────────▼──────┐
    │  ClientReportCard Component      │
    │  Receives metrics prop           │
    │  - tasksCompleted                │
    │  - tasksInProgress               │
    │  - tasksPending                  │
    │  - completionRate                │
    │  - nextMilestone                 │
    │  - overallProgress               │
    └────────┬─────────────────────────┘
             │
    ┌────────▼─────────────────────────┐
    │  Display to Client:               │
    │  • 3-stat progress cards          │
    │  • Weekly completion rate bar     │
    │  • Next milestone with due date   │
    │  • Overall progress visualization │
    └──────────────────────────────────┘
```

---

## Integration Points for Backend

### 1. **Fetch Task Metrics Endpoint**
```
GET /api/client/project/:projectId/task-metrics
Response: {
  tasksCompleted: number
  tasksInProgress: number
  tasksPending: number
  overallProgress: number
  lastUpdated: ISO string
}
```

### 2. **Fetch Campaign Metrics Endpoint**
```
GET /api/client/:clientId/campaigns/weekly-metrics
Response: {
  completionRate: number
  week: ISO string
  metrics: Record<string, number>
}
```

### 3. **Fetch Next Milestone Endpoint**
```
GET /api/client/:clientId/next-milestone
Response: {
  nextMilestone: string
  nextMilestoneDate: ISO string
  status: "on_track" | "at_risk" | "completed"
}
```

---

## Current Implementation (Mock Data)

In `/app/client-portal/page.tsx`:
```tsx
const projectMetrics = {
  tasksCompleted: 8,
  tasksInProgress: 3,
  tasksPending: 2,
  overallProgress: 65,
  completionRate: 72,
  nextMilestone: "Story Distribution Launch",
  nextMilestoneDate: "Feb 15, 2026",
}
```

**TODO**: Replace with actual API calls to fetch real data.

---

## Data Dependencies

| Metric | Depends On | Update Frequency | Owner |
|--------|-----------|-----------------|-------|
| tasksCompleted | Phases table | Real-time | Workflow Engine |
| tasksInProgress | Phases table | Real-time | Workflow Engine |
| tasksPending | Phases table | Real-time | Workflow Engine |
| completionRate | Campaign Metrics | Weekly | Campaign Manager |
| nextMilestone | Content Calendar | Daily | Content Team |
| overallProgress | Calculated | Real-time | System |

---

## Notes for Backend Implementation

1. **Performance**: Consider caching the report metrics with 1-hour TTL
2. **Authorization**: Only show metrics for client's own projects
3. **Real-time Updates**: Consider WebSocket updates for task status changes
4. **Historical Data**: Archive weekly metrics for trend analysis
5. **Aggregation**: Sum metrics across all campaigns for portfolio view
