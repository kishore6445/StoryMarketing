-- Clean up the problematic trigger and function that's causing the ambiguous column error
-- Since we're now generating task_id at the API level, we don't need the database trigger

DROP TRIGGER IF EXISTS trigger_generate_task_id ON tasks;
DROP FUNCTION IF EXISTS generate_task_id_function();
DROP TABLE IF EXISTS task_id_sequences;

-- The task_id column will remain on the tasks table and be populated by the API
