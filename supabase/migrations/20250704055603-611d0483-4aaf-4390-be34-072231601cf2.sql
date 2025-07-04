-- Add missing routes to dynamic_pages table to fix 404 errors

INSERT INTO public.dynamic_pages (route_path, page_title, component_name, meta_description, requires_auth, allowed_roles) VALUES
('/settings', 'Settings', 'Settings', 'Manage your account settings and preferences', true, ARRAY['user']),
('/faq', 'Frequently Asked Questions', 'FAQ', 'Find answers to common questions', false, ARRAY['user']),
('/features', 'Features', 'Features', 'Discover our platform features and capabilities', false, ARRAY['user']),
('/contact', 'Contact Us', 'Contact', 'Get in touch with our team', false, ARRAY['user']),
('/testimonials', 'Testimonials', 'Testimonials', 'Read what our users say about us', false, ARRAY['user']),
('/join-us', 'Join Us', 'JoinUs', 'Join our community and start creating', false, ARRAY['user']),
('/subscription', 'Subscription', 'Subscription', 'Manage your subscription and billing', true, ARRAY['user']),
('/integrations', 'Integrations', 'Integrations', 'Connect your favorite tools and services', true, ARRAY['user']),
('/notifications', 'Notifications', 'Notifications', 'View and manage your notifications', true, ARRAY['user']),
('/orders', 'Orders', 'Orders', 'Track and manage your orders', true, ARRAY['user']),
('/products', 'Products', 'Products', 'Manage your products and inventory', true, ARRAY['user']),
('/earnings', 'Earnings', 'Earnings', 'Track your earnings and financial performance', true, ARRAY['user']),
('/system-monitoring', 'System Monitoring', 'SystemMonitoring', 'Monitor system health and performance', true, ARRAY['admin']),
('/join-artisan', 'Join as Artisan', 'JoinArtisan', 'Join our platform as an artisan', false, ARRAY['user']),
('/join-manufacturer', 'Join as Manufacturer', 'JoinManufacturer', 'Join our platform as a manufacturer', false, ARRAY['user']),
('/artisan-onboarding', 'Artisan Onboarding', 'ArtisanOnboarding', 'Complete your artisan profile setup', true, ARRAY['user']),
('/manufacturer-onboarding', 'Manufacturer Onboarding', 'ManufacturerOnboarding', 'Complete your manufacturer profile setup', true, ARRAY['user'])
ON CONFLICT (route_path) DO NOTHING;