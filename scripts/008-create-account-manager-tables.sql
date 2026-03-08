-- Account Manager Tables for Sprint Planning and Management
-- Run this script manually in your Supabase SQL Editor

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sprint_tasks table
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  phase VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sprints_client_id ON sprints(client_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_client_id ON sprint_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_status ON sprint_tasks(status);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_assigned_to ON sprint_tasks(assigned_to);

-- Create updated_at trigger for sprints
CREATE OR REPLACE FUNCTION update_sprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sprints_updated_at_trigger
BEFORE UPDATE ON sprints
FOR EACH ROW
EXECUTE FUNCTION update_sprints_updated_at();

-- Create updated_at trigger for sprint_tasks
CREATE OR REPLACE FUNCTION update_sprint_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sprint_tasks_updated_at_trigger
BEFORE UPDATE ON sprint_tasks
FOR EACH ROW
EXECUTE FUNCTION update_sprint_tasks_updated_at();

-- Insert sample data for demo purposes (optional - remove if not needed)
-- This assumes you have clients and users in your database

-- Sample sprint (you'll need to replace client_id with an actual client ID)
-- INSERT INTO sprints (client_id, name, start_date, end_date, status)
-- SELECT id, 'Sprint 1 - Q1 Launch', '2024-01-15', '2024-02-05', 'active'
-- FROM clients LIMIT 1;

-- Sample tasks (you'll need to replace sprint_id and client_id)
-- INSERT INTO sprint_tasks (sprint_id, client_id, title, status, priority, phase)
-- SELECT s.id, s.client_id, 'Complete brand research', 'done', 'high', 'research'
-- FROM sprints s LIMIT 1;

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sprints for their team's clients
CREATE POLICY "Users can view sprints" ON sprints
  FOR SELECT
  USING (true);  -- Adjust based on your auth requirements

-- Policy: Users can create sprints
CREATE POLICY "Users can create sprints" ON sprints
  FOR INSERT
  WITH CHECK (true);  -- Adjust based on your auth requirements

-- Policy: Users can update sprints
CREATE POLICY "Users can update sprints" ON sprints
  FOR UPDATE
  USING (true);  -- Adjust based on your auth requirements

-- Policy: Users can delete sprints
CREATE POLICY "Users can delete sprints" ON sprints
  FOR DELETE
  USING (true);  -- Adjust based on your auth requirements

-- Policy: Users can view sprint tasks
CREATE POLICY "Users can view sprint_tasks" ON sprint_tasks
  FOR SELECT
  USING (true);  -- Adjust based on your auth requirements

-- Policy: Users can create sprint tasks
CREATE POLICY "Users can create sprint_tasks" ON sprint_tasks
  FOR INSERT
  WITH CHECK (true);  -- Adjust based on your auth requirements

-- Policy: Users can update sprint tasks
CREATE POLICY "Users can update sprint_tasks" ON sprint_tasks
  FOR UPDATE
  USING (true);  -- Adjust based on your auth requirements

-- Policy: Users can delete sprint tasks
CREATE POLICY "Users can delete sprint_tasks" ON sprint_tasks
  FOR DELETE
  USING (true);  -- Adjust based on your auth requirements

COMMENT ON TABLE sprints IS 'Stores sprint planning cycles for clients';
COMMENT ON TABLE sprint_tasks IS 'Stores tasks within each sprint';
