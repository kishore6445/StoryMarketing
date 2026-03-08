-- Recreate the minimal task_id_sequences table that the database trigger expects
CREATE TABLE IF NOT EXISTS task_id_sequences (
  client_id UUID NOT NULL,
  sprint_id UUID,
  next_sequence INTEGER DEFAULT 1,
  PRIMARY KEY (client_id, sprint_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_task_id_sequences_lookup 
ON task_id_sequences(client_id, sprint_id);
