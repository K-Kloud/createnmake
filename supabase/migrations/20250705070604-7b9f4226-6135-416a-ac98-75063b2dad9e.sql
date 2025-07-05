-- Phase 3: Navigation & Deep Linking Enhancement

-- Create breadcrumb configurations table
CREATE TABLE IF NOT EXISTS public.breadcrumb_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_pattern TEXT NOT NULL UNIQUE,
  custom_segments JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on breadcrumb_configs
ALTER TABLE public.breadcrumb_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for breadcrumb_configs
CREATE POLICY "Public can view active breadcrumb configs" ON public.breadcrumb_configs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage breadcrumb configs" ON public.breadcrumb_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Insert default breadcrumb configurations
INSERT INTO public.breadcrumb_configs (route_pattern, custom_segments) VALUES
  ('/marketplace', '[{"title": "Marketplace", "href": "/marketplace"}]'),
  ('/creator/*', '[{"title": "Creators", "href": "/marketplace?tab=creators"}, {"title": "Creator Profile", "href": null}]'),
  ('/image/*', '[{"title": "Marketplace", "href": "/marketplace"}, {"title": "Design", "href": null}]'),
  ('/order/*', '[{"title": "Orders", "href": "/orders"}, {"title": "Order Details", "href": null}]'),
  ('/settings', '[{"title": "Settings", "href": "/settings"}]'),
  ('/dashboard', '[{"title": "Dashboard", "href": "/dashboard"}]');

-- Create updated_at trigger for breadcrumb_configs
CREATE TRIGGER update_breadcrumb_configs_updated_at
  BEFORE UPDATE ON public.breadcrumb_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();