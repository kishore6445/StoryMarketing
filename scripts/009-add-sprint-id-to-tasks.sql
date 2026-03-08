-- Add sprint_id column to tasks table to support sprint assignment
-- This allows tasks to be optionally assigned to sprints for better organization

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);

-- Add priority and phase columns if they don't exist (for consistency with sprint_tasks)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS phase VARCHAR(100);

-- Create indexes for these new columns
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase);

COMMENT ON COLUMN tasks.sprint_id IS 'Optional reference to sprint for task organization';
COMMENT ON COLUMN tasks.priority IS 'Task priority level: low, medium, high, or urgent';
COMMENT ON COLUMN tasks.phase IS 'Associated project phase (e.g., research, writing, design)';
