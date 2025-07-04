-- Remove conflicting /admin route from dynamic_pages since it's handled by AdminRoutes
DELETE FROM dynamic_pages WHERE route_path = '/admin';

-- Update any other conflicting routes that might interfere with nested routing
-- This ensures clean separation between dynamic and nested routes