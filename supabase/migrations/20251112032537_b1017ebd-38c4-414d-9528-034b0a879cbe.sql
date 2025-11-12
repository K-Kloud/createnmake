-- SECURITY FIX: Prevent unauthorized access to private images through public collections
-- Addresses MISSING_RLS_PROTECTION finding for collection_images table

-- Drop the existing vulnerable policy
DROP POLICY IF EXISTS "Users can view collection images they own" ON public.collection_images;

-- Create secure policy that verifies BOTH collection access AND individual image permissions
CREATE POLICY "Users can view collection images with proper permissions"
ON public.collection_images FOR SELECT
TO authenticated
USING (
  -- User must have access to the collection (either owns it or it's public)
  EXISTS (
    SELECT 1 FROM public.image_collections ic
    WHERE ic.id = collection_id 
    AND (ic.user_id = auth.uid() OR ic.is_public = true)
  )
  AND
  -- AND user must have access to the individual image (either owns it or it's public)
  EXISTS (
    SELECT 1 FROM public.generated_images gi
    WHERE gi.id = image_id
    AND (gi.user_id = auth.uid() OR gi.is_public = true)
  )
);

-- Update the INSERT policy to prevent adding private images to public collections
-- This prevents the vulnerability at the source
DROP POLICY IF EXISTS "Users can add images to their collections" ON public.collection_images;

CREATE POLICY "Users can add images to their own collections"
ON public.collection_images FOR INSERT
TO authenticated
WITH CHECK (
  -- User must own the collection
  EXISTS (
    SELECT 1 FROM public.image_collections ic
    WHERE ic.id = collection_id 
    AND ic.user_id = auth.uid()
  )
  AND
  -- User must own the image (can't add others' private images to collections)
  EXISTS (
    SELECT 1 FROM public.generated_images gi
    WHERE gi.id = image_id
    AND gi.user_id = auth.uid()
  )
);

-- Log the security fix
INSERT INTO audit_logs (action, action_details)
VALUES (
  'security_fix_collection_images_rls',
  jsonb_build_object(
    'description', 'Fixed RLS policies on collection_images to prevent private image exposure',
    'timestamp', now(),
    'vulnerability_fixed', 'Private images can no longer be accessed through public collections',
    'policies_updated', ARRAY[
      'Users can view collection images with proper permissions - now checks both collection AND image permissions',
      'Users can add images to their own collections - prevents adding private images from other users'
    ],
    'security_improvement', true
  )
);