-- Phase 9: Continue Security Hardening - Batch 2
-- Fix remaining critical function search paths and admin-only policies

-- Fix additional functions with missing search_path
CREATE OR REPLACE FUNCTION public.audit_admin_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Log admin role changes
    INSERT INTO audit_logs (
        user_id,
        action,
        action_details
    ) VALUES (
        auth.uid(),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'admin_role_granted'
            WHEN TG_OP = 'UPDATE' THEN 'admin_role_updated'
            WHEN TG_OP = 'DELETE' THEN 'admin_role_revoked'
        END,
        jsonb_build_object(
            'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
            'role', COALESCE(NEW.role, OLD.role),
            'operation', TG_OP,
            'timestamp', now()
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix admin-only policies to require authentication
-- Update admin_roles policies
DROP POLICY IF EXISTS "Super admins can delete admin roles" ON public.admin_roles;
CREATE POLICY "Super admins can delete admin roles" 
ON public.admin_roles 
FOR DELETE 
TO authenticated
USING (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "Super admins can insert admin roles" ON public.admin_roles;
CREATE POLICY "Super admins can insert admin roles" 
ON public.admin_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "Super admins can update admin roles" ON public.admin_roles;
CREATE POLICY "Super admins can update admin roles" 
ON public.admin_roles 
FOR UPDATE 
TO authenticated
USING (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "Super admins can view all admin roles" ON public.admin_roles;
CREATE POLICY "Super admins can view all admin roles" 
ON public.admin_roles 
FOR SELECT 
TO authenticated
USING (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "Users can view their own admin role" ON public.admin_roles;
CREATE POLICY "Users can view their own admin role" 
ON public.admin_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Update adminpages policies
DROP POLICY IF EXISTS "Admins can delete admin pages" ON public.adminpages;
CREATE POLICY "Admins can delete admin pages" 
ON public.adminpages 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can insert admin pages" ON public.adminpages;
CREATE POLICY "Admins can insert admin pages" 
ON public.adminpages 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can select all admin pages" ON public.adminpages;
CREATE POLICY "Admins can select all admin pages" 
ON public.adminpages 
FOR SELECT 
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can update admin pages" ON public.adminpages;
CREATE POLICY "Admins can update admin pages" 
ON public.adminpages 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user());

-- Update AI-related policies to be admin-only with authentication
DROP POLICY IF EXISTS "Admins can manage AI agents" ON public.ai_agent;
CREATE POLICY "Admins can manage AI agents" 
ON public.ai_agent 
FOR ALL 
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage AI agent health" ON public.ai_agent_health;
CREATE POLICY "Admins can manage AI agent health" 
ON public.ai_agent_health 
FOR ALL 
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage AI agent metrics" ON public.ai_agent_metrics;
CREATE POLICY "Admins can manage AI agent metrics" 
ON public.ai_agent_metrics 
FOR ALL 
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage AI agent queue" ON public.ai_agent_queue;
CREATE POLICY "Admins can manage AI agent queue" 
ON public.ai_agent_queue 
FOR ALL 
TO authenticated
USING (public.is_admin_user());

-- Update user-specific policies to require authentication
DROP POLICY IF EXISTS "Authenticated users can view their own agent queries" ON public.ai_agent_queries;
CREATE POLICY "Authenticated users can view their own agent queries" 
ON public.ai_agent_queries 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own content history" ON public.ai_content_history;
CREATE POLICY "Users can view their own content history" 
ON public.ai_content_history 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert content history" ON public.ai_content_history;
CREATE POLICY "System can insert content history" 
ON public.ai_content_history 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Fix audit_logs policy to be more restrictive
DROP POLICY IF EXISTS "select_audit_logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR public.is_admin_user());

-- Enable password protection for leaked passwords
-- This requires admin/super admin privileges to execute
-- Create a function to enable leaked password protection
CREATE OR REPLACE FUNCTION public.enable_leaked_password_protection()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- This function should be called by super admins to enable password protection
    -- The actual setting needs to be done through Supabase Dashboard or CLI
    -- We can only log this action here
    INSERT INTO audit_logs (
        user_id,
        action,
        action_details
    ) VALUES (
        auth.uid(),
        'enable_leaked_password_protection',
        jsonb_build_object(
            'requested_at', now(),
            'requires_manual_configuration', true
        )
    );
END;
$function$;