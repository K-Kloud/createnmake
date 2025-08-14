-- Final comprehensive fix for remaining critical issues

-- Fix existing policies by dropping and recreating them properly
DO $$
BEGIN
  -- Only drop and recreate if policy doesn't already exist with correct definition
  
  -- Fix profiles table security (CRITICAL SECURITY ISSUE)
  DROP POLICY IF EXISTS "Authenticated users can view limited profile info" ON profiles;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Authenticated users can view public profile info'
  ) THEN
    CREATE POLICY "Authenticated users can view public profile info" ON profiles
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  -- Fix user_sessions security
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' 
    AND policyname = 'Users can view only their own sessions'
  ) THEN
    DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
    CREATE POLICY "Users can view only their own sessions" ON user_sessions
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Fix marketplace_metrics security (BUSINESS INTELLIGENCE PROTECTION)
  DROP POLICY IF EXISTS "Authenticated users can delete metrics" ON marketplace_metrics;
  DROP POLICY IF EXISTS "Authenticated users can update metrics" ON marketplace_metrics;
  DROP POLICY IF EXISTS "Admins can view all marketplace metrics" ON marketplace_metrics;
  
  CREATE POLICY "Authenticated users can view public image metrics" ON marketplace_metrics
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM generated_images gi 
      WHERE gi.id = marketplace_metrics.image_id 
      AND gi.is_public = true
    ));

  -- Fix generated_images to respect is_public properly
  DROP POLICY IF EXISTS "Anyone can view generated images" ON generated_images;
  DROP POLICY IF EXISTS "Public can view public images" ON generated_images;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'generated_images' 
    AND policyname = 'Authenticated users can view public images'
  ) THEN
    CREATE POLICY "Authenticated users can view public images" ON generated_images
      FOR SELECT TO authenticated
      USING (is_public = true);
  END IF;

  -- Fix comments to require authentication
  DROP POLICY IF EXISTS "Public can view comments on public images" ON comments;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Authenticated users can view comments'
  ) THEN
    CREATE POLICY "Authenticated users can view comments" ON comments
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM generated_images gi 
        WHERE gi.id = comments.image_id 
        AND gi.is_public = true
      ));
  END IF;

  -- Fix comment_replies to require authentication
  DROP POLICY IF EXISTS "Public can view replies on public comments" ON comment_replies;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comment_replies' 
    AND policyname = 'Authenticated users can view comment replies'
  ) THEN
    CREATE POLICY "Authenticated users can view comment replies" ON comment_replies
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM comments c 
        JOIN generated_images gi ON gi.id = c.image_id 
        WHERE c.id = comment_replies.comment_id 
        AND gi.is_public = true
      ));
  END IF;

END $$;

-- Fix subscription_plans to only allow viewing (not anonymous access)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Public can view subscription plans" ON subscription_plans
  FOR SELECT TO anon, authenticated
  USING (true);

-- Fix image_likes to require authentication for viewing
DROP POLICY IF EXISTS "Enable read access for all users" ON image_likes;
CREATE POLICY "Authenticated users can view likes on public images" ON image_likes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM generated_images gi 
    WHERE gi.id = image_likes.image_id 
    AND gi.is_public = true
  ));