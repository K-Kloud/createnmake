-- Add missing pages to dynamic_pages
INSERT INTO public.dynamic_pages (route_path, component_name, page_title, is_active, requires_auth, meta_description)
VALUES 
  ('/about', 'About', 'About Us', true, false, 'Learn about Openteknologies and our mission to connect creators with artisans'),
  ('/support', 'Support', 'Support Center', true, false, 'Get help and support for your Openteknologies account'),
  ('/documentation', 'Documentation', 'Documentation', true, false, 'API documentation and developer guides'),
  ('/workflow-demo', 'WorkflowDemo', 'Workflow Demo', true, false, 'Explore workflow templates and demos'),
  ('/preferences', 'PreferencesPage', 'Preferences', true, true, 'Manage your preferences and settings'),
  ('/recommendations', 'RecommendationsPage', 'Recommendations', true, true, 'Personalized recommendations based on your activity')
ON CONFLICT (route_path) DO UPDATE SET
  component_name = EXCLUDED.component_name,
  page_title = EXCLUDED.page_title,
  is_active = EXCLUDED.is_active,
  requires_auth = EXCLUDED.requires_auth,
  meta_description = EXCLUDED.meta_description;