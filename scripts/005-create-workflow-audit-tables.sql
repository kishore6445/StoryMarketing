-- Workflow Audit and Monitoring Tables
-- Run this script in Supabase SQL Editor after running 003-create-workflows-tables.sql

-- Workflow audit logs (tracks all workflow actions for monitoring)
CREATE TABLE IF NOT EXISTS workflow_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity JSONB NOT NULL,
  changes JSONB NOT NULL,
  performed_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow step instances (tracks step-level execution state)
CREATE TABLE IF NOT EXISTS workflow_step_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'skipped')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  timeout_days INTEGER DEFAULT 2,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_client_id ON workflow_audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_action ON workflow_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_timestamp ON workflow_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_step_instances_workflow_instance_id ON workflow_step_instances(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_instances_status ON workflow_step_instances(status);

-- Apply updated_at trigger to workflow_step_instances
DROP TRIGGER IF EXISTS update_workflow_step_instances_updated_at ON workflow_step_instances;
CREATE TRIGGER update_workflow_step_instances_updated_at
  BEFORE UPDATE ON workflow_step_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
