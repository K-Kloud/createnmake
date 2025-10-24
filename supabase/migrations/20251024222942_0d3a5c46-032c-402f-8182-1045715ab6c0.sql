-- Phase 2: Add discovery and sharing features to collections

-- Add new columns to image_collections
ALTER TABLE image_collections 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Create collection_followers table
CREATE TABLE IF NOT EXISTS collection_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES image_collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  followed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, user_id)
);

-- RLS policies for collection_followers
ALTER TABLE collection_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collection followers"
ON collection_followers FOR SELECT
USING (true);

CREATE POLICY "Users can follow collections"
ON collection_followers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow collections"
ON collection_followers FOR DELETE
USING (auth.uid() = user_id);

-- Function to auto-update follower count
CREATE OR REPLACE FUNCTION update_collection_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE image_collections 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE image_collections 
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to maintain follower count
DROP TRIGGER IF EXISTS update_follower_count ON collection_followers;
CREATE TRIGGER update_follower_count
AFTER INSERT OR DELETE ON collection_followers
FOR EACH ROW EXECUTE FUNCTION update_collection_follower_count();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_collection_followers_collection_id ON collection_followers(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_followers_user_id ON collection_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_category ON image_collections(category);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON image_collections(is_public);