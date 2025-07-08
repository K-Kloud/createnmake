-- Phase 5: Real-time Features Enhancement

-- Create real-time user sessions table for enhanced presence tracking
CREATE TABLE IF NOT EXISTS public.realtime_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  presence_data JSONB DEFAULT '{}',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'online', -- online, idle, offline
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaborative documents table for real-time editing
CREATE TABLE IF NOT EXISTS public.collaborative_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- design, text, code
  content JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  owner_id UUID NOT NULL,
  collaborators JSONB DEFAULT '[]',
  permissions JSONB DEFAULT '{"read": [], "write": [], "admin": []}',
  lock_info JSONB DEFAULT NULL, -- who has locked what sections
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real-time notifications queue for priority handling
CREATE TABLE IF NOT EXISTS public.realtime_notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  priority INTEGER DEFAULT 5, -- 1 highest, 10 lowest
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  delivery_method TEXT[] DEFAULT ARRAY['in_app'], -- in_app, push, email, sms
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  status TEXT DEFAULT 'pending', -- pending, delivered, failed, cancelled
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system health monitoring table
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL, -- ms, percentage, count, bytes
  component_name TEXT NOT NULL, -- database, api, storage, functions
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  alert_threshold_exceeded BOOLEAN DEFAULT FALSE
);

-- Create real-time analytics events stream
CREATE TABLE IF NOT EXISTS public.realtime_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL, -- user_action, system_event, performance
  user_id UUID,
  session_id TEXT,
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Enable RLS on all new tables
ALTER TABLE public.realtime_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for realtime_sessions
CREATE POLICY "Users can view their own sessions" ON public.realtime_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.realtime_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.realtime_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.realtime_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for collaborative_documents
CREATE POLICY "Users can view documents they own or collaborate on" ON public.collaborative_documents
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(collaborators)
    ) OR
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(permissions->'read')
    ) OR
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(permissions->'write')
    )
  );

CREATE POLICY "Users can create documents" ON public.collaborative_documents
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update documents with write permissions" ON public.collaborative_documents
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(permissions->'write')
    ) OR
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(permissions->'admin')
    )
  );

-- RLS Policies for realtime_notification_queue
CREATE POLICY "Users can view their own notifications" ON public.realtime_notification_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.realtime_notification_queue
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage notification queue" ON public.realtime_notification_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for system_health_metrics
CREATE POLICY "Admins can manage health metrics" ON public.system_health_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for realtime_analytics_events
CREATE POLICY "Users can insert their own analytics events" ON public.realtime_analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics events" ON public.realtime_analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_realtime_sessions_user_id ON public.realtime_sessions(user_id);
CREATE INDEX idx_realtime_sessions_channel ON public.realtime_sessions(channel_name);
CREATE INDEX idx_realtime_sessions_status ON public.realtime_sessions(status);
CREATE INDEX idx_collaborative_documents_owner ON public.collaborative_documents(owner_id);
CREATE INDEX idx_collaborative_documents_type ON public.collaborative_documents(document_type);
CREATE INDEX idx_notification_queue_user_priority ON public.realtime_notification_queue(user_id, priority);
CREATE INDEX idx_notification_queue_scheduled ON public.realtime_notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_health_metrics_component ON public.system_health_metrics(component_name);
CREATE INDEX idx_health_metrics_timestamp ON public.system_health_metrics(timestamp);
CREATE INDEX idx_analytics_events_category ON public.realtime_analytics_events(event_category);
CREATE INDEX idx_analytics_events_timestamp ON public.realtime_analytics_events(timestamp);

-- Add updated_at triggers
CREATE TRIGGER update_realtime_sessions_updated_at
  BEFORE UPDATE ON public.realtime_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaborative_documents_updated_at
  BEFORE UPDATE ON public.collaborative_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborative_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_notification_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_analytics_events;

-- Set replica identity for real-time updates
ALTER TABLE public.realtime_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.collaborative_documents REPLICA IDENTITY FULL;
ALTER TABLE public.realtime_notification_queue REPLICA IDENTITY FULL;
ALTER TABLE public.system_health_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.realtime_analytics_events REPLICA IDENTITY FULL;