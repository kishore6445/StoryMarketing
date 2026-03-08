# Manual SQL Migration for Subtasks

Since the automated script execution is encountering issues, please copy and paste the following SQL directly into your **Supabase SQL Editor**:

## Step 1: Create the task_subtasks table

```sql
CREATE TABLE IF NOT EXISTS task_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  order_index INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Step 2: Create indexes for performance

```sql
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee_id ON task_subtasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON task_subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_by ON task_subtasks(created_by);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_status ON task_subtasks(task_id, status);
```

## Step 3: Create trigger function for updated_at

```sql
CREATE OR REPLACE FUNCTION update_task_subtasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Step 4: Create trigger for updated_at

```sql
DROP TRIGGER IF EXISTS trigger_update_task_subtasks_updated_at ON task_subtasks;
CREATE TRIGGER trigger_update_task_subtasks_updated_at
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_subtasks_updated_at();
```

## Step 5: Create trigger function for completion time

```sql
CREATE OR REPLACE FUNCTION update_subtask_completion_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status IS DISTINCT FROM 'done' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Step 6: Create trigger for completion time

```sql
DROP TRIGGER IF EXISTS trigger_update_subtask_completion_time ON task_subtasks;
CREATE TRIGGER trigger_update_subtask_completion_time
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_subtask_completion_time();
```

## Step 7: Enable RLS (Optional - for security)

```sql
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;

-- Users can view subtasks they're assigned to or created
CREATE POLICY task_subtasks_select ON task_subtasks
  FOR SELECT USING (
    assignee_id = auth.uid() 
    OR created_by = auth.uid()
  );

-- Users can create subtasks
CREATE POLICY task_subtasks_insert ON task_subtasks
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update subtasks assigned to them
CREATE POLICY task_subtasks_update ON task_subtasks
  FOR UPDATE USING (assignee_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (assignee_id = auth.uid() OR created_by = auth.uid());

-- Users can delete subtasks they created
CREATE POLICY task_subtasks_delete ON task_subtasks
  FOR DELETE USING (created_by = auth.uid());
```

## Instructions

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Create a **New Query**
3. Copy and paste **each SQL block above** one at a time (or all together)
4. Click **Run** 
5. Wait for confirmation that each statement executed successfully

The table will then be ready for the API and frontend components to use!
