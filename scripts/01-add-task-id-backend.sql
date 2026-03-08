-- Just ensure task_id column exists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_id VARCHAR(20);
