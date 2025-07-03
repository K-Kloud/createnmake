-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to run AI agent monitoring every 15 minutes
SELECT cron.schedule(
  'ai-agent-health-monitor',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://igkiffajkpfwdfxwokwg.supabase.co/functions/v1/ai-agent-monitor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2lmZmFqa3Bmd2RmeHdva3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc1NTgzMCwiZXhwIjoyMDQ5MzMxODMwfQ.0qmsiQRy7fy6CqTxZXQ2_WCw4oOILaD6TnN0wEQ3vcs"}'::jsonb,
        body:='{"scheduled": true, "source": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- Create function to manually trigger monitoring for testing
CREATE OR REPLACE FUNCTION public.trigger_ai_monitoring()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Make HTTP request to trigger AI agent monitoring
  SELECT net.http_post(
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

-- Add performance tracking tables
CREATE TABLE IF NOT EXISTS public.ai_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id BIGINT NOT NULL REFERENCES ai_agent(agent_id),
  operation_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add alert configuration table
CREATE TABLE IF NOT EXISTS public.ai_alert_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id BIGINT REFERENCES ai_agent(agent_id),
  alert_type TEXT NOT NULL, -- 'health', 'performance', 'queue'
  threshold_value NUMERIC NOT NULL,
  threshold_operator TEXT NOT NULL, -- '<', '>', '=', '!=', '<=', '>='
  notification_channels TEXT[] DEFAULT ARRAY['dashboard'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_performance_logs_agent_operation ON ai_performance_logs(agent_id, operation_type, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_alert_config_agent_type ON ai_alert_config(agent_id, alert_type);

-- RLS policies for new tables
ALTER TABLE public.ai_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_alert_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI performance logs"
ON public.ai_performance_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can manage AI alert config"
ON public.ai_alert_config
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Insert default alert configurations
INSERT INTO ai_alert_config (agent_id, alert_type, threshold_value, threshold_operator) VALUES
(1, 'health', 80, '<'),  -- Alert if success rate < 80%
(1, 'performance', 5000, '>'),  -- Alert if response time > 5000ms
(1, 'queue', 10, '>');  -- Alert if queue has > 10 pending tasks