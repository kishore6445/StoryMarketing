-- Add attachments metadata column to tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Optional helper index for querying attachment existence
CREATE INDEX IF NOT EXISTS idx_tasks_attachments_gin
ON tasks USING gin (attachments);
