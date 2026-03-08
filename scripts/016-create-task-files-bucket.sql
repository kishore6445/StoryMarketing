-- Create storage bucket for task attachments (run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-files', 'task-files', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;
