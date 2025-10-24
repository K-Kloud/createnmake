-- Add cover image and auto-counting to collections
ALTER TABLE image_collections 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0;

-- Initialize image_count for existing collections
UPDATE image_collections
SET image_count = (
  SELECT COUNT(*)
  FROM collection_images
  WHERE collection_images.collection_id = image_collections.id
)
WHERE image_count = 0;

-- Create function to auto-update image_count
CREATE OR REPLACE FUNCTION update_collection_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE image_collections 
    SET image_count = image_count + 1 
    WHERE id = NEW.collection_id;
    
    -- Auto-set cover image if collection has none
    UPDATE image_collections
    SET cover_image_url = (
      SELECT gi.image_url 
      FROM collection_images ci
      JOIN generated_images gi ON gi.id = ci.image_id
      WHERE ci.collection_id = NEW.collection_id
      LIMIT 1
    )
    WHERE id = NEW.collection_id AND cover_image_url IS NULL;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE image_collections 
    SET image_count = GREATEST(image_count - 1, 0)
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to maintain image count
DROP TRIGGER IF EXISTS update_collection_count ON collection_images;
CREATE TRIGGER update_collection_count
AFTER INSERT OR DELETE ON collection_images
FOR EACH ROW EXECUTE FUNCTION update_collection_image_count();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_collection_images_collection_id ON collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_image_id ON collection_images(image_id);