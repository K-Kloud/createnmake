
-- Phase 1: Database Synchronization - Create function to sync likes count
CREATE OR REPLACE FUNCTION sync_image_likes_count(p_image_id BIGINT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_image_id IS NOT NULL THEN
    -- Sync specific image
    UPDATE generated_images 
    SET likes = (
      SELECT COUNT(*) 
      FROM image_likes 
      WHERE image_id = p_image_id
    )
    WHERE id = p_image_id;
  ELSE
    -- Sync all images
    UPDATE generated_images 
    SET likes = COALESCE(like_counts.count, 0)
    FROM (
      SELECT 
        gi.id,
        COUNT(il.id) as count
      FROM generated_images gi
      LEFT JOIN image_likes il ON gi.id = il.image_id
      GROUP BY gi.id
    ) like_counts
    WHERE generated_images.id = like_counts.id;
  END IF;
END;
$$;

-- Create atomic like/unlike functions to prevent race conditions
CREATE OR REPLACE FUNCTION atomic_like_image(p_image_id BIGINT, p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_liked BOOLEAN;
  v_new_count INTEGER;
  v_result jsonb;
BEGIN
  -- Check if already liked (within transaction)
  SELECT EXISTS(
    SELECT 1 FROM image_likes 
    WHERE image_id = p_image_id AND user_id = p_user_id
  ) INTO v_already_liked;
  
  IF v_already_liked THEN
    -- Unlike: Remove like and decrement
    DELETE FROM image_likes 
    WHERE image_id = p_image_id AND user_id = p_user_id;
    
    UPDATE generated_images 
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = p_image_id
    RETURNING likes INTO v_new_count;
    
    v_result = jsonb_build_object(
      'action', 'unliked',
      'new_count', v_new_count,
      'has_liked', false
    );
  ELSE
    -- Like: Add like and increment
    INSERT INTO image_likes (image_id, user_id) 
    VALUES (p_image_id, p_user_id);
    
    UPDATE generated_images 
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = p_image_id
    RETURNING likes INTO v_new_count;
    
    v_result = jsonb_build_object(
      'action', 'liked',
      'new_count', v_new_count,
      'has_liked', true
    );
  END IF;
  
  -- Record metric for analytics
  INSERT INTO marketplace_metrics (image_id, metric_type, metric_value)
  VALUES (p_image_id, 'like', CASE WHEN v_already_liked THEN -1 ELSE 1 END);
  
  RETURN v_result;
END;
$$;

-- One-time data fix: Sync all existing image likes
SELECT sync_image_likes_count();

-- Create trigger to maintain sync automatically
CREATE OR REPLACE FUNCTION maintain_image_likes_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Someone liked an image
    UPDATE generated_images 
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = NEW.image_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Someone unliked an image
    UPDATE generated_images 
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_maintain_likes_sync ON image_likes;
CREATE TRIGGER trigger_maintain_likes_sync
  AFTER INSERT OR DELETE ON image_likes
  FOR EACH ROW EXECUTE FUNCTION maintain_image_likes_sync();
