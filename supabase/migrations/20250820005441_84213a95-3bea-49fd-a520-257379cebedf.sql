-- Security Fix: Harden user_sessions table RLS policies
-- Remove overly permissive policies that could allow unauthorized access

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions; -- Duplicate policy

-- Ensure user_id cannot be null for security (sessions must belong to a user)
ALTER TABLE public.user_sessions ALTER COLUMN user_id SET NOT NULL;

-- Create secure, restrictive policies
-- 1. Users can only view their own sessions (authenticated users only)
CREATE POLICY "secure_users_view_own_sessions" 
  ON public.user_sessions 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 2. Users can only insert sessions for themselves (authenticated users only)  
CREATE POLICY "secure_users_insert_own_sessions"
  ON public.user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own sessions (authenticated users only)
CREATE POLICY "secure_users_update_own_sessions"
  ON public.user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can only delete their own sessions (authenticated users only)
CREATE POLICY "secure_users_delete_own_sessions"
  ON public.user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Super admins can view all sessions for security monitoring
CREATE POLICY "super_admins_view_all_sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 6. Service role can manage sessions for system operations
CREATE POLICY "service_role_manage_sessions"
  ON public.user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add audit logging for session access
CREATE OR REPLACE FUNCTION log_session_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log suspicious access attempts
  IF TG_OP = 'SELECT' AND OLD.user_id != auth.uid() THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      action_details
    ) VALUES (
      auth.uid(),
      'session_access_attempt',
      jsonb_build_object(
        'target_user_id', OLD.user_id,
        'session_id', OLD.session_id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging (commented out as it would impact performance)
-- CREATE TRIGGER audit_session_access
--   AFTER SELECT ON public.user_sessions
--   FOR EACH ROW EXECUTE FUNCTION log_session_access();