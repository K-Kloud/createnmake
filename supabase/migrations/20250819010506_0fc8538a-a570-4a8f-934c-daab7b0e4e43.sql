-- Create security events table for monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_address TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security events (only admins can read, system can insert)
CREATE POLICY "Admins can view all security events" 
ON public.security_events 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON public.security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);

-- Update existing policies to restrict anonymous access
-- First, let's create a function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT auth.uid() IS NOT NULL;
$$;

-- Update RLS policies to require authentication
-- Update activity_metrics policies
DROP POLICY IF EXISTS "Users can view their own activity metrics" ON public.activity_metrics;
CREATE POLICY "Authenticated users can view their own activity metrics" 
ON public.activity_metrics 
FOR SELECT 
USING (auth.uid() = user_id AND is_authenticated());

-- Update admin_roles policies to be more restrictive
DROP POLICY IF EXISTS "Enable read access for admins" ON public.admin_roles;
DROP POLICY IF EXISTS "Kenny O" ON public.admin_roles;

-- Update ai_agent_queries policy
DROP POLICY IF EXISTS "Users can view their own agent queries" ON public.ai_agent_queries;
CREATE POLICY "Authenticated users can view their own agent queries" 
ON public.ai_agent_queries 
FOR SELECT 
USING (auth.uid() = user_id AND is_authenticated());

-- Add security function to validate admin operations
CREATE OR REPLACE FUNCTION public.validate_admin_operation(operation_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    recent_actions INTEGER;
BEGIN
    -- Check if user is authenticated
    IF NOT is_authenticated() THEN
        RETURN FALSE;
    END IF;
    
    -- Get user role
    SELECT role INTO user_role 
    FROM public.admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    LIMIT 1;
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Rate limiting: check recent actions
    SELECT COUNT(*) INTO recent_actions
    FROM public.audit_logs
    WHERE user_id = auth.uid()
    AND action_time > NOW() - INTERVAL '1 minute'
    AND action LIKE 'admin_%';
    
    IF recent_actions > 10 THEN
        -- Log rate limit violation
        INSERT INTO public.security_events (event_type, user_id, details, severity)
        VALUES ('admin_rate_limit_exceeded', auth.uid(), 
                jsonb_build_object('operation', operation_type, 'recent_actions', recent_actions),
                'high');
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create function to sanitize input data
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remove potential XSS and injection patterns
    input_text := regexp_replace(input_text, '<[^>]*>', '', 'g');
    input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
    input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
    input_text := regexp_replace(input_text, 'data:text/html', '', 'gi');
    
    -- Limit length to prevent DoS
    IF length(input_text) > 10000 THEN
        input_text := left(input_text, 10000);
    END IF;
    
    RETURN trim(input_text);
END;
$$;

-- Create trigger to validate and sanitize data on insert/update
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_content()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Sanitize text fields in content_blocks
    IF TG_TABLE_NAME = 'content_blocks' THEN
        NEW.title := public.sanitize_text_input(NEW.title);
        
        -- Validate JSON content structure
        IF NOT (NEW.content ? 'data' AND jsonb_typeof(NEW.content->'data') = 'object') THEN
            RAISE EXCEPTION 'Invalid content structure';
        END IF;
    END IF;
    
    -- Rate limiting for content creation
    IF TG_OP = 'INSERT' THEN
        PERFORM public.validate_admin_operation('content_creation');
    END IF;
    
    RETURN NEW;
END;
$$;