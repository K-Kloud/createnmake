-- Add remaining missing dynamic pages for role-specific routes
INSERT INTO dynamic_pages (route_path, page_title, component_name, meta_description, is_active, requires_auth, allowed_roles, layout_config) VALUES
  ('/advanced-ai', 'Advanced AI Tools', 'SystemMonitoring', 'Advanced AI monitoring and analytics', true, true, ARRAY['admin', 'super_admin'], '{}'),
  ('/realtime-dashboard', 'Realtime Dashboard', 'SystemMonitoring', 'Real-time system monitoring dashboard', true, true, ARRAY['admin', 'super_admin'], '{}'),
  ('/artisan', 'Artisan Dashboard', 'Artisan', 'Artisan workspace and tools', true, true, ARRAY['artisan'], '{}'),
  ('/manufacturer', 'Manufacturer Dashboard', 'Manufacturer', 'Manufacturer workspace and tools', true, true, ARRAY['manufacturer'], '{}'),
  ('/creator-dashboard', 'Creator Dashboard', 'CreatorDashboardPage', 'Creator workspace and analytics', true, true, ARRAY['creator'], '{}'),
  ('/creator-onboarding', 'Creator Onboarding', 'CreatorOnboardingPage', 'Get started as a creator', true, true, ARRAY['user'], '{}')
ON CONFLICT (route_path) DO NOTHING;