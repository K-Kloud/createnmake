-- Create enterprise security tables for Phase 9 (corrected)

-- SSO Providers table
CREATE TABLE IF NOT EXISTS public.sso_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('saml', 'oidc', 'ldap')),
  status TEXT NOT NULL DEFAULT 'configuring' CHECK (status IN ('active', 'inactive', 'configuring')),
  config JSONB NOT NULL DEFAULT '{}',
  user_count INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add columns to existing security_events table if they don't exist
ALTER TABLE public.security_events 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved')),
ADD COLUMN IF NOT EXISTS affected_systems TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update existing security_events to have required columns
UPDATE public.security_events 
SET title = COALESCE(title, 'Security Event'),
    description = COALESCE(description, 'Security event detected'),
    status = COALESCE(status, 'active')
WHERE title IS NULL OR description IS NULL OR status IS NULL;

-- Make title and description NOT NULL after updating
ALTER TABLE public.security_events 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL;

-- Enhanced Admin Settings table (extend existing or create new)
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Compliance Frameworks table
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not-assessed' CHECK (status IN ('compliant', 'non-compliant', 'in-progress', 'not-assessed')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  last_assessment_at TIMESTAMP WITH TIME ZONE,
  next_assessment_at TIMESTAMP WITH TIME ZONE,
  certification_status TEXT CHECK (certification_status IN ('certified', 'expired', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance Requirements table
CREATE TABLE IF NOT EXISTS public.compliance_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'not-assessed' CHECK (status IN ('compliant', 'non-compliant', 'partial', 'not-assessed')),
  evidence TEXT[] DEFAULT '{}',
  assigned_to TEXT,
  last_review_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced User Sessions table (extend existing)
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SSO Providers (create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sso_providers' AND policyname = 'Admins can manage SSO providers') THEN
    CREATE POLICY "Admins can manage SSO providers" 
    ON public.sso_providers 
    FOR ALL 
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- RLS Policies for Security Events (create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'Admins can view all security events') THEN
    CREATE POLICY "Admins can view all security events" 
    ON public.security_events 
    FOR SELECT 
    USING (is_admin_user());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'System can insert security events') THEN
    CREATE POLICY "System can insert security events" 
    ON public.security_events 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'Admins can update security events') THEN
    CREATE POLICY "Admins can update security events" 
    ON public.security_events 
    FOR UPDATE 
    USING (is_admin_user());
  END IF;
END $$;

-- RLS Policies for Compliance Frameworks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_frameworks' AND policyname = 'Admins can manage compliance frameworks') THEN
    CREATE POLICY "Admins can manage compliance frameworks" 
    ON public.compliance_frameworks 
    FOR ALL 
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- RLS Policies for Compliance Requirements
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_requirements' AND policyname = 'Admins can manage compliance requirements') THEN
    CREATE POLICY "Admins can manage compliance requirements" 
    ON public.compliance_requirements 
    FOR ALL 
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_security_events_type_severity ON public.security_events(event_type, severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON public.security_events(status);
CREATE INDEX IF NOT EXISTS idx_sso_providers_status ON public.sso_providers(status);
CREATE INDEX IF NOT EXISTS idx_compliance_frameworks_status ON public.compliance_frameworks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_framework_id ON public.compliance_requirements(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_status ON public.compliance_requirements(status);

-- Create triggers for new tables (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sso_providers_updated_at') THEN
    CREATE TRIGGER update_sso_providers_updated_at
      BEFORE UPDATE ON public.sso_providers
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_security_events_updated_at') THEN
    CREATE TRIGGER update_security_events_updated_at
      BEFORE UPDATE ON public.security_events
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_compliance_frameworks_updated_at') THEN
    CREATE TRIGGER update_compliance_frameworks_updated_at
      BEFORE UPDATE ON public.compliance_frameworks
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_compliance_requirements_updated_at') THEN
    CREATE TRIGGER update_compliance_requirements_updated_at
      BEFORE UPDATE ON public.compliance_requirements
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;