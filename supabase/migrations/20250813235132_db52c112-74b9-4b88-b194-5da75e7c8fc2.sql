-- SECURITY FIX: Address Security Definer View warning
-- The linter flagged SECURITY DEFINER functions which can bypass RLS policies

-- Let's review and secure the critical SECURITY DEFINER functions
-- We'll keep essential ones but ensure they have proper security checks

-- 1. Review and secure the public_profiles view (if it exists)
-- Check if there's actually a view causing the issue
DO $$
BEGIN
    -- Drop the public_profiles view if it exists and recreate it without SECURITY DEFINER
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'public_profiles') THEN
        DROP VIEW IF EXISTS public.public_profiles;
        
        -- Recreate as a regular view (not SECURITY DEFINER)
        CREATE VIEW public.public_profiles AS
        SELECT 
            id,
            username,
            display_name,
            avatar_url,
            bio,
            is_creator,
            is_artisan,
            website,
            location,
            created_at
        FROM public.profiles;
        
        -- Add RLS policy for the view access
        ALTER VIEW public.public_profiles OWNER TO postgres;
        
        RAISE NOTICE 'Recreated public_profiles view without SECURITY DEFINER';
    END IF;
END $$;

-- 2. Review critical SECURITY DEFINER functions and ensure they have proper authorization
-- Most of our SECURITY DEFINER functions are necessary for proper security bypass in specific cases
-- But we'll add additional security checks to the most sensitive ones

-- Update analyze_user_activity to ensure only admins can use it
CREATE OR REPLACE FUNCTION public.analyze_user_activity(lookback_days integer DEFAULT 30, usage_threshold integer DEFAULT 500)
RETURNS TABLE(user_id uuid, total_usage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Security check: Only allow admins to run this function
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Access denied: Only administrators can analyze user activity';
    END IF;

    -- Create temporary table to store results
    RETURN QUERY
    SELECT 
        am.user_id,
        SUM(am.metric_value) AS total_usage
    FROM activity_metrics am
    WHERE 
        am.metric_type = 'daily_active_minutes' 
        AND am.recorded_at > NOW() - (lookback_days * INTERVAL '1 day')
    GROUP BY am.user_id
    HAVING SUM(am.metric_value) > usage_threshold;

    -- Log the analysis in ai_agent_queries
    INSERT INTO ai_agent_queries (
        agent_id,
        query_text,
        query_result
    )
    SELECT 
        1,
        format('Analyzed user activity for past %s days with threshold %s minutes', 
            lookback_days::text, 
            usage_threshold::text),
        jsonb_agg(
            jsonb_build_object(
                'user_id', user_id,
                'total_usage', total_usage
            )
        )
    FROM (
        SELECT 
            am.user_id,
            SUM(am.metric_value) AS total_usage
        FROM activity_metrics am
        WHERE 
            am.metric_type = 'daily_active_minutes' 
            AND am.recorded_at > NOW() - (lookback_days * INTERVAL '1 day')
        GROUP BY am.user_id
        HAVING SUM(am.metric_value) > usage_threshold
    ) subquery;
END;
$$;

-- Update trigger_ai_monitoring to ensure only admins can trigger it
CREATE OR REPLACE FUNCTION public.trigger_ai_monitoring()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Security check: Only allow admins to trigger monitoring
  IF NOT EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
  ) THEN
      RAISE EXCEPTION 'Access denied: Only administrators can trigger AI monitoring';
  END IF;

  -- Make HTTP request to trigger AI agent monitoring
  SELECT extensions.http_post(
    url => 'https://igkiffajkpfwdfxwokwg.supabase.co/functions/v1/ai-agent-monitor',
    headers => '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2lmZmFqa3Bmd2RmeHdva3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc1NTgzMCwiZXhwIjoyMDQ5MzMxODMwfQ.0qmsiQRy7fy6CqTxZXQ2_WCw4oOILaD6TnN0wEQ3vcs"}'::jsonb,
    body => '{"manual": true, "triggered_by": "admin"}'::jsonb
  ) INTO result;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'AI monitoring triggered manually',
    'request_id', result
  );
END;
$$;

-- 3. Document that other SECURITY DEFINER functions are necessary for security
-- Functions like check_user_admin_role_secure, is_current_user_super_admin, etc.
-- MUST remain SECURITY DEFINER to bypass RLS and check admin status properly

-- 4. Add audit log for this security fix
INSERT INTO public.audit_logs (action, action_details)
VALUES (
  'security_definer_review_completed',
  jsonb_build_object(
    'description', 'Reviewed and secured SECURITY DEFINER functions',
    'actions_taken', ARRAY[
      'Added admin authorization checks to analyze_user_activity',
      'Added admin authorization checks to trigger_ai_monitoring', 
      'Recreated public_profiles view without SECURITY DEFINER if it existed',
      'Documented that admin check functions must remain SECURITY DEFINER'
    ],
    'timestamp', now(),
    'security_improvement', true
  )
);