-- Create task_subtasks table
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

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee_id ON task_subtasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON task_subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_by ON task_subtasks(created_by);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_status ON task_subtasks(task_id, status);
