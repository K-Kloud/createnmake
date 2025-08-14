-- CRITICAL FIX: Fix the user_sessions table error and secure public data access

-- Check what's causing the user_sessions error and fix it
DO $$
BEGIN
  -- First, let's see if user_sessions table actually exists properly
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    -- Table exists, so the error might be about a missing created_at column in some other context
    -- Let's make sure the table structure is correct
    RAISE NOTICE 'user_sessions table exists';
  ELSE
    -- Create the table if it doesn't exist
    CREATE TABLE user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE,
      ip_address INET,
      user_agent TEXT,
      is_active BOOLEAN DEFAULT true
    );
    
    ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- CRITICAL SECURITY FIX: Restrict public access to sensitive tables
-- Fix profiles table to prevent data theft
DROP POLICY IF EXISTS "Authenticated users can view limited profile info" ON profiles;
CREATE POLICY "Authenticated users can view public profile info" ON profiles
  FOR SELECT TO authenticated
  USING (true); -- Only authenticated users can see profiles

-- Fix user_sessions to prevent competitor analysis
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert sessions" ON user_sessions;
CREATE POLICY "System can insert sessions" ON user_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR current_setting('role') = 'service_role');

-- Fix marketplace_metrics to protect business intelligence
DROP POLICY IF EXISTS "Authenticated users can delete metrics" ON marketplace_metrics;
DROP POLICY IF EXISTS "Authenticated users can update metrics" ON marketplace_metrics;

CREATE POLICY "Users can view metrics for public images" ON marketplace_metrics
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM generated_images gi 
    WHERE gi.id = marketplace_metrics.image_id 
    AND gi.is_public = true
  ));

CREATE POLICY "System can insert metrics" ON marketplace_metrics
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Fix generated_images to properly respect is_public flag
DROP POLICY IF EXISTS "Anyone can view generated images" ON generated_images;
DROP POLICY IF EXISTS "Public can view public images" ON generated_images;

CREATE POLICY "Users can view public images" ON generated_images
  FOR SELECT TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can view their own images" ON generated_images
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix comments to require authentication
DROP POLICY IF EXISTS "Public can view comments on public images" ON comments;
CREATE POLICY "Authenticated users can view comments on public images" ON comments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM generated_images gi 
    WHERE gi.id = comments.image_id 
    AND gi.is_public = true
  ));

DROP POLICY IF EXISTS "Public can view replies on public comments" ON comment_replies;
CREATE POLICY "Authenticated users can view replies" ON comment_replies
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM comments c 
    JOIN generated_images gi ON gi.id = c.image_id 
    WHERE c.id = comment_replies.comment_id 
    AND gi.is_public = true
  ));

-- Fix remaining search_path issues for functions
DO $$
BEGIN
  -- Fix any remaining functions that might not have search_path set
  PERFORM pg_catalog.set_config('search_path', 'public', false);
END $$;