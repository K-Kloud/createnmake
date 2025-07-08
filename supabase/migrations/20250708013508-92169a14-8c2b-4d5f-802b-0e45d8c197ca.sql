-- Phase 6: Advanced AI Features

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL, -- image_style, color_palette, trending_items, personalized_prompt
  recommendation_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  is_applied BOOLEAN DEFAULT FALSE,
  feedback_score INTEGER, -- 1-5 rating from user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  metadata JSONB DEFAULT '{}'
);

-- Create AI content generation history
CREATE TABLE IF NOT EXISTS public.ai_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- prompt_enhancement, style_suggestion, tag_generation
  input_data JSONB NOT NULL,
  generated_content JSONB NOT NULL,
  model_used TEXT NOT NULL,
  processing_time_ms INTEGER,
  quality_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personalization profiles
CREATE TABLE IF NOT EXISTS public.personalization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  preferred_styles TEXT[] DEFAULT '{}',
  color_preferences TEXT[] DEFAULT '{}',
  activity_patterns JSONB DEFAULT '{}',
  engagement_history JSONB DEFAULT '{}',
  learning_data JSONB DEFAULT '{}', -- ML training data
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI model configurations
CREATE TABLE IF NOT EXISTS public.ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL, -- openai, anthropic, local, custom
  configuration JSONB NOT NULL DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  cost_per_request NUMERIC(10,6) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI training data
CREATE TABLE IF NOT EXISTS public.ai_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL, -- user_preferences, image_feedback, style_patterns
  data_source TEXT NOT NULL, -- user_actions, explicit_feedback, system_analysis
  training_data JSONB NOT NULL,
  data_quality_score NUMERIC(3,2),
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create smart automation rules
CREATE TABLE IF NOT EXISTS public.smart_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- content_suggestion, style_recommendation, workflow_automation
  trigger_conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  success_rate NUMERIC(5,2) DEFAULT 0.0,
  execution_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON public.ai_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations" ON public.ai_recommendations
  FOR INSERT WITH CHECK (true);

-- RLS Policies for ai_content_history
CREATE POLICY "Users can view their own content history" ON public.ai_content_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert content history" ON public.ai_content_history
  FOR INSERT WITH CHECK (true);

-- RLS Policies for personalization_profiles
CREATE POLICY "Users can view their own profile" ON public.personalization_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.personalization_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.personalization_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_model_configs
CREATE POLICY "Admins can manage AI model configs" ON public.ai_model_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public can view active model configs" ON public.ai_model_configs
  FOR SELECT USING (is_active = true);

-- RLS Policies for ai_training_data
CREATE POLICY "Admins can manage training data" ON public.ai_training_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for smart_automation_rules
CREATE POLICY "Admins can manage automation rules" ON public.smart_automation_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public can view active automation rules" ON public.smart_automation_rules
  FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_ai_recommendations_user_type ON public.ai_recommendations(user_id, recommendation_type);
CREATE INDEX idx_ai_recommendations_expires ON public.ai_recommendations(expires_at);
CREATE INDEX idx_ai_content_history_user_type ON public.ai_content_history(user_id, content_type);
CREATE INDEX idx_ai_content_history_created ON public.ai_content_history(created_at);
CREATE INDEX idx_personalization_profiles_user ON public.personalization_profiles(user_id);
CREATE INDEX idx_ai_model_configs_active ON public.ai_model_configs(is_active);
CREATE INDEX idx_ai_training_data_processed ON public.ai_training_data(is_processed);
CREATE INDEX idx_smart_automation_rules_active ON public.smart_automation_rules(is_active);

-- Add updated_at triggers
CREATE TRIGGER update_ai_model_configs_updated_at
  BEFORE UPDATE ON public.ai_model_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personalization_profiles_updated_at
  BEFORE UPDATE ON public.personalization_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_automation_rules_updated_at
  BEFORE UPDATE ON public.smart_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for AI tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_content_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.personalization_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_automation_rules;

-- Set replica identity for real-time updates
ALTER TABLE public.ai_recommendations REPLICA IDENTITY FULL;
ALTER TABLE public.ai_content_history REPLICA IDENTITY FULL;
ALTER TABLE public.personalization_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.smart_automation_rules REPLICA IDENTITY FULL;

-- Insert default AI model configurations
INSERT INTO public.ai_model_configs (model_name, model_type, configuration, performance_metrics, cost_per_request) VALUES
('gpt-4o-mini', 'openai', 
  '{"max_tokens": 4096, "temperature": 0.7, "top_p": 1.0}',
  '{"avg_response_time_ms": 1500, "accuracy_score": 0.92}',
  0.0015),
('gpt-4o', 'openai',
  '{"max_tokens": 4096, "temperature": 0.7, "top_p": 1.0}',
  '{"avg_response_time_ms": 3000, "accuracy_score": 0.96}',
  0.03),
('claude-3-haiku', 'anthropic',
  '{"max_tokens": 4096, "temperature": 0.7}',
  '{"avg_response_time_ms": 2000, "accuracy_score": 0.94}',
  0.0025);

-- Insert default automation rules
INSERT INTO public.smart_automation_rules (rule_name, rule_type, trigger_conditions, actions) VALUES
('Style Recommendation', 'style_recommendation',
  '{"user_generates_image": true, "style_confidence": {"<": 0.7}}',
  '{"generate_style_suggestions": true, "notify_user": true}'),
('Prompt Enhancement', 'content_suggestion',
  '{"prompt_length": {"<": 10}, "user_tier": "pro"}',
  '{"enhance_prompt": true, "suggest_keywords": true}'),
('Trending Alert', 'workflow_automation',
  '{"trending_score": {">": 0.8}, "user_interested": true}',
  '{"send_notification": true, "add_to_recommendations": true}');