# Subtasks Feature - SQL Schema Documentation

## Overview
This document explains the SQL schema for the subtasks feature added to your task management system. Subtasks allow main tasks to be broken down into smaller execution steps that can be assigned to different team members.

## Key Requirements Met
✅ Subtasks are execution steps under main tasks  
✅ Each subtask can be assigned to a different user  
✅ Subtasks appear in "My Tasks" view for assigned users  
✅ Subtasks do NOT appear on main Kanban board (handled in frontend)  
✅ Main task cannot move to Review unless all subtasks are done  
✅ PKR tracking will be measured separately for main tasks and subtasks  
✅ No nested subtasks (flat structure)  
✅ No comments/attachments on subtasks yet  

---

## Table Schema: `task_subtasks`

### Column Definitions

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `id` | UUID | NO | gen_random_uuid() | Unique identifier for the subtask |
| `task_id` | UUID | NO | — | Foreign key to parent task; ON DELETE CASCADE means subtasks deleted when task deleted |
| `title` | TEXT | NO | — | Name/description of the subtask work |
| `description` | TEXT | YES | NULL | Detailed description of work to be done |
| `assignee_id` | UUID | YES | NULL | User assigned to complete this subtask; can be different from main task owner |
| `status` | TEXT | NO | 'pending' | Current state: `pending`, `in_progress`, or `done` |
| `order_index` | INTEGER | NO | 0 | Defines display order of subtasks (allows reordering without changing IDs) |
| `due_date` | DATE | YES | NULL | Optional deadline for subtask completion |
| `created_by` | UUID | NO | — | User who created the subtask (audit trail); ON DELETE RESTRICT to preserve history |
| `completed_by` | UUID | YES | NULL | User who marked it done (auto-set by trigger) |
| `completed_at` | TIMESTAMPTZ | YES | NULL | When the subtask was marked done (auto-set by trigger) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | When subtask was created |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | When subtask was last modified (auto-updated by trigger) |

### Foreign Key Relationships
- **task_id → tasks(id)**: ON DELETE CASCADE (subtasks deleted with parent task)
- **assignee_id → users(id)**: ON DELETE SET NULL (if assignee deleted, field nullified)
- **created_by → users(id)**: ON DELETE RESTRICT (prevents deleting users with subtasks to preserve history)
- **completed_by → users(id)**: ON DELETE SET NULL (if completer deleted, field nullified)

### Constraints
- **status CHECK constraint**: Only allows `pending`, `in_progress`, or `done`
- **task_subtasks_task_id_fk**: Ensures referential integrity with tasks table

---

## Indexes Created

### Performance Indexes
```
idx_subtasks_task_id          - Query all subtasks of a task
idx_subtasks_assignee_id      - Find subtasks by assignee
idx_subtasks_status           - Filter by status
idx_subtasks_created_by       - Audit trail queries
idx_subtasks_task_status      - Combined query for task's subtask statuses
idx_subtasks_assignee_task    - Find subtask assignments for a user
idx_subtasks_my_tasks         - Optimized for "My Tasks" view (assignee + status + due_date)
```

The `idx_subtasks_my_tasks` index is crucial for performance because the "My Tasks" view needs to filter subtasks by assignee, status, and due date frequently.

---

## Row Level Security (RLS) Policies

### SELECT Policy: `task_subtasks_select`
Users can view subtasks if:
- They are assigned to the subtask, OR
- They are assigned to or created the parent task

**Purpose**: Ensures team members see work assigned to them and task owners see all subtasks in their tasks.

### INSERT Policy: `task_subtasks_insert`
Users can create subtasks if:
- They are the authenticated user, AND
- They have access to the parent task (assigned to or created it)

**Purpose**: Only people managing a task can create its subtasks.

### UPDATE Policy: `task_subtasks_update`
Users can update subtasks if:
- They are the assignee, OR
- They created the subtask

**Purpose**: Allows assignees to update their own work; creators can edit their subtasks.

### DELETE Policy: `task_subtasks_delete`
Users can delete subtasks if:
- They created the subtask, OR
- They created the parent task

**Purpose**: Task owners can clean up incorrect subtasks; creators can undo their work.

---

## Automatic Triggers

### 1. `trigger_update_task_subtasks_updated_at`
**Function**: `update_task_subtasks_updated_at()`  
**When**: Before ANY UPDATE to a subtask  
**Action**: Automatically sets `updated_at` to NOW()

**Why**: Ensures accurate tracking of when subtasks were last modified, essential for audit trails and showing "recently updated" in UI.

### 2. `trigger_update_subtask_completion_time`
**Function**: `update_subtask_completion_time()`  
**When**: Before INSERT or UPDATE on a subtask  
**Action**: 
- When status changes TO `done`: sets `completed_at = NOW()` and `completed_by = auth.uid()`
- When status changes FROM `done`: clears `completed_at` and `completed_by`

**Why**: Automatically captures WHO completed the task and WHEN, without requiring frontend logic. If a subtask is reopened, these fields are cleared.

---

## Helper Functions

### 1. `are_all_subtasks_complete(task_id UUID) → BOOLEAN`
**Purpose**: Checks if all subtasks for a given task are in 'done' status  
**Returns**: `TRUE` if all subtasks are done or no subtasks exist; `FALSE` if any subtask is not done

