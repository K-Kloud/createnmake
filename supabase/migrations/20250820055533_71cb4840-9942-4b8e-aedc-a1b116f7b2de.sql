-- Clean up duplicate policies from user_sessions table
-- Remove the old policies that are now redundant after security hardening

DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions; 
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view only their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;

-- Keep only the secure policies we just created:
-- secure_users_view_own_sessions
-- secure_users_insert_own_sessions  
-- secure_users_update_own_sessions
-- secure_users_delete_own_sessions
-- super_admins_view_all_sessions
-- service_role_manage_sessions