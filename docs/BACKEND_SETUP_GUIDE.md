# Backend Setup Guide: PKR Analytics & Task Management

## Overview
This document outlines the Supabase database schema extensions and PKR (Promised completion, Kept delivery, Realized results) analytics calculation methodology required for the Story Marketing OS command center.

---

## Part 1: Supabase Database Schema Extensions

### Current Tables (Reference)
- `users` - User profiles and roles
- `tasks` - Individual work items
- `sprints` - Sprint/project containers
- `clients` - Client organizations
- `assignments` - User-to-task assignments

---

### Required Schema Additions

#### 1. Enhanced `tasks` Table - New Fields

Add these columns to the existing `tasks` table:

```sql
-- Promised Date Fields
ALTER TABLE tasks ADD COLUMN promised_date DATE;
ALTER TABLE tasks ADD COLUMN promised_date_set_by UUID REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN promised_date_set_at TIMESTAMP DEFAULT now();

-- Actual Completion Fields
ALTER TABLE tasks ADD COLUMN actual_completion_date DATE;
ALTER TABLE tasks ADD COLUMN completion_verified_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN completion_verified_by UUID REFERENCES users(id);

-- Task Status Tracking (for PKR calculation)
ALTER TABLE tasks ADD COLUMN task_status VARCHAR(20) DEFAULT 'backlog'; 
  -- Values: 'backlog', 'in_progress', 'in_review', 'completed', 'cancelled', 'blocked'

-- Priority & Impact Fields
ALTER TABLE tasks ADD COLUMN impact_level VARCHAR(20) DEFAULT 'medium';
  -- Values: 'low', 'medium', 'high', 'critical'
ALTER TABLE tasks ADD COLUMN is_blocked BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN blocked_reason TEXT;
ALTER TABLE tasks ADD COLUMN blocked_by_task_id UUID REFERENCES tasks(id);

-- PKR Tracking
ALTER TABLE tasks ADD COLUMN pkr_category VARCHAR(50);
  -- Values: 'promised', 'kept', 'realized', 'missed'
ALTER TABLE tasks ADD COLUMN days_to_promised_date INT;
  -- Calculated: promised_date - created_date
ALTER TABLE tasks ADD COLUMN days_actual_vs_promised INT;
  -- Calculated: actual_completion_date - promised_date (negative = early, positive = late)
ALTER TABLE tasks ADD COLUMN pkr_score NUMERIC(3,2) DEFAULT 1.0;
  -- Range 0.0 - 1.0, calculated per task basis
```

#### 2. New `task_metrics_daily` Table - PKR Aggregation

Create this table to store daily PKR calculations (for performance and historical tracking):

```sql
CREATE TABLE task_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  
  -- Individual Level
  user_id UUID REFERENCES users(id) NOT NULL,
  user_promised_count INT DEFAULT 0,
  user_kept_count INT DEFAULT 0,
  user_realized_count INT DEFAULT 0,
  user_pkr_score NUMERIC(3,2) DEFAULT 0,
  
  -- Company Level
  company_promised_count INT DEFAULT 0,
  company_kept_count INT DEFAULT 0,
  company_realized_count INT DEFAULT 0,
  company_pkr_score NUMERIC(3,2) DEFAULT 0,
  
  -- Client Level
  client_id UUID REFERENCES clients(id),
  client_promised_count INT DEFAULT 0,
  client_kept_count INT DEFAULT 0,
  client_realized_count INT DEFAULT 0,
  client_pkr_score NUMERIC(3,2) DEFAULT 0,
  
  -- Additional Metrics
  total_on_time_completion INT DEFAULT 0,
  total_late_completion INT DEFAULT 0,
  avg_days_variance NUMERIC(5,2) DEFAULT 0,
  blocked_task_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(metric_date, user_id, COALESCE(client_id, 'null'::uuid))
);

CREATE INDEX idx_metrics_daily_user ON task_metrics_daily(user_id, metric_date DESC);
CREATE INDEX idx_metrics_daily_client ON task_metrics_daily(client_id, metric_date DESC);
CREATE INDEX idx_metrics_daily_company ON task_metrics_daily(metric_date DESC);
```

#### 3. New `pkr_snapshots` Table - Historical PKR Records

