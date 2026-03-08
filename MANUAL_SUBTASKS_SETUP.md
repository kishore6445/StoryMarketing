# Manual Subtasks Setup Guide

## Problem
The automated SQL execution failed, so we need to manually create the task_subtasks table in your Supabase dashboard.

## Solution: Follow these steps

### Step 1: Go to Supabase SQL Editor
1. Log in to your Supabase project
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **+ New Query** to create a new SQL query

### Step 2: Copy and Paste the SQL

Copy this SQL code into the editor:

```sql
-- Create task_subtasks table
CREATE TABLE IF NOT EXISTS task_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_index INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'done'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee_id ON task_subtasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON task_subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_by ON task_subtasks(created_by);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_status ON task_subtasks(task_id, status);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee_task ON task_subtasks(assignee_id, task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_my_tasks ON task_subtasks(assignee_id, status, due_date);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_task_subtasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_task_subtasks_updated_at ON task_subtasks;
CREATE TRIGGER trigger_update_task_subtasks_updated_at
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_subtasks_updated_at();

-- Completion tracking function
CREATE OR REPLACE FUNCTION update_subtask_completion_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    NEW.completed_at = NOW();
    NEW.completed_by = auth.uid();
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
    NEW.completed_by = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for completion tracking
DROP TRIGGER IF EXISTS trigger_update_subtask_completion_time ON task_subtasks;
CREATE TRIGGER trigger_update_subtask_completion_time
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_subtask_completion_time();

-- Helper function to check if all subtasks are complete
CREATE OR REPLACE FUNCTION are_all_subtasks_complete(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM task_subtasks 
    WHERE task_subtasks.task_id = are_all_subtasks_complete.task_id 
    AND status != 'done'
  );
END;
$$ LANGUAGE plpgsql;
```

### Step 3: Execute the Query
1. Click the **Execute** button (play icon) or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
2. Wait for the query to complete - you should see a success message

### Step 4: Enable RLS (Optional but Recommended)

If you want to add Row-Level Security for the table, run this query:

```sql
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;

-- Allow users to see subtasks they're assigned to or created
CREATE POLICY task_subtasks_select ON task_subtasks
  FOR SELECT USING (
    task_id IN (SELECT id FROM tasks WHERE assigned_to = auth.uid())
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
  );

-- Allow users to create subtasks for tasks they own
CREATE POLICY task_subtasks_insert ON task_subtasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid() 
    AND task_id IN (SELECT id FROM tasks WHERE assigned_to = auth.uid())
  );

-- Allow users to update subtasks assigned to them
CREATE POLICY task_subtasks_update ON task_subtasks
  FOR UPDATE USING (assignee_id = auth.uid() OR created_by = auth.uid());

-- Allow deletion by task owner or creator
CREATE POLICY task_subtasks_delete ON task_subtasks
  FOR DELETE USING (
    created_by = auth.uid() 
    OR task_id IN (SELECT id FROM tasks WHERE assigned_to = auth.uid())
  );
```

### Step 5: Re-enable Subtasks in Frontend

Once the table is created, uncomment the subtasks component in `/components/task-workspace-overview.tsx`:

1. Find line 6: Change `// import { TaskSubtasks }...` to `import { TaskSubtasks }...`
2. Find line 63: Uncomment the subtasks section
3. Save the file

The page will now load with the subtasks section enabled!

## Verification

To verify the table was created successfully:
1. Go to the **Tables** section in Supabase
2. Look for **task_subtasks** in the list
3. You should see all 13 columns created

## Troubleshooting

**Error: "relation 'task_subtasks' already exists"**
- The table already exists, you can safely ignore this or delete it first with `DROP TABLE task_subtasks CASCADE;`

**Error: "function 'update_task_subtasks_updated_at' already exists"**
- This is normal - we're using `CREATE OR REPLACE` which handles this

**No data appearing in subtasks component**
- Make sure you've created at least one subtask through the UI
- Check browser console for any API errors

## Next Steps

After the table is created:
1. Create a task in your app
2. Open the task detail page
3. Add subtasks from the "Subtasks" section
4. Mark subtasks as done/incomplete
5. Try moving the main task to "Review" - it will be blocked if any subtasks are incomplete
