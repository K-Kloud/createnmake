-- Phase 10: Advanced Analytics & AI Insights Tables
-- Create comprehensive analytics and insights storage

-- AI Insights table for storing generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id bigserial PRIMARY KEY,
  insight_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  content text NOT NULL,
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  impact_level text DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
  recommendations jsonb DEFAULT '[]'::jsonb,
  data_sources jsonb DEFAULT '{}'::jsonb,
  time_range text DEFAULT '30d',
  generated_by text DEFAULT 'ai',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Advanced Analytics Metrics table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id bigserial PRIMARY KEY,
  metric_category text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  dimensions jsonb DEFAULT '{}'::jsonb,
  time_period timestamp with time zone NOT NULL,
  aggregation_type text DEFAULT 'daily' CHECK (aggregation_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  user_segment text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- User Behavior Patterns table
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  pattern_type text NOT NULL,
  pattern_data jsonb NOT NULL,
  confidence_score numeric DEFAULT 0,
  discovered_at timestamp with time zone DEFAULT now(),
  last_updated timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Predictive Analytics table
CREATE TABLE IF NOT EXISTS predictive_analytics (
  id bigserial PRIMARY KEY,
  prediction_type text NOT NULL,
  target_metric text NOT NULL,
  prediction_horizon text NOT NULL, -- '1d', '7d', '30d', etc.
  predicted_value numeric NOT NULL,
  confidence_interval jsonb, -- {lower: x, upper: y}
  actual_value numeric, -- filled when prediction period passes
  model_used text DEFAULT 'ai_agent',
  input_features jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  prediction_date timestamp with time zone NOT NULL,
  accuracy_score numeric -- calculated after actual_value is known
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_type_active ON ai_insights(insight_type, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_insights_impact ON ai_insights(impact_level, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_category_period ON analytics_metrics(metric_category, time_period);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name_period ON analytics_metrics(metric_name, time_period);
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_user ON user_behavior_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_session ON user_behavior_patterns(session_id);
CREATE INDEX IF NOT EXISTS idx_predictive_analytics_type_date ON predictive_analytics(prediction_type, prediction_date);

-- Enable RLS on all tables
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Insights (admin only)
CREATE POLICY "Admins can manage AI insights" ON ai_insights
  USING (public.check_user_admin_role_secure(auth.uid()));

-- RLS Policies for Analytics Metrics (admin only)
CREATE POLICY "Admins can view analytics metrics" ON analytics_metrics
  FOR SELECT USING (public.check_user_admin_role_secure(auth.uid()));

CREATE POLICY "System can insert analytics metrics" ON analytics_metrics
  FOR INSERT WITH CHECK (true); -- Allow system inserts

-- RLS Policies for User Behavior Patterns
CREATE POLICY "Users can view their own behavior patterns" ON user_behavior_patterns
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all behavior patterns" ON user_behavior_patterns
  FOR SELECT USING (public.check_user_admin_role_secure(auth.uid()));

CREATE POLICY "System can manage behavior patterns" ON user_behavior_patterns
  USING (true); -- Allow system operations

-- RLS Policies for Predictive Analytics (admin only)
CREATE POLICY "Admins can view predictive analytics" ON predictive_analytics
  FOR SELECT USING (public.check_user_admin_role_secure(auth.uid()));

CREATE POLICY "System can manage predictive analytics" ON predictive_analytics
  USING (true); -- Allow system operations

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_advanced_analytics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_advanced_analytics();

CREATE TRIGGER update_user_behavior_patterns_updated_at
  BEFORE UPDATE ON user_behavior_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_advanced_analytics();

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  time_range_param text DEFAULT '30d'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_date timestamp with time zone;
  result jsonb;
BEGIN
  -- Security check
  IF NOT public.check_user_admin_role_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Calculate start date
  start_date := CASE 
    WHEN time_range_param = '7d' THEN now() - interval '7 days'
    WHEN time_range_param = '30d' THEN now() - interval '30 days'
    WHEN time_range_param = '90d' THEN now() - interval '90 days'
    ELSE now() - interval '30 days'
  END;

  -- Build analytics summary
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(DISTINCT user_id) FROM page_analytics WHERE timestamp >= start_date),
    'total_sessions', (SELECT COUNT(DISTINCT session_id) FROM page_analytics WHERE timestamp >= start_date),
    'total_images_generated', (SELECT COUNT(*) FROM generated_images WHERE created_at >= start_date),
    'avg_engagement_rate', (
      SELECT COALESCE(AVG(
        CASE WHEN views > 0 THEN (likes::numeric / views::numeric) * 100 ELSE 0 END
      ), 0)
      FROM generated_images 
      WHERE created_at >= start_date
    ),
    'top_categories', (
      SELECT jsonb_agg(
        jsonb_build_object('category', item_type, 'count', cnt)
      )
      FROM (
        SELECT item_type, COUNT(*) as cnt
        FROM generated_images
        WHERE created_at >= start_date
        GROUP BY item_type
        ORDER BY cnt DESC
        LIMIT 5
      ) top_cats
    ),
    'insights_count', (SELECT COUNT(*) FROM ai_insights WHERE created_at >= start_date AND is_active = true),
    'predictions_count', (SELECT COUNT(*) FROM predictive_analytics WHERE created_at >= start_date)
  ) INTO result;

  RETURN result;
END;
$$;