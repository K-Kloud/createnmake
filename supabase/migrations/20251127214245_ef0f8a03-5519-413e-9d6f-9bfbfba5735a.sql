-- Fix marketplace_metrics deletion by updating RLS policies
-- Allow users to delete metrics for images they own

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Users can delete metrics for their own images" ON marketplace_metrics;

-- Create new DELETE policy that checks image ownership
CREATE POLICY "Users can delete metrics for their own images"
ON marketplace_metrics
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM generated_images
    WHERE generated_images.id = marketplace_metrics.image_id
    AND generated_images.user_id = auth.uid()
  )
);

-- Also ensure SELECT policy exists for verification
DROP POLICY IF EXISTS "Users can view metrics for their own images" ON marketplace_metrics;

CREATE POLICY "Users can view metrics for their own images"
ON marketplace_metrics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM generated_images
    WHERE generated_images.id = marketplace_metrics.image_id
    AND generated_images.user_id = auth.uid()
  )
);

-- Add comment explaining the policies
COMMENT ON TABLE marketplace_metrics IS 'Metrics for marketplace images. Users can only delete/view metrics for images they own.';