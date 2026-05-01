
-- Drop the overly broad public policy that exposes contact info
DROP POLICY IF EXISTS "Public can view verified manufacturers" ON public.manufacturers;

-- Allow authenticated users to view all columns of verified manufacturers (incl. contact info)
CREATE POLICY "Authenticated can view verified manufacturers"
ON public.manufacturers
FOR SELECT
TO authenticated
USING (is_verified = true);

-- For anonymous visitors, restrict to non-sensitive columns via column-level grants
REVOKE SELECT ON public.manufacturers FROM anon;
GRANT SELECT (
  id,
  business_name,
  description,
  website,
  specialties,
  is_verified,
  created_at,
  updated_at
) ON public.manufacturers TO anon;

-- Recreate a SELECT policy for anon limited to verified rows (column-level grants enforce field restriction)
CREATE POLICY "Anon can view verified manufacturers (limited columns)"
ON public.manufacturers
FOR SELECT
TO anon
USING (is_verified = true);
