-- Create navigation_items table for dynamic navigation
CREATE TABLE public.navigation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  requires_auth BOOLEAN NOT NULL DEFAULT false,
  allowed_roles TEXT[] DEFAULT ARRAY['user'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active navigation items" 
ON public.navigation_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all navigation items" 
ON public.navigation_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_navigation_items_updated_at
BEFORE UPDATE ON public.navigation_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default navigation structure
INSERT INTO public.navigation_items (label, path, order_index, requires_auth, allowed_roles, metadata) VALUES
('Home', '/', 1, false, ARRAY['user'], '{"description": "Welcome to Create2Make"}'),
('Features', '/features', 2, false, ARRAY['user'], '{"description": "Discover our platform capabilities"}'),
('Marketplace', '/marketplace', 3, false, ARRAY['user'], '{"description": "Browse and purchase unique designs"}'),
('Create', '/create', 4, true, ARRAY['user'], '{"description": "Generate new AI designs"}'),
('Dashboard', '/dashboard', 5, true, ARRAY['user'], '{"description": "Manage your account and creations"}'),
('Testimonials', '/testimonials', 6, false, ARRAY['user'], '{"description": "What our users say about us"}'),
('FAQ', '/faq', 7, false, ARRAY['user'], '{"description": "Frequently asked questions"}'),
('Contact', '/contact', 8, false, ARRAY['user'], '{"description": "Get in touch with us"}'),
('Join Us', '/join', 9, false, ARRAY['user'], '{"description": "Explore opportunities to join our creative community"}'),
('Subscription', '/subscription', 10, false, ARRAY['user'], '{"description": "View our pricing plans"}')