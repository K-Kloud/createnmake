-- Create dynamic page management system
CREATE TABLE IF NOT EXISTS public.dynamic_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  component_name TEXT NOT NULL,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT false,
  allowed_roles TEXT[] DEFAULT ARRAY['user'],
  layout_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create component registry system
CREATE TABLE IF NOT EXISTS public.ui_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL UNIQUE,
  component_type TEXT NOT NULL, -- 'page', 'layout', 'widget', 'form'
  file_path TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  config_schema JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.component_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES ui_components(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  config_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create navigation management system
CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_name TEXT NOT NULL UNIQUE,
  menu_type TEXT NOT NULL, -- 'header', 'sidebar', 'footer', 'mobile'
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES navigation_menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  href TEXT,
  icon_name TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT false,
  allowed_roles TEXT[] DEFAULT ARRAY['user'],
  sort_order INTEGER DEFAULT 0,
  opens_in_new_tab BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create feature toggle system
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] DEFAULT ARRAY['user'],
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create content management system
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key TEXT NOT NULL UNIQUE,
  block_type TEXT NOT NULL, -- 'text', 'html', 'markdown', 'image', 'video'
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.page_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_name TEXT NOT NULL UNIQUE,
  layout_config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dynamic_pages_route ON dynamic_pages(route_path);
CREATE INDEX IF NOT EXISTS idx_dynamic_pages_active ON dynamic_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_ui_components_name ON ui_components(component_name);
CREATE INDEX IF NOT EXISTS idx_ui_components_type ON ui_components(component_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_sort ON menu_items(menu_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_content_blocks_key ON content_blocks(block_key);
CREATE INDEX IF NOT EXISTS idx_content_blocks_type ON content_blocks(block_type);

-- Enable RLS
ALTER TABLE public.dynamic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dynamic_pages
CREATE POLICY "Public can view active pages"
ON public.dynamic_pages
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all pages"
ON public.dynamic_pages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for ui_components
CREATE POLICY "Public can view active components"
ON public.ui_components
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all components"
ON public.ui_components
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for component_configs
CREATE POLICY "Public can view active configs"
ON public.component_configs
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all configs"
ON public.component_configs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for navigation_menus
CREATE POLICY "Public can view active menus"
ON public.navigation_menus
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all menus"
ON public.navigation_menus
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for menu_items
CREATE POLICY "Public can view active menu items"
ON public.menu_items
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all menu items"
ON public.menu_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for feature_flags
CREATE POLICY "Public can view enabled flags"
ON public.feature_flags
FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins can manage all flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for content_blocks
CREATE POLICY "Public can view active content"
ON public.content_blocks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all content"
ON public.content_blocks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for page_layouts
CREATE POLICY "Public can view all layouts"
ON public.page_layouts
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all layouts"
ON public.page_layouts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dynamic_pages_updated_at
  BEFORE UPDATE ON public.dynamic_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ui_components_updated_at
  BEFORE UPDATE ON public.ui_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_component_configs_updated_at
  BEFORE UPDATE ON public.component_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_navigation_menus_updated_at
  BEFORE UPDATE ON public.navigation_menus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_layouts_updated_at
  BEFORE UPDATE ON public.page_layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.dynamic_pages (route_path, page_title, component_name, meta_description, requires_auth, allowed_roles) VALUES
('/', 'Home', 'Index', 'Welcome to OpenTeknologies - Generate AI designs for clothing and more', false, ARRAY['user']),
('/create', 'Create Design', 'Create', 'Create AI-generated designs for your products', false, ARRAY['user']),
('/marketplace', 'Marketplace', 'Marketplace', 'Browse and purchase AI-generated designs', false, ARRAY['user']),
('/dashboard', 'Dashboard', 'Dashboard', 'Your personal dashboard', true, ARRAY['user']),
('/admin', 'Admin Panel', 'Admin', 'Administrative control panel', true, ARRAY['admin', 'super_admin']);

INSERT INTO public.ui_components (component_name, component_type, file_path, description) VALUES
('Header', 'layout', 'src/components/Header.tsx', 'Main navigation header'),
('Footer', 'layout', 'src/components/Footer.tsx', 'Site footer'),
('Hero', 'widget', 'src/components/Hero.tsx', 'Landing page hero section'),
('ImageGenerator', 'form', 'src/components/ImageGenerator.tsx', 'AI image generation form'),
('AIAgentDashboard', 'page', 'src/components/admin/AIAgentDashboard.tsx', 'AI agent monitoring dashboard');

INSERT INTO public.navigation_menus (menu_name, menu_type) VALUES
('main-header', 'header'),
('admin-sidebar', 'sidebar'),
('footer-links', 'footer'),
('mobile-menu', 'mobile');

INSERT INTO public.feature_flags (flag_name, description, is_enabled) VALUES
('ai-agent-monitoring', 'Enable AI agent monitoring features', true),
('advanced-analytics', 'Enable advanced analytics dashboard', false),
('beta-features', 'Enable beta features for testing', false);

INSERT INTO public.content_blocks (block_key, block_type, title, content) VALUES
('hero-title', 'text', 'Hero Title', '{"text": "Create Stunning AI-Generated Designs"}'),
('hero-subtitle', 'text', 'Hero Subtitle', '{"text": "Transform your ideas into beautiful designs with our AI-powered platform"}'),
('features-intro', 'markdown', 'Features Introduction', '{"markdown": "## Powerful Features\n\nDiscover what makes our platform unique"}');