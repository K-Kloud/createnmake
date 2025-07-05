-- Phase 2: Content Management Migration (Fixed)

-- Create content templates table
CREATE TABLE IF NOT EXISTS public.content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_schema JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content versions table for versioning
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_block_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content publishing workflow table
CREATE TABLE IF NOT EXISTS public.content_publishing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_block_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_publishing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_templates
CREATE POLICY "Public can view active templates" ON public.content_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.content_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for content_versions
CREATE POLICY "Public can view content versions" ON public.content_versions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage content versions" ON public.content_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for content_publishing
CREATE POLICY "Public can view published content" ON public.content_publishing
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage content publishing" ON public.content_publishing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Add foreign key constraints
ALTER TABLE public.content_versions 
  ADD CONSTRAINT fk_content_versions_block 
  FOREIGN KEY (content_block_id) REFERENCES public.content_blocks(id) ON DELETE CASCADE;

ALTER TABLE public.content_publishing 
  ADD CONSTRAINT fk_content_publishing_block 
  FOREIGN KEY (content_block_id) REFERENCES public.content_blocks(id) ON DELETE CASCADE;

-- Create updated_at triggers
CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON public.content_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_publishing_updated_at
  BEFORE UPDATE ON public.content_publishing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content templates
INSERT INTO public.content_templates (template_name, template_schema, description) VALUES
  ('hero_banner', '{"type": "object", "properties": {"heading": {"type": "string"}, "subheading": {"type": "string"}, "cta": {"type": "object", "properties": {"text": {"type": "string"}, "url": {"type": "string"}}}}}', 'Hero banner template'),
  ('feature_grid', '{"type": "object", "properties": {"columns": {"type": "number"}, "items": {"type": "array", "items": {"type": "object", "properties": {"title": {"type": "string"}, "description": {"type": "string"}, "image": {"type": "string"}}}}}}', 'Feature grid template'),
  ('text_block', '{"type": "object", "properties": {"html": {"type": "string"}, "text": {"type": "string"}}}', 'Simple text content block'),
  ('image_gallery', '{"type": "object", "properties": {"images": {"type": "array", "items": {"type": "object", "properties": {"url": {"type": "string"}, "alt": {"type": "string"}, "caption": {"type": "string"}}}}}}', 'Image gallery template');

-- Migrate existing static content to content blocks
INSERT INTO public.content_blocks (block_key, block_type, title, content, metadata) VALUES
  ('faq_section', 'card', 'Frequently Asked Questions', 
   '{"description": "Common questions about our platform", "features": ["AI-powered image generation", "Commercial usage rights", "Multiple image styles", "Credit-based system"]}',
   '{"migrated_from": "static", "source_page": "/faq"}'
  );