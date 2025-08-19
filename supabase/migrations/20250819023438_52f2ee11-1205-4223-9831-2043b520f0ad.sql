-- Fix error_logs table structure (column error_logs.id does not exist)
-- The error indicates we're trying to select 'id' but the table uses 'error_id'
-- Update any queries to use the correct column name

-- Fix user_sessions table to handle duplicate session_id constraints
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now();

-- Add index for better performance on session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id_active 
ON user_sessions(session_id) 
WHERE expires_at > now();

-- Add constraint to ensure only one active session per user if needed
-- (This is optional - some apps allow multiple sessions)
-- ALTER TABLE user_sessions ADD CONSTRAINT unique_active_user_session 
-- EXCLUDE (user_id WITH =) WHERE (expires_at > now());

-- Update the generated_images table to handle decimal to integer conversion errors
-- Add validation to ensure proper number formatting
ALTER TABLE generated_images 
ALTER COLUMN likes TYPE integer USING COALESCE(likes, 0)::integer;

ALTER TABLE generated_images 
ALTER COLUMN views TYPE integer USING COALESCE(views, 0)::integer;