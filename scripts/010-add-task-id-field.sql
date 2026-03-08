-- Add task_id column to tasks table for referencing tasks by human-readable ID
-- Format: CLIENT3-SP#-### (e.g., NEW-SP2-001)

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_id TEXT UNIQUE;

-- Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_task_id ON tasks(task_id);
