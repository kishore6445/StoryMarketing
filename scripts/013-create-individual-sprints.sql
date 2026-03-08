-- Create individual_sprints table for monthly personal execution focus
CREATE TABLE IF NOT EXISTS individual_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- Format: "2026-03" for March 2026
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year_month)
);

-- Create individual_sprint_tasks junction table
-- Links tasks to individual sprints (allows task to be in both client sprint + personal sprint)
CREATE TABLE IF NOT EXISTS individual_sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_sprint_id UUID NOT NULL REFERENCES individual_sprints(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(individual_sprint_id, task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_individual_sprints_user_id ON individual_sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_sprints_year_month ON individual_sprints(year_month);
CREATE INDEX IF NOT EXISTS idx_individual_sprint_tasks_sprint_id ON individual_sprint_tasks(individual_sprint_id);
CREATE INDEX IF NOT EXISTS idx_individual_sprint_tasks_task_id ON individual_sprint_tasks(task_id);

-- Enable RLS on individual_sprints
ALTER TABLE individual_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_sprint_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own individual sprints
CREATE POLICY individual_sprints_user_select ON individual_sprints
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY individual_sprints_user_insert ON individual_sprints
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY individual_sprints_user_update ON individual_sprints
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

-- RLS Policy: Users can manage tasks in their own sprints
CREATE POLICY individual_sprint_tasks_select ON individual_sprint_tasks
  FOR SELECT USING (
    individual_sprint_id IN (
      SELECT id FROM individual_sprints WHERE user_id = (SELECT id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY individual_sprint_tasks_insert ON individual_sprint_tasks
  FOR INSERT WITH CHECK (
    individual_sprint_id IN (
      SELECT id FROM individual_sprints WHERE user_id = (SELECT id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY individual_sprint_tasks_delete ON individual_sprint_tasks
  FOR DELETE USING (
    individual_sprint_id IN (
      SELECT id FROM individual_sprints WHERE user_id = (SELECT id FROM users WHERE id = auth.uid())
    )
  );
