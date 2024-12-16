CREATE OR REPLACE FUNCTION increment_views(image_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE generated_images
  SET views = COALESCE(views, 0) + 1
  WHERE id = image_id;
END;
$$;