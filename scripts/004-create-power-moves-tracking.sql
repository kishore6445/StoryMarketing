-- Power Moves Tracking Table
CREATE TABLE IF NOT EXISTS public.power_moves_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES client_phases(id) ON DELETE CASCADE,
  power_move_text TEXT NOT NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT power_moves_tracking_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_power_moves_tracking_assigned_to ON public.power_moves_tracking(assigned_to) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_power_moves_tracking_created_by ON public.power_moves_tracking(created_by) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_power_moves_tracking_client_id ON public.power_moves_tracking(client_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_power_moves_tracking_phase_id ON public.power_moves_tracking(phase_id) TABLESPACE pg_default;
