-- Security Fix: Clean up and harden user_sessions table
-- First, clean up sessions with null user_id (these are security risks)

-- Delete sessions with null user_id as they pose security risks
DELETE FROM public.user_sessions WHERE user_id IS NULL;

-- Now make user_id NOT NULL to prevent future null sessions
ALTER TABLE public.user_sessions ALTER COLUMN user_id SET NOT NULL;

-- Drop problematic policies that allow overly broad access
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions; -- Remove duplicate

-- Create secure, restrictive policies that follow principle of least privilege

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

-- 5. Super admins can view all sessions for legitimate security monitoring
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

-- 6. Service role can manage sessions for system operations only
CREATE POLICY "service_role_manage_sessions"
  ON public.user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);