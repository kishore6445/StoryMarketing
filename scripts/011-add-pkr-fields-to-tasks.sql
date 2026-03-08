-- PKR (Promises Kept Ratio) Implementation
-- Add fields to track internal deadlines and external client promises

-- Add PKR tracking fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS due_time TIME,                             -- Internal commitment time (e.g., "17:00")
ADD COLUMN IF NOT EXISTS promised_date DATE,                        -- Client-facing due date
ADD COLUMN IF NOT EXISTS promised_time TIME,                        -- Client-facing due time (e.g., "09:00")
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,                  -- Exact completion timestamp
ADD COLUMN IF NOT EXISTS internal_status TEXT DEFAULT 'on_track',   -- 'on_track', 'at_risk', 'due_today', 'overdue', 'completed', 'not_scheduled'
ADD COLUMN IF NOT EXISTS external_status TEXT DEFAULT 'not_promised'; -- 'on_track', 'at_risk_client', 'critical_client', 'overdue_client', 'delivered', 'not_promised'

-- Add constraints for status fields
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_internal_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_internal_status_check 
  CHECK (internal_status IN ('on_track', 'at_risk', 'due_today', 'overdue', 'completed', 'not_scheduled'));

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_external_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_external_status_check 
  CHECK (external_status IN ('on_track', 'at_risk_client', 'critical_client', 'overdue_client', 'delivered', 'not_promised'));

-- Create indexes for PKR calculations and filtering
CREATE INDEX IF NOT EXISTS idx_tasks_due_date_status ON tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_promised_date_status ON tasks(promised_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_internal_status ON tasks(internal_status);
CREATE INDEX IF NOT EXISTS idx_tasks_external_status ON tasks(external_status);

-- Add comments for documentation
COMMENT ON COLUMN tasks.due_time IS 'Internal team deadline time (e.g., 17:00 for 5 PM)';
COMMENT ON COLUMN tasks.promised_date IS 'Client-facing promised delivery date';
COMMENT ON COLUMN tasks.promised_time IS 'Client-facing promised delivery time';
COMMENT ON COLUMN tasks.completed_at IS 'Exact timestamp when task was marked as done';
COMMENT ON COLUMN tasks.internal_status IS 'Internal deadline tracking status';
COMMENT ON COLUMN tasks.external_status IS 'Client promise tracking status';

-- Function to automatically update completed_at when status changes to 'done'
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update completed_at
DROP TRIGGER IF EXISTS trigger_update_task_completed_at ON tasks;
CREATE TRIGGER trigger_update_task_completed_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_completed_at();

-- Function to auto-update internal_status based on due_date and due_time
CREATE OR REPLACE FUNCTION update_task_internal_status()
RETURNS TRIGGER AS $$
DECLARE
  due_datetime TIMESTAMPTZ;
  now_time TIMESTAMPTZ;
  days_until_due NUMERIC;
BEGIN
  -- Only update if task has a due_date
  IF NEW.due_date IS NULL THEN
    NEW.internal_status = 'not_scheduled';
    RETURN NEW;
  END IF;

  -- If task is completed, mark as completed
  IF NEW.status = 'done' THEN
    NEW.internal_status = 'completed';
    RETURN NEW;
  END IF;

  -- Combine due_date and due_time into a single timestamp
  IF NEW.due_time IS NOT NULL THEN
    due_datetime = (NEW.due_date || ' ' || NEW.due_time)::TIMESTAMPTZ;
  ELSE
    due_datetime = (NEW.due_date || ' 17:00:00')::TIMESTAMPTZ; -- Default to 5 PM
  END IF;

  now_time = NOW();
  days_until_due = EXTRACT(EPOCH FROM (due_datetime - now_time)) / 86400.0;

  -- Determine status based on time remaining
  IF days_until_due < 0 THEN
    NEW.internal_status = 'overdue';
  ELSIF days_until_due < 1 THEN
    NEW.internal_status = 'due_today';
  ELSIF days_until_due < 3 THEN
    NEW.internal_status = 'at_risk';
  ELSE
    NEW.internal_status = 'on_track';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update internal_status
DROP TRIGGER IF EXISTS trigger_update_task_internal_status ON tasks;
CREATE TRIGGER trigger_update_task_internal_status
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_internal_status();

-- Function to auto-update external_status based on promised_date and promised_time
CREATE OR REPLACE FUNCTION update_task_external_status()
RETURNS TRIGGER AS $$
DECLARE
  promised_datetime TIMESTAMPTZ;
  now_time TIMESTAMPTZ;
  days_until_promise NUMERIC;
BEGIN
  -- Only update if task has a promised_date
  IF NEW.promised_date IS NULL THEN
    NEW.external_status = 'not_promised';
    RETURN NEW;
  END IF;

  -- If task is completed, mark as delivered
  IF NEW.status = 'done' THEN
    NEW.external_status = 'delivered';
    RETURN NEW;
  END IF;

  -- Combine promised_date and promised_time into a single timestamp
  IF NEW.promised_time IS NOT NULL THEN
    promised_datetime = (NEW.promised_date || ' ' || NEW.promised_time)::TIMESTAMPTZ;
  ELSE
    promised_datetime = (NEW.promised_date || ' 09:00:00')::TIMESTAMPTZ; -- Default to 9 AM
  END IF;

  now_time = NOW();
  days_until_promise = EXTRACT(EPOCH FROM (promised_datetime - now_time)) / 86400.0;

  -- Determine status based on time remaining
  IF days_until_promise < 0 THEN
    NEW.external_status = 'overdue_client';
  ELSIF days_until_promise < 0.5 THEN
    NEW.external_status = 'critical_client';
  ELSIF days_until_promise < 2 THEN
    NEW.external_status = 'at_risk_client';
  ELSE
    NEW.external_status = 'on_track';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update external_status
DROP TRIGGER IF EXISTS trigger_update_task_external_status ON tasks;
CREATE TRIGGER trigger_update_task_external_status
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_external_status();
