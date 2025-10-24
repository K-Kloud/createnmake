-- Add analytics tables for collections

-- Collection views tracking
CREATE TABLE IF NOT EXISTS collection_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES image_collections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  CONSTRAINT fk_collection FOREIGN KEY (collection_id) REFERENCES image_collections(id)
);

-- Collection activity log
CREATE TABLE IF NOT EXISTS collection_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES image_collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'updated', 'image_added', 'image_removed', 'shared')),
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_collection_activity FOREIGN KEY (collection_id) REFERENCES image_collections(id),
  CONSTRAINT fk_user_activity FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE collection_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collection_views
CREATE POLICY "Anyone can view collection views" ON collection_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own views" ON collection_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for collection_activity
CREATE POLICY "Users can view their own activity" ON collection_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON collection_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to track collection activity
CREATE OR REPLACE FUNCTION track_collection_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'image_collections' THEN
      INSERT INTO collection_activity (collection_id, user_id, activity_type)
      VALUES (NEW.id, NEW.user_id, 'created');
    ELSIF TG_TABLE_NAME = 'collection_images' THEN
      INSERT INTO collection_activity (collection_id, user_id, activity_type, activity_data)
      SELECT NEW.collection_id, ic.user_id, 'image_added', jsonb_build_object('image_id', NEW.image_id)
      FROM image_collections ic WHERE ic.id = NEW.collection_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'image_collections' THEN
    INSERT INTO collection_activity (collection_id, user_id, activity_type)
    VALUES (NEW.id, NEW.user_id, 'updated');
  ELSIF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'collection_images' THEN
    INSERT INTO collection_activity (collection_id, user_id, activity_type, activity_data)
    SELECT OLD.collection_id, ic.user_id, 'image_removed', jsonb_build_object('image_id', OLD.image_id)
    FROM image_collections ic WHERE ic.id = OLD.collection_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for activity tracking
CREATE TRIGGER track_collection_creation
  AFTER INSERT ON image_collections
  FOR EACH ROW EXECUTE FUNCTION track_collection_activity();

CREATE TRIGGER track_collection_update
  AFTER UPDATE ON image_collections
  FOR EACH ROW EXECUTE FUNCTION track_collection_activity();

CREATE TRIGGER track_image_addition
  AFTER INSERT ON collection_images
  FOR EACH ROW EXECUTE FUNCTION track_collection_activity();

CREATE TRIGGER track_image_removal
  AFTER DELETE ON collection_images
  FOR EACH ROW EXECUTE FUNCTION track_collection_activity();

-- Function to get collection statistics
CREATE OR REPLACE FUNCTION get_collection_stats(p_collection_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_views', (SELECT COUNT(*) FROM collection_views WHERE collection_id = p_collection_id),
    'unique_viewers', (SELECT COUNT(DISTINCT user_id) FROM collection_views WHERE collection_id = p_collection_id AND user_id IS NOT NULL),
    'total_followers', (SELECT follower_count FROM image_collections WHERE id = p_collection_id),
    'total_images', (SELECT image_count FROM image_collections WHERE id = p_collection_id),
    'recent_activity', (
      SELECT COUNT(*) FROM collection_activity 
      WHERE collection_id = p_collection_id 
      AND created_at > NOW() - INTERVAL '7 days'
    ),
    'views_last_7_days', (
      SELECT COUNT(*) FROM collection_views 
      WHERE collection_id = p_collection_id 
      AND viewed_at > NOW() - INTERVAL '7 days'
    ),
    'images_added_last_7_days', (
      SELECT COUNT(*) FROM collection_activity 
      WHERE collection_id = p_collection_id 
      AND activity_type = 'image_added'
      AND created_at > NOW() - INTERVAL '7 days'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending collections
CREATE OR REPLACE FUNCTION get_trending_collections(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  collection_id UUID,
  collection_name TEXT,
  cover_image_url TEXT,
  image_count INTEGER,
  follower_count INTEGER,
  view_count BIGINT,
  trending_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_views AS (
    SELECT 
      cv.collection_id,
      COUNT(*) as view_count
    FROM collection_views cv
    WHERE cv.viewed_at > NOW() - INTERVAL '7 days'
    GROUP BY cv.collection_id
  ),
  recent_followers AS (
    SELECT 
      cf.collection_id,
      COUNT(*) as new_followers
    FROM collection_followers cf
    WHERE cf.followed_at > NOW() - INTERVAL '7 days'
    GROUP BY cf.collection_id
  )
  SELECT 
    ic.id,
    ic.name,
    ic.cover_image_url,
    ic.image_count,
    ic.follower_count,
    COALESCE(rv.view_count, 0)::BIGINT,
    (
      COALESCE(rv.view_count, 0) * 1.0 + 
      COALESCE(rf.new_followers, 0) * 5.0 +
      ic.follower_count * 0.5 +
      ic.image_count * 0.1
    ) as trending_score
  FROM image_collections ic
  LEFT JOIN recent_views rv ON ic.id = rv.collection_id
  LEFT JOIN recent_followers rf ON ic.id = rf.collection_id
  WHERE ic.is_public = true
  ORDER BY trending_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collection_views_collection_id ON collection_views(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_views_user_id ON collection_views(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_views_viewed_at ON collection_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_collection_activity_collection_id ON collection_activity(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_activity_user_id ON collection_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_activity_created_at ON collection_activity(created_at);