For long-term PKR tracking and trend analysis:

```sql
CREATE TABLE pkr_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  
  -- Scope
  scope_type VARCHAR(20) NOT NULL, -- 'individual', 'company', 'client'
  scope_id UUID, -- user_id for individual, client_id for client, null for company
  
  -- PKR Components
  pkr_promised INT NOT NULL,
  pkr_kept INT NOT NULL,
  pkr_realized INT NOT NULL,
  pkr_score NUMERIC(3,2) NOT NULL,
  
  -- Trend
  pkr_change_from_yesterday NUMERIC(3,2),
  
  -- Context
  total_tasks_completed INT,
  avg_completion_days NUMERIC(5,2),
  on_time_percentage NUMERIC(3,2),
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_snapshots_scope ON pkr_snapshots(scope_type, scope_id, snapshot_date DESC);
CREATE INDEX idx_snapshots_date ON pkr_snapshots(snapshot_date DESC);
```

#### 4. Updated `users` Table - New Fields

```sql
ALTER TABLE users ADD COLUMN pkr_baseline NUMERIC(3,2) DEFAULT 0.85;
  -- Target PKR for this user (typically 85-90%)
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN performance_tier VARCHAR(20) DEFAULT 'standard';
  -- Values: 'emerging', 'standard', 'excellent', 'elite'
```

#### 5. Updated `clients` Table - New Fields

```sql
ALTER TABLE clients ADD COLUMN pkr_baseline NUMERIC(3,2) DEFAULT 0.85;
  -- Expected PKR performance for this client's work
ALTER TABLE clients ADD COLUMN total_promised_tasks INT DEFAULT 0;
ALTER TABLE clients ADD COLUMN total_kept_tasks INT DEFAULT 0;
ALTER TABLE clients ADD COLUMN total_realized_tasks INT DEFAULT 0;
ALTER TABLE clients ADD COLUMN current_pkr_score NUMERIC(3,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN last_pkr_updated TIMESTAMP;
```

---

## Part 2: PKR Analytics Calculation Methodology

### PKR Definition

**PKR** measures execution reliability across three dimensions:

- **Promised (P)**: Tasks with explicit promised delivery dates
- **Kept (K)**: Promised tasks delivered on or before the promised date
- **Realized (R)**: All completed tasks (includes work without promised dates)

**PKR Score = (Kept + Realized) / (Promised + 1)** 

*(The +1 prevents division by zero)*

### Calculation Levels

#### Level 1: Individual User PKR

**Scope**: Single person's execution performance

**Query Logic**:
```sql
-- For a specific user on a specific date
SELECT 
  user_id,
  COUNT(CASE WHEN task_status = 'completed' AND promised_date IS NOT NULL THEN 1 END) as promised_count,
  COUNT(CASE WHEN task_status = 'completed' AND promised_date IS NOT NULL AND actual_completion_date <= promised_date THEN 1 END) as kept_count,
  COUNT(CASE WHEN task_status = 'completed' THEN 1 END) as realized_count,
  -- PKR Score = (kept + realized) / (promised + 1)
  (COUNT(CASE WHEN task_status = 'completed' AND actual_completion_date <= promised_date THEN 1 END) + COUNT(CASE WHEN task_status = 'completed' THEN 1 END))::NUMERIC / (COUNT(CASE WHEN promised_date IS NOT NULL THEN 1 END) + 1) as pkr_score
FROM tasks
WHERE assigned_to = $1 
  AND actual_completion_date IS NOT NULL
  AND actual_completion_date <= CURRENT_DATE
GROUP BY user_id;
```

