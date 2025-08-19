-- Fix user_sessions table to handle duplicate session_id constraints
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now();

-- Add index for better performance on session lookups if user_sessions has session_id column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'session_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id 
        ON user_sessions(session_id);
    END IF;
END $$;

-- Fix potential decimal to integer conversion errors in generated_images
UPDATE generated_images 
SET likes = COALESCE(ROUND(likes::numeric), 0)::integer 
WHERE likes IS NOT NULL;

UPDATE generated_images 
SET views = COALESCE(ROUND(views::numeric), 0)::integer 
WHERE views IS NOT NULL;