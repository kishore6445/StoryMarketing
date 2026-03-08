-- Create a function to safely insert tasks without trigger issues
CREATE OR REPLACE FUNCTION insert_task_safe(
  p_client_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_assigned_to UUID,
  p_status TEXT,
  p_due_date TEXT,
  p_due_time TEXT,
  p_promised_date TEXT,
  p_promised_time TEXT,
  p_task_id TEXT,
  p_sprint_id UUID,
  p_priority TEXT,
  p_phase TEXT,
  p_section_id UUID DEFAULT NULL
)
RETURNS TABLE(id UUID, task_id TEXT) AS $$
BEGIN
  INSERT INTO tasks (
    client_id, title, description, assigned_to, status, 
    due_date, due_time, promised_date, promised_time, task_id,
    sprint_id, priority, phase, section_id
  ) VALUES (
    p_client_id, p_title, p_description, p_assigned_to, p_status,
    CASE WHEN p_due_date IS NOT NULL AND p_due_date != '' THEN p_due_date::date ELSE NULL END,
    p_due_time, 
    CASE WHEN p_promised_date IS NOT NULL AND p_promised_date != '' THEN p_promised_date::date ELSE NULL END,
    p_promised_time, 
    p_task_id,
    p_sprint_id, p_priority, p_phase, p_section_id
  )
  RETURNING tasks.id, tasks.task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS trigger_generate_task_id ON tasks;
DROP FUNCTION IF EXISTS generate_task_id_function();
