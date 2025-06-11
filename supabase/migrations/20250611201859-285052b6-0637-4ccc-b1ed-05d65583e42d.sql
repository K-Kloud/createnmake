
-- Add columns to track image editing history and versions
ALTER TABLE generated_images 
ADD COLUMN original_image_id bigint REFERENCES generated_images(id),
ADD COLUMN edit_prompt text,
ADD COLUMN edit_version integer DEFAULT 1,
ADD COLUMN mask_data text,
ADD COLUMN is_edited boolean DEFAULT false;

-- Create index for better performance when querying image versions
CREATE INDEX idx_generated_images_original_id ON generated_images(original_image_id);
CREATE INDEX idx_generated_images_edit_version ON generated_images(edit_version);

-- Add a function to get all versions of an image
CREATE OR REPLACE FUNCTION get_image_versions(image_id bigint)
RETURNS TABLE(
  id bigint,
  image_url text,
  edit_prompt text,
  edit_version integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  original_id bigint;
BEGIN
  -- Get the original image ID
  SELECT COALESCE(original_image_id, generated_images.id) 
  INTO original_id
  FROM generated_images 
  WHERE generated_images.id = get_image_versions.image_id;
  
  RETURN QUERY
  SELECT 
    gi.id,
    gi.image_url,
    gi.edit_prompt,
    gi.edit_version,
    gi.created_at
  FROM generated_images gi
  WHERE gi.original_image_id = original_id 
     OR (gi.id = original_id AND gi.original_image_id IS NULL)
  ORDER BY gi.edit_version ASC;
END;
$$;
