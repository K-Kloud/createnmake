-- Add missing cart page to dynamic pages
INSERT INTO dynamic_pages (
  route_path,
  page_title,
  component_name,
  meta_description,
  is_active,
  requires_auth,
  allowed_roles,
  layout_config
) VALUES (
  '/cart',
  'Shopping Cart',
  'Cart',
  'View and manage items in your shopping cart',
  true,
  false,
  ARRAY['user'],
  '{}'::jsonb
);