-- Drop the problematic trigger that's causing ambiguous column reference error
DROP TRIGGER IF EXISTS trigger_generate_task_id ON tasks CASCADE;

-- Drop the function it references
DROP FUNCTION IF EXISTS generate_task_id_function() CASCADE;
