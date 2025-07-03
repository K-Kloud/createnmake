-- Create AI agent monitoring tables
CREATE TABLE IF NOT EXISTS public.ai_agent_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id BIGINT NOT NULL REFERENCES ai_agent(agent_id),
  status TEXT NOT NULL DEFAULT 'healthy', -- healthy, degraded, unhealthy, offline
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  response_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 100.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create AI agent performance metrics table
CREATE TABLE IF NOT EXISTS public.ai_agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id BIGINT NOT NULL REFERENCES ai_agent(agent_id),
  metric_type TEXT NOT NULL, -- 'api_calls', 'tokens_used', 'cost', 'latency'
  metric_value NUMERIC NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create AI agent queue system
CREATE TABLE IF NOT EXISTS public.ai_agent_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id BIGINT NOT NULL REFERENCES ai_agent(agent_id),
  task_type TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 5, -- 1-10, 1 being highest priority
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.ai_agent_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin access
CREATE POLICY "Admins can manage AI agent health"
ON public.ai_agent_health
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can manage AI agent metrics"
ON public.ai_agent_metrics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can manage AI agent queue"
ON public.ai_agent_queue
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_agent_health_agent_status ON ai_agent_health(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_metrics_agent_type ON ai_agent_metrics(agent_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_queue_status_priority ON ai_agent_queue(status, priority, scheduled_for);

-- Function to check AI agent health
CREATE OR REPLACE FUNCTION public.check_ai_agent_health(p_agent_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  health_status TEXT;
  last_task_success BOOLEAN;
  error_rate NUMERIC;
  avg_response_time NUMERIC;
  result JSONB;
BEGIN
  -- Check recent task success rate
  SELECT 
    (COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)
  INTO error_rate, avg_response_time
  FROM ai_agent_tasks 
  WHERE agent_id = p_agent_id 
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Determine health status
  IF error_rate IS NULL THEN
    health_status := 'unknown';
  ELSIF error_rate >= 95 THEN
    health_status := 'healthy';
  ELSIF error_rate >= 80 THEN
    health_status := 'degraded';
  ELSE
    health_status := 'unhealthy';
  END IF;

  -- Update or insert health record
  INSERT INTO ai_agent_health (
    agent_id, 
    status, 
    response_time_ms, 
    success_rate,
    metadata
  ) VALUES (
    p_agent_id,
    health_status,
    COALESCE(avg_response_time, 0)::INTEGER,
    COALESCE(error_rate, 0),
    jsonb_build_object(
      'checked_at', NOW(),
      'tasks_in_last_hour', (SELECT COUNT(*) FROM ai_agent_tasks WHERE agent_id = p_agent_id AND created_at > NOW() - INTERVAL '1 hour')
    )
  )
  ON CONFLICT (agent_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    response_time_ms = EXCLUDED.response_time_ms,
    success_rate = EXCLUDED.success_rate,
    last_check_at = NOW(),
    metadata = EXCLUDED.metadata;

  -- Return health summary
  SELECT jsonb_build_object(
    'agent_id', p_agent_id,
    'status', health_status,
    'success_rate', COALESCE(error_rate, 0),
    'avg_response_time_ms', COALESCE(avg_response_time, 0),
    'last_check', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to queue AI agent tasks
CREATE OR REPLACE FUNCTION public.queue_ai_agent_task(
  p_agent_id BIGINT,
  p_task_type TEXT,
  p_payload JSONB,
  p_priority INTEGER DEFAULT 5,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_id UUID;
BEGIN
  INSERT INTO ai_agent_queue (
    agent_id,
    task_type,
    priority,
    payload,
    scheduled_for
  ) VALUES (
    p_agent_id,
    p_task_type,
    p_priority,
    p_payload,
    p_scheduled_for
  )
  RETURNING id INTO task_id;

  RETURN task_id;
END;
$$;