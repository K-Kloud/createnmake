-- Fix missing columns and continue with critical fixes
-- Skip policies that already exist and focus on missing elements

-- Create user_sessions table if it doesn't exist (without duplicate policies)
DO $$
BEGIN
  -- Create table if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    CREATE TABLE user_sessions (
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
    
    ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own sessions" ON user_sessions
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own sessions" ON user_sessions
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "System can insert sessions" ON user_sessions
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Fix remaining RLS policies to require authentication
DROP POLICY IF EXISTS "Admins can delete admin pages" ON adminpages;
CREATE POLICY "Admins can delete admin pages" ON adminpages
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

DROP POLICY IF EXISTS "Admins can insert admin pages" ON adminpages;
CREATE POLICY "Admins can insert admin pages" ON adminpages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

DROP POLICY IF EXISTS "Admins can update admin pages" ON adminpages;
CREATE POLICY "Admins can update admin pages" ON adminpages
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

-- Fix AI agent policies
DROP POLICY IF EXISTS "Admins can manage AI agent health" ON ai_agent_health;
CREATE POLICY "Admins can manage AI agent health" ON ai_agent_health
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

DROP POLICY IF EXISTS "Admins can manage AI agent metrics" ON ai_agent_metrics;
CREATE POLICY "Admins can manage AI agent metrics" ON ai_agent_metrics
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ));

-- Add missing triggers (check if they exist first)
DO $$
BEGIN
  -- Add trigger for new users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_lifecycle();
  END IF;

  -- Add trigger for image generation limits
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_image_generated'
  ) THEN
    CREATE TRIGGER on_image_generated
      AFTER INSERT ON generated_images
      FOR EACH ROW EXECUTE FUNCTION public.check_generation_limits();
  END IF;

  -- Add trigger for admin role auditing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'admin_role_audit_trigger'
  ) THEN
    CREATE TRIGGER admin_role_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON admin_roles
      FOR EACH ROW EXECUTE FUNCTION public.audit_admin_role_changes();
  END IF;
END $$;