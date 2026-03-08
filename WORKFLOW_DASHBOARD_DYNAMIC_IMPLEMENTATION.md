# Workflow Dashboard Dynamic Implementation

## Overview
The Workflow Dashboard component has been fully converted to use dynamic data fetching with proper caching mechanisms. All data is now fetched from the API instead of using mock/static data.

## Changes Made

### 1. New API Endpoints Created

#### `/app/api/workflows/stats/route.ts`
- **Purpose**: Fetch workflow statistics dynamically
- **Returns**: 
  - Total actions count
  - Tasks completed
  - Approvals awaiting approval
  - Phases in review
  - Blocked tasks
  - Activity in last 24 hours
  - Overdue approvals
  - Escalated approvals
- **Caching**: Data is fetched from database with proper query optimization

#### `/app/api/workflows/pending-approvals/route.ts`
- **Purpose**: Fetch pending approvals with timeout calculations
- **Returns**: 
  - List of pending approvals
  - Days overdue/until escalation
  - Task names and submitters
  - Escalation status flags
- **Features**: 
  - Automatic calculation of overdue status
  - Escalation threshold detection
  - Timeout tracking

#### `/app/api/workflows/audit-logs/route.ts`
- **Purpose**: Fetch workflow audit logs with filtering
- **Features**:
  - Filter by client ID
  - Filter by action type
  - Configurable limit (default 50 records)
  - Sorted by timestamp (descending)
- **Optimization**: Indexed queries for fast retrieval

### 2. Component Updates

#### `/components/workflow-dashboard.tsx`
**Major Changes:**
- Removed all mock/static data
- Implemented SWR for data fetching with caching
- Added proper loading states
- Added error handling states
- All sections now fetch dynamically:
  - Stats cards
  - Pending approvals
  - Audit logs
  - State machine information

**SWR Configuration:**
```typescript
{
  refreshInterval: 30000,      // Auto-refresh every 30 seconds
  revalidateOnFocus: true,     // Refresh when tab gains focus
  dedupingInterval: 10000,     // Dedupe identical requests within 10s
}
```

**Loading State:**
- Displays skeleton loaders for stats cards
- Maintains UI structure during loading
- Professional loading animations

**Error State:**
- User-friendly error messages
- Retry capability
- Maintains page structure

### 3. Database Schema Updates

#### `/scripts/003-create-workflows-tables.sql`
**New Tables:**

1. `workflow_audit_logs`
   - Tracks all workflow actions
   - Stores entity changes
   - Metadata support
   - Indexed for performance

2. `workflow_step_instances`
   - Tracks step-level execution
   - Status tracking
   - Assignment tracking
   - Timeout tracking

**New Indexes:**
- `idx_workflow_audit_logs_client_id`
- `idx_workflow_audit_logs_action`
- `idx_workflow_audit_logs_timestamp`
- `idx_workflow_step_instances_workflow_instance_id`
- `idx_workflow_step_instances_status`

## Features

### Real-time Updates
- Data refreshes automatically every 30 seconds
- Manual refresh on tab focus
- Filter changes trigger immediate re-fetch

### Smart Caching
- Deduplicates identical requests within 10 seconds
- Reduces server load
- Improves user experience with instant cached data

### Performance Optimizations
- Indexed database queries
- Limited result sets
- Efficient SQL queries
- Client-side caching with SWR

### Dynamic Filtering
- Filter audit logs by action type
- Real-time filter application
- Maintains filter state across refreshes

## Benefits

1. **No More Mock Data**: All data is real and from the database
2. **Automatic Updates**: Dashboard stays fresh without manual refreshes
3. **Reduced Server Load**: Smart caching prevents unnecessary API calls
4. **Better UX**: Loading and error states provide clear feedback
5. **Scalable**: Can handle large amounts of workflow data efficiently
6. **Maintainable**: Separation of concerns between API and UI

## API Response Formats

### Stats Response
```json
{
  "stats": {
    "totalActions": 0,
    "tasksCompleted": 0,
    "approvalsAwaitingApproval": 0,
    "phasesInReview": 0,
    "blockedTasks": 0,
    "activityLast24h": 0,
    "overdueApprovals": 0,
    "escalatedApprovals": 0
  }
}
```

### Pending Approvals Response
```json
{
  "approvals": [
    {
      "id": "uuid",
      "taskName": "Task Name",
      "submittedBy": "User Name",
      "submittedAt": "2024-01-01T00:00:00Z",
      "daysOverdue": 0,
      "isOverdue": false,
      "isEscalating": false,
      "daysUntilEscalation": 1,
      "ownerRole": "manager",
      "entityType": "task",
      "entityId": "uuid"
    }
  ]
}
```

### Audit Logs Response
```json
{
  "logs": [
    {
      "id": "uuid",
      "action": "task_completed",
      "entity": {
        "type": "task",
        "name": "Task Name"
      },
      "changes": {
        "from": { "status": "in_progress" },
        "to": { "status": "completed" }
      },
      "performedBy": "User Name",
      "timestamp": "2024-01-01T00:00:00Z",
      "metadata": {}
    }
  ]
}
```

## Usage

The Workflow Dashboard now automatically handles all data fetching. Simply use it as before:

```tsx
<WorkflowDashboard clientId={selectedClientId} />
```

The component will:
1. Fetch all required data on mount
2. Show loading states while fetching
3. Display data when ready
4. Auto-refresh every 30 seconds
5. Handle errors gracefully
6. Update when filters change

## Future Enhancements

Potential improvements:
- WebSocket support for real-time updates
- Export audit logs functionality
- Advanced filtering options
- Date range selection for logs
- Pagination for large datasets
- Custom refresh intervals
- Downloadable reports
