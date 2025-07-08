-- Phase 4: Advanced Analytics Integration

-- Create heatmap data table for user interaction tracking
CREATE TABLE IF NOT EXISTS public.heatmap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  element_selector TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- click, hover, scroll
  x_coordinate INTEGER NOT NULL,
  y_coordinate INTEGER NOT NULL,
  viewport_width INTEGER NOT NULL,
  viewport_height INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create user segments table for advanced analytics
CREATE TABLE IF NOT EXISTS public.user_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  segment_name TEXT NOT NULL,
  segment_criteria JSONB NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create analytics insights table for automated recommendations
CREATE TABLE IF NOT EXISTS public.analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL, -- trend, anomaly, recommendation
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  action_items JSONB DEFAULT '[]',
  data_source TEXT NOT NULL,
  time_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_acknowledged BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Create funnel steps table for conversion analysis
CREATE TABLE IF NOT EXISTS public.funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_name TEXT NOT NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for heatmap_data
CREATE POLICY "Admins can view all heatmap data" ON public.heatmap_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert their own heatmap data" ON public.heatmap_data
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for user_segments
CREATE POLICY "Admins can manage user segments" ON public.user_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for analytics_insights
CREATE POLICY "Admins can manage analytics insights" ON public.analytics_insights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for funnel_steps
CREATE POLICY "Admins can manage funnel steps" ON public.funnel_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public can view active funnel steps" ON public.funnel_steps
  FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_heatmap_data_page_path ON public.heatmap_data(page_path);
CREATE INDEX idx_heatmap_data_timestamp ON public.heatmap_data(timestamp);
CREATE INDEX idx_user_segments_user_id ON public.user_segments(user_id);
CREATE INDEX idx_analytics_insights_type ON public.analytics_insights(insight_type);
CREATE INDEX idx_funnel_steps_name ON public.funnel_steps(funnel_name);

-- Add updated_at trigger for funnel_steps
CREATE TRIGGER update_funnel_steps_updated_at
  BEFORE UPDATE ON public.funnel_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();