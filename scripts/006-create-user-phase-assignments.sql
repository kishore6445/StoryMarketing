-- User Phase Assignments Table
CREATE TABLE IF NOT EXISTS user_phase_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(user_id, client_id, phase_id)
);

CREATE INDEX idx_user_phase_assignments_user ON user_phase_assignments(user_id);
CREATE INDEX idx_user_phase_assignments_client ON user_phase_assignments(client_id);
CREATE INDEX idx_user_phase_assignments_phase ON user_phase_assignments(phase_id);
