-- Drop the overly permissive public profile policy
DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;

-- Add a restrictive policy for public viewing of maker profiles only
-- This restricts WHO can be viewed (only artisans/business owners)
-- Application code must still ensure sensitive columns (phone, address, first_name, 
-- last_name, hourly_rate) are not selected in public queries
CREATE POLICY "Public can view maker profiles only"
ON profiles
FOR SELECT
TO anon, authenticated
USING (
  -- Only allow viewing profiles of artisans or those with business info
  (is_artisan = true OR business_name IS NOT NULL)
);