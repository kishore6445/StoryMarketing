-- Create minimal task_id_sequences table for database trigger compatibility
CREATE TABLE IF NOT EXISTS task_id_sequences (
  client_id UUID NOT NULL,
  sprint_id UUID,
  next_sequence INTEGER DEFAULT 1,
  PRIMARY KEY (client_id, sprint_id)
);

-- Enable RLS and allow all operations
ALTER TABLE task_id_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON task_id_sequences
  FOR ALL USING (true) WITH CHECK (true);
