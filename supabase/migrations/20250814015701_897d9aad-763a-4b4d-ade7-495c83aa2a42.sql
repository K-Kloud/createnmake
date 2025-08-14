-- Fix missing columns causing database errors

-- Fix error_logs table - add missing id column reference
-- The error_logs table exists but the sequence might be misconfigured
DO $$
BEGIN
  -- Check if error_logs table needs the primary key fixed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'error_logs' 
    AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE error_logs ADD CONSTRAINT error_logs_pkey PRIMARY KEY (error_id);
  END IF;
END $$;

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

-- Fix search_path for all functions (addressing 84 warnings)
ALTER FUNCTION public.sync_image_likes_count(bigint) SET search_path = 'public';
ALTER FUNCTION public.get_user_stats(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_conversion_funnel_stats(text, timestamp with time zone, timestamp with time zone) SET search_path = 'public';
ALTER FUNCTION public.get_page_performance_stats(timestamp with time zone, timestamp with time zone) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user_lifecycle() SET search_path = 'public';
ALTER FUNCTION public.atomic_like_image(bigint, uuid) SET search_path = 'public';
ALTER FUNCTION public.maintain_image_likes_sync() SET search_path = 'public';
ALTER FUNCTION public.handle_image_engagement() SET search_path = 'public';
ALTER FUNCTION public.handle_subscription_changes() SET search_path = 'public';
ALTER FUNCTION public.get_image_metrics(bigint) SET search_path = 'public';
ALTER FUNCTION public.get_image_versions(bigint) SET search_path = 'public';
ALTER FUNCTION public.check_generation_limits() SET search_path = 'public';
ALTER FUNCTION public.maintain_user_stats() SET search_path = 'public';
ALTER FUNCTION public.cleanup_expired_api_keys() SET search_path = 'public';
ALTER FUNCTION public.check_user_milestones() SET search_path = 'public';
ALTER FUNCTION public.increment_views(bigint) SET search_path = 'public';
ALTER FUNCTION public.validate_widget_update() SET search_path = 'public';
ALTER FUNCTION public.trigger_ai_monitoring() SET search_path = 'public';
ALTER FUNCTION public.check_ai_agent_health(bigint) SET search_path = 'public';
ALTER FUNCTION public.queue_ai_agent_task(bigint, text, jsonb, integer, timestamp with time zone) SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.validate_password_strength(text) SET search_path = 'public';
ALTER FUNCTION public.handle_generated_image_storage() SET search_path = 'public';
ALTER FUNCTION public.log_generated_image_storage() SET search_path = 'public';
ALTER FUNCTION public.handle_comment_reply_notification() SET search_path = 'public';
ALTER FUNCTION public.increment_user_image_count() SET search_path = 'public';
ALTER FUNCTION public.get_safe_profile_info(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_user_public_profile(uuid) SET search_path = 'public';
ALTER FUNCTION public.analyze_user_activity(integer, integer) SET search_path = 'public';
ALTER FUNCTION public.get_public_profile_info(uuid) SET search_path = 'public';
ALTER FUNCTION public.add_admin_role(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.check_user_admin_role_secure(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.is_current_user_super_admin() SET search_path = 'public';
ALTER FUNCTION public.audit_admin_role_changes() SET search_path = 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- Update RLS policies to require authentication (fixing anonymous access warnings)
-- Only allow authenticated users for admin-related policies
DROP POLICY IF EXISTS "Admins can view all AB test events" ON ab_test_events;
CREATE POLICY "Admins can view all AB test events" ON ab_test_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

DROP POLICY IF EXISTS "Users can view their own activity metrics" ON activity_metrics;
CREATE POLICY "Users can view their own activity metrics" ON activity_metrics
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix all admin-related policies to require authentication
DROP POLICY IF EXISTS "Admins can select all admin pages" ON adminpages;
CREATE POLICY "Admins can select all admin pages" ON adminpages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

DROP POLICY IF EXISTS "Admins can manage AI agents" ON ai_agent;
CREATE POLICY "Admins can manage AI agents" ON ai_agent
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

-- Add missing triggers
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_lifecycle();

CREATE OR REPLACE TRIGGER on_image_generated
  AFTER INSERT ON generated_images
  FOR EACH ROW EXECUTE FUNCTION public.check_generation_limits();

CREATE OR REPLACE TRIGGER admin_role_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_role_changes();

CREATE OR REPLACE TRIGGER user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();