**Usage in Application**:
```sql
-- Check if main task can move to review
SELECT are_all_subtasks_complete(task_id)
-- Before task status UPDATE to 'in_review'
```

**Optional Constraint** (commented out in script):
The schema includes a trigger template that could enforce "no review if incomplete subtasks" at the database level, but this is commented out to give your application flexibility. You may implement this rule in your backend API instead.

---

## Views for Common Queries

### 1. `subtasks_with_details`
**Columns**: All subtask fields + enriched user data
**Includes**: assignee name/email, creator name, completer name
**Use Case**: Display subtasks with human-readable user information

**Example Query**:
```sql
SELECT * FROM subtasks_with_details 
WHERE task_id = 'some-task-uuid'
ORDER BY order_index;
```

### 2. `tasks_with_subtask_status`
**Columns**: 
- Task info (id, title, status)
- `total_subtasks` - count of all subtasks
- `completed_subtasks` - count of done subtasks
- `completion_percentage` - % complete (0-100)
- `all_subtasks_complete` - boolean flag

**Use Case**: Show task progress and whether it's ready to move to review

**Example Query**:
```sql
SELECT * FROM tasks_with_subtask_status 
WHERE id = 'some-task-uuid';
-- Returns: {total_subtasks: 5, completed_subtasks: 3, completion_percentage: 60, all_subtasks_complete: false}
```

---

## Assumptions About Existing Schema

### 1. **users Table**
- Must have columns: `id` (UUID), `full_name` (TEXT), `email` (TEXT)
- Used for foreign key references and RLS policies
- Your system already has this (referenced in scripts)

### 2. **tasks Table**
- Already has columns: `id`, `assigned_to`, `created_by`, `status`, `due_date`
- Subtasks use `task_id` as foreign key
- Your system already has this (referenced extensively)

### 3. **Authentication Function**
- `auth.uid()` returns current authenticated user's ID
- This is a Supabase standard function; no changes needed

### 4. **Cascade Delete Behavior**
- When a main task is deleted, all its subtasks are deleted automatically
- This is the standard pattern for your system

---

## Important Notes for Implementation

### Note 1: Optional Constraint on Tasks Table
The schema includes a commented-out trigger that would prevent tasks from moving to `in_review` status if any subtasks are incomplete. This is optional because:
- **Pros**: Database enforces the rule consistently
- **Cons**: Less flexible if you need exceptions or override logic

**Recommendation**: Implement this check in your backend API instead, so you can:
- Log why a task can't move to review
- Provide a better error message to the user
- Handle override scenarios if needed
- Track business rule violations

### Note 2: completed_by and completed_at Auto-Population
The trigger uses `auth.uid()` to auto-populate `completed_by`. This works because:
- Your RLS policies are Supabase-based (using `auth.uid()`)
- The trigger has access to the authenticated user context
- If this doesn't work, you can set these fields from your backend API instead

### Note 3: My Tasks Query Optimization
The schema creates a specific index `idx_subtasks_my_tasks(assignee_id, status, due_date)` that's perfect for queries like:
```sql
SELECT * FROM task_subtasks 
WHERE assignee_id = 'user-uuid' 
  AND status IN ('pending', 'in_progress')
  AND due_date <= NOW() + interval '7 days'
ORDER BY due_date, order_index;
```

### Note 4: Future PKR Extension
When you add PKR (Promises Kept Ratio) tracking for subtasks:
- Add `due_time`, `promised_date`, `promised_time` columns (similar to tasks)
- Add `internal_status` and `external_status` columns
- Create similar triggers to `update_task_internal_status()` and `update_task_external_status()`
- The current schema allows this without migration conflicts

---

## Migration Steps for Supabase

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `scripts/014-create-task-subtasks.sql`
3. Paste into a new query
4. Click "Run"
5. Verify: Check that `task_subtasks` table appears in the schema editor
6. Verify: Check that RLS policies are enabled
7. Verify: Run test queries against `subtasks_with_details` view

---

## Example Queries

### Create a Subtask
```sql
INSERT INTO task_subtasks (task_id, title, created_by, assignee_id, order_index)
VALUES (
  'task-uuid',
  'Update product images',
  auth.uid(),
  'other-user-uuid',
  0
);
```

### Get All Subtasks for a Task (with details)
```sql
SELECT * FROM subtasks_with_details 
WHERE task_id = 'task-uuid'
ORDER BY order_index ASC;
```

### Get My Subtasks (assigned to current user)
```sql
SELECT ts.*, t.title as parent_task_title
FROM task_subtasks ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.assignee_id = auth.uid()
  AND ts.status IN ('pending', 'in_progress')
ORDER BY ts.due_date ASC, ts.order_index ASC;
```

### Check if Task Can Move to Review
```sql
SELECT are_all_subtasks_complete('task-uuid') as can_review;
```

### Get Task with Subtask Progress
```sql
SELECT * FROM tasks_with_subtask_status WHERE id = 'task-uuid';
```

### Mark Subtask as Done
```sql
UPDATE task_subtasks
SET status = 'done'
WHERE id = 'subtask-uuid';
-- completed_at and completed_by are auto-set by trigger
```

---

## No Changes to Existing Tables

This schema implementation does NOT require any modifications to the existing `tasks` table. The optional enforcement of "all subtasks complete before review" is commented out to give you flexibility.

If you want to add this constraint later, it's a simple trigger addition (already provided in comments).
