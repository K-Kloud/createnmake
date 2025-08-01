-- Add missing dynamic pages to fix 404 issues
INSERT INTO dynamic_pages (route_path, page_title, component_name, meta_description, is_active, requires_auth, allowed_roles, layout_config) VALUES
  ('/checkout', 'Checkout', 'Checkout', 'Complete your purchase securely', true, true, ARRAY['user'], '{}'),
  ('/orders', 'My Orders', 'Orders', 'View and track your orders', true, true, ARRAY['user'], '{}'),
  ('/designs', 'My Designs', 'Designs', 'Browse and manage your AI-generated designs', true, true, ARRAY['user'], '{}'),
  ('/products', 'My Products', 'Products', 'Manage your product listings', true, true, ARRAY['user'], '{}'),
  ('/design', 'Design Studio', 'Design', 'Advanced design creation tools', true, true, ARRAY['user'], '{}'),
  ('/notifications', 'Notifications', 'Notifications', 'Stay updated with your latest notifications', true, true, ARRAY['user'], '{}'),
  ('/system-monitoring', 'System Monitoring', 'SystemMonitoring', 'Monitor system performance and health', true, true, ARRAY['admin'], '{}'),
  ('/subscription/success', 'Subscription Success', 'Success', 'Your subscription was successful', true, false, ARRAY['user'], '{}'),
  ('/subscription/cancel', 'Subscription Cancelled', 'Cancel', 'Your subscription was cancelled', true, false, ARRAY['user'], '{}')
ON CONFLICT (route_path) DO NOTHING;