**When to Recalculate**:
- Daily at midnight (aggregate previous day's completions)
- When a task status changes to 'completed'
- When a promised date is modified

**What's Included**:
- All tasks assigned to the user across all clients/sprints
- Tasks completed in the current calendar date or specified period
- Both on-time and late completions count toward "Realized"

**What's Excluded**:
- Cancelled tasks
- Blocked tasks (waiting on external dependency)
- Tasks without completion dates (in progress, backlog)

---

#### Level 2: Company-Wide PKR

**Scope**: Organization's overall execution performance (aggregate of all users)

**Query Logic**:
```sql
-- Company PKR across all users
SELECT 
  'company' as scope,
  COUNT(CASE WHEN task_status = 'completed' AND promised_date IS NOT NULL THEN 1 END) as company_promised_count,
  COUNT(CASE WHEN task_status = 'completed' AND promised_date IS NOT NULL AND actual_completion_date <= promised_date THEN 1 END) as company_kept_count,
  COUNT(CASE WHEN task_status = 'completed' THEN 1 END) as company_realized_count,
  (COUNT(CASE WHEN task_status = 'completed' AND actual_completion_date <= promised_date THEN 1 END) + COUNT(CASE WHEN task_status = 'completed' THEN 1 END))::NUMERIC / (COUNT(CASE WHEN promised_date IS NOT NULL THEN 1 END) + 1) as company_pkr_score
FROM tasks
WHERE task_status = 'completed'
  AND actual_completion_date IS NOT NULL
  AND actual_completion_date <= CURRENT_DATE;
```

**When to Recalculate**:
- Daily at 1 AM UTC (after individual calculations)
- When company PKR is queried for dashboard display

**What's Included**:
- ALL completed tasks across ALL users
- ALL clients
- ALL sprints

**What's Excluded**:
- Any cancelled or blocked work
- Work not yet completed

**Dashboard Display**: 
- Show current company PKR prominently (War Bar: "92%")
- Show trend vs yesterday: "(+2.1% vs yesterday)"
- Show target: "Target 90%"

---

#### Level 3: Client-Specific PKR

**Scope**: Single client's work completion performance

**Query Logic**:
```sql
-- PKR for a specific client
SELECT 
  client_id,
  COUNT(CASE WHEN task_status = 'completed' AND promised_date IS NOT NULL THEN 1 END) as client_promised_count,
  COUNT(CASE WHEN task_status = 'completed' AND promised_date IS NOT NULL AND actual_completion_date <= promised_date THEN 1 END) as client_kept_count,
  COUNT(CASE WHEN task_status = 'completed' THEN 1 END) as client_realized_count,
  (COUNT(CASE WHEN task_status = 'completed' AND actual_completion_date <= promised_date THEN 1 END) + COUNT(CASE WHEN task_status = 'completed' THEN 1 END))::NUMERIC / (COUNT(CASE WHEN promised_date IS NOT NULL THEN 1 END) + 1) as client_pkr_score
FROM tasks
WHERE client_id = $1
  AND task_status = 'completed'
  AND actual_completion_date IS NOT NULL
  AND actual_completion_date <= CURRENT_DATE
GROUP BY client_id;
```

**When to Recalculate**:
- Daily at 2 AM UTC (after company calculation)
- When client is queried in admin dashboard
- When sprint is viewed (filtered client view)

**What's Included**:
- Only tasks associated with this specific client
- All users who worked on client tasks
- All sprints containing client work

**What's Excluded**:
- Work from other clients
- Cancelled/blocked work

**Dashboard Display**:
- Client-level PKR visible in admin PKR Analytics section
- Trend comparison for client against company average
- Risk flags if client PKR drops below baseline

---

### Key Calculation Rules

#### Rule 1: Promised Date Setting
- Promised dates MUST be explicitly set (not auto-calculated)
- Set during task creation or sprint planning
- Can be updated, but only by task owner or admin
- When updated, log the change for audit

#### Rule 2: On-Time vs Late Calculation
```
If actual_completion_date <= promised_date:
  Status: "ON TIME" (counts toward Kept)
  Days Variance: negative (early by X days)
  
If actual_completion_date > promised_date:
  Status: "LATE" (counts toward Realized but NOT Kept)
  Days Variance: positive (late by X days)
```

#### Rule 3: Blocked Task Handling
```
If is_blocked = true AND blocked_reason IS NOT NULL:
  - Exclude from all PKR calculations
  - Flag in dashboard as "BLOCKED — waiting on X"
  - Don't count against user/company/client PKR
  - Remove from blocked count when status changes
```

#### Rule 4: Cancelled Task Handling
```
If task_status = 'cancelled':
  - Exclude from all PKR calculations
  - Don't count toward Promised, Kept, or Realized
  - Remove from historical PKR records
  - Mark reason for cancellation
```

#### Rule 5: Time Period Scoping
- **Daily PKR**: Tasks completed in previous calendar day (00:00 - 23:59 UTC)
- **Weekly PKR**: Tasks completed in previous full week (Monday - Sunday)
- **Monthly PKR**: Tasks completed in previous calendar month
- **Trailing 30-Day PKR**: Tasks completed in last 30 days

---

### PKR Trend Calculation

**Day-over-Day Change**:
```
Today's PKR = (Today's Kept + Today's Realized) / (Today's Promised + 1)
Yesterday's PKR = (Yesterday's Kept + Yesterday's Realized) / (Yesterday's Promised + 1)
Trend = ((Today's PKR - Yesterday's PKR) / Yesterday's PKR) * 100
Display: "+2.1%" or "-1.5%"
```

**Direction Indicator**:
- If Trend > 0: Show green ↑ arrow
- If Trend = 0: Show neutral → dash
- If Trend < 0: Show red ↓ arrow

---

### PKR Analytics Display Rules

#### War Bar (Sticky Top)
- **PKR Value**: Current company PKR score (e.g., "92%")
- **Trend**: Day-over-day change (e.g., "↑2.1%")
- **Target**: Company baseline target (e.g., "90%")
- **Override Alert**: If Overdue count > 0, show "X OVERDUE" pill in red

#### Individual User Dashboard (PKR Analytics section)
- User's personal PKR score
- Comparison to company average
- Promised tasks completed this week
- On-time percentage
- Performance tier (Emerging/Standard/Excellent/Elite)
- Trend chart (7-day, 30-day)

#### Client Detail View (Admin PKR Analytics)
- Client's current PKR score
- Promised tasks completed for this client
- On-time delivery percentage
- Variance from client baseline
- Alert if client PKR drops below 80%

#### Company Dashboard (PKR Analytics)
- Company PKR trend (7-day chart)
- Individual user rankings
- Client PKR rankings
- Team performance heatmap
- Top performers (>95%) and needs-improvement (<80%)

---

### Implementation Checklist for Developer

**Database Layer**:
- [ ] Add all new columns to `tasks` table
- [ ] Create `task_metrics_daily` table with indices
- [ ] Create `pkr_snapshots` table with indices
- [ ] Update `users` and `clients` tables
- [ ] Create RLS policies for user-level data access
- [ ] Create database views for PKR calculations (optimize queries)

**API Layer** (`/app/api/`):
- [ ] `POST /api/tasks/set-promised-date` - Set/update promised date
- [ ] `POST /api/tasks/mark-complete` - Complete task with actual date
- [ ] `GET /api/pkr/individual/:userId` - Individual PKR
- [ ] `GET /api/pkr/company` - Company-wide PKR with trend
- [ ] `GET /api/pkr/client/:clientId` - Client-specific PKR
- [ ] `GET /api/pkr/history` - PKR snapshots for charting
- [ ] `POST /api/tasks/block` - Block task with reason
- [ ] `POST /api/tasks/unblock` - Unblock task

**Scheduled Jobs** (Daily, runs via Vercel Cron or external scheduler):
- [ ] 01:00 UTC: Calculate and store daily individual metrics
- [ ] 02:00 UTC: Calculate and store company metrics
- [ ] 03:00 UTC: Calculate and store client metrics
- [ ] 04:00 UTC: Create daily snapshot records

**Frontend Layer**:
- [ ] Update War Bar to pull real PKR data (currently hardcoded 92%)
- [ ] Update trend indicator to show real day-over-day change
- [ ] Build PKR Analytics dashboard with real calculations
- [ ] Add promised date picker to task creation modal
- [ ] Show task completion date capture on mark-complete

---

## Notes for Developer

1. **Atomicity**: Ensure PKR calculations are atomic - a partially failed calculation could skew data
2. **Caching**: Cache daily PKR snapshots for 24 hours to avoid recalculating on each request
3. **Timezone**: All date comparisons should use UTC consistently
4. **Backfill**: For existing tasks without promised dates, batch-update with estimated dates based on sprint end dates
5. **Alerting**: Flag any tasks where actual_completion_date is NULL but status is 'completed' (data integrity check)
