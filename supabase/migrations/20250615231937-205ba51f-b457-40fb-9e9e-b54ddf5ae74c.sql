
-- Create comprehensive analytics tables for tracking user behavior and business metrics

-- 1. Page Navigation & User Journey Analytics
CREATE TABLE public.page_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER DEFAULT 0,
  scroll_depth_percentage INTEGER DEFAULT 0,
  exit_page BOOLEAN DEFAULT false
);

-- 2. UI Element Click Tracking
CREATE TABLE public.ui_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  element_type TEXT NOT NULL, -- button, link, menu_item, etc.
  element_id TEXT,
  element_text TEXT,
  page_path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. E-commerce Analytics
CREATE TABLE public.ecommerce_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- cart_add, cart_remove, purchase_start, purchase_complete, product_view
  product_id TEXT,
  product_name TEXT,
  product_category TEXT,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'GBP',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Performance Metrics
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- page_load, api_response, image_generation, session_duration
  metric_name TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Feature Usage Analytics
CREATE TABLE public.feature_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  feature_name TEXT NOT NULL, -- theme_toggle, language_change, search_query, etc.
  feature_category TEXT NOT NULL,
  usage_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Search Analytics
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL, -- marketplace, general, help
  results_count INTEGER DEFAULT 0,
  clicked_result_position INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Conversion Funnel Tracking
CREATE TABLE public.conversion_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  funnel_name TEXT NOT NULL, -- visitor_to_user, user_to_creator, creator_to_subscriber
  funnel_step TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  completed BOOLEAN DEFAULT true,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. A/B Testing Results
CREATE TABLE public.ab_test_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL, -- A, B, control, etc.
  event_type TEXT NOT NULL, -- exposure, conversion, goal_reached
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 9. User Session Tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL UNIQUE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  pages_visited INTEGER DEFAULT 0,
  interactions_count INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  ip_address INET,
  country TEXT,
  city TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics tables (allow users to insert their own data, admins to view all)
CREATE POLICY "Users can insert their own analytics data" ON public.page_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all page analytics" ON public.page_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own UI interactions" ON public.ui_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all UI interactions" ON public.ui_interactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own ecommerce events" ON public.ecommerce_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all ecommerce events" ON public.ecommerce_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own performance metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all performance metrics" ON public.performance_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own feature usage" ON public.feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all feature usage" ON public.feature_usage
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own search analytics" ON public.search_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all search analytics" ON public.search_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own conversion events" ON public.conversion_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all conversion events" ON public.conversion_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own AB test events" ON public.ab_test_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all AB test events" ON public.ab_test_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
  );

-- Create indexes for better query performance
CREATE INDEX idx_page_analytics_user_timestamp ON public.page_analytics (user_id, timestamp);
CREATE INDEX idx_page_analytics_session_page ON public.page_analytics (session_id, page_path);
CREATE INDEX idx_ui_interactions_user_timestamp ON public.ui_interactions (user_id, timestamp);
CREATE INDEX idx_ui_interactions_element_type ON public.ui_interactions (element_type, timestamp);
CREATE INDEX idx_ecommerce_events_user_timestamp ON public.ecommerce_events (user_id, timestamp);
CREATE INDEX idx_ecommerce_events_type ON public.ecommerce_events (event_type, timestamp);
CREATE INDEX idx_performance_metrics_type ON public.performance_metrics (metric_type, timestamp);
CREATE INDEX idx_feature_usage_feature ON public.feature_usage (feature_name, timestamp);
CREATE INDEX idx_search_analytics_query ON public.search_analytics (search_query, timestamp);
CREATE INDEX idx_conversion_events_funnel ON public.conversion_events (funnel_name, timestamp);
CREATE INDEX idx_ab_test_events_test ON public.ab_test_events (test_name, variant, timestamp);
CREATE INDEX idx_user_sessions_user ON public.user_sessions (user_id, start_time);

-- Create analytics functions for common queries
CREATE OR REPLACE FUNCTION public.get_conversion_funnel_stats(
  funnel_name_param TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
  step TEXT,
  step_order INTEGER,
  total_users BIGINT,
  conversion_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH funnel_steps AS (
    SELECT 
      ce.funnel_step,
      ce.step_order,
      COUNT(DISTINCT ce.user_id) as users
    FROM public.conversion_events ce
    WHERE ce.funnel_name = funnel_name_param
      AND ce.timestamp >= start_date
      AND ce.timestamp <= end_date
      AND ce.completed = true
    GROUP BY ce.funnel_step, ce.step_order
  ),
  step_totals AS (
    SELECT 
      fs.*,
      LAG(fs.users) OVER (ORDER BY fs.step_order) as prev_step_users
    FROM funnel_steps fs
  )
  SELECT 
    st.funnel_step::TEXT,
    st.step_order,
    st.users,
    CASE 
      WHEN st.prev_step_users IS NULL THEN 100.0
      ELSE ROUND((st.users::NUMERIC / st.prev_step_users::NUMERIC) * 100, 2)
    END as conversion_rate
  FROM step_totals st
  ORDER BY st.step_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_page_performance_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
  page_path TEXT,
  avg_load_time_ms NUMERIC,
  total_views BIGINT,
  avg_time_spent_seconds NUMERIC,
  bounce_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH page_stats AS (
    SELECT 
      pa.page_path,
      AVG(pm.duration_ms) as avg_load_time,
      COUNT(pa.id) as views,
      AVG(pa.time_spent_seconds) as avg_time_spent,
      COUNT(CASE WHEN pa.time_spent_seconds <= 10 THEN 1 END)::NUMERIC / COUNT(pa.id)::NUMERIC * 100 as bounce_rate
    FROM public.page_analytics pa
    LEFT JOIN public.performance_metrics pm ON pa.session_id = pm.session_id 
      AND pm.metric_type = 'page_load' 
      AND pm.metric_name = pa.page_path
    WHERE pa.timestamp >= start_date 
      AND pa.timestamp <= end_date
    GROUP BY pa.page_path
  )
  SELECT 
    ps.page_path::TEXT,
    ROUND(ps.avg_load_time, 2),
    ps.views,
    ROUND(ps.avg_time_spent, 2),
    ROUND(ps.bounce_rate, 2)
  FROM page_stats ps
  ORDER BY ps.views DESC;
END;
$$;
