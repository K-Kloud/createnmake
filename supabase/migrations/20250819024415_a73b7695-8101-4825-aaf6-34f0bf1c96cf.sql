-- Fix critical security vulnerability: user_sessions table is publicly readable
-- This migration restricts access so only authenticated users can view their own sessions

-- Enable RLS on user_sessions table if not already enabled
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to start fresh)
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "System can manage sessions" ON user_sessions;

-- Create secure RLS policies for user_sessions table
-- Policy 1: Users can only view their own sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own sessions (for new logins)
CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own sessions (for activity tracking)
CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: System/service role can manage all sessions (for cleanup functions)
CREATE POLICY "System can manage sessions" ON user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add audit logging for this security fix
INSERT INTO audit_logs (
  action,
  action_details
) VALUES (
  'security_fix_user_sessions',
  jsonb_build_object(
    'description', 'Fixed critical security vulnerability: restricted user_sessions access to authenticated users only',
    'issue', 'Anonymous users could read all session data including session IDs, browser info, device types, and IP addresses',
    'fix', 'Added RLS policies to ensure users can only access their own session data',
    'timestamp', NOW()
  )
);