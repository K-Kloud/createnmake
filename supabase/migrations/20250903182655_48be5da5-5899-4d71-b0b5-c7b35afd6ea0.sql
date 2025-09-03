-- Add user activity feed table
CREATE TABLE IF NOT EXISTS public.user_activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  activity_data jsonb NOT NULL DEFAULT '{}',
  target_user_id uuid,
  target_content_id text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_user_id_created_at ON public.user_activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_target_user_id ON public.user_activity_feed(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_unread ON public.user_activity_feed(user_id, is_read) WHERE is_read = false;

-- Add RLS policies
ALTER TABLE public.user_activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity feed" ON public.user_activity_feed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create activity feed entries" ON public.user_activity_feed
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own activity feed" ON public.user_activity_feed
  FOR UPDATE USING (auth.uid() = user_id);

-- Add PWA and performance related settings table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  notification_settings jsonb DEFAULT '{"push": true, "email": true, "in_app": true}',
  ui_preferences jsonb DEFAULT '{"theme": "system", "language": "en", "reduced_motion": false}',
  privacy_settings jsonb DEFAULT '{"profile_visibility": "public", "activity_visibility": "public"}',
  performance_settings jsonb DEFAULT '{"image_quality": "high", "auto_play_videos": true, "preload_images": true}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add user discovery and recommendation improvements
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id uuid,
  target_content_id bigint,
  interaction_type text NOT NULL, -- 'view', 'like', 'share', 'save', 'download'
  interaction_data jsonb DEFAULT '{}',
  session_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for analytics and recommendations
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id_type_created_at 
  ON public.user_interactions(user_id, interaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target_content_id 
  ON public.user_interactions(target_content_id) WHERE target_content_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id 
  ON public.user_interactions(session_id) WHERE session_id IS NOT NULL;

-- Add RLS for user interactions
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions" ON public.user_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to generate activity feed entries
CREATE OR REPLACE FUNCTION generate_activity_feed_entry(
  p_user_id uuid,
  p_activity_type text,
  p_activity_data jsonb,
  p_target_user_id uuid DEFAULT NULL,
  p_target_content_id text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.user_activity_feed (
    user_id,
    activity_type,
    activity_data,
    target_user_id,
    target_content_id
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_activity_data,
    p_target_user_id,
    p_target_content_id
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create activity feed entries for follows
CREATE OR REPLACE FUNCTION handle_follow_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Create activity for the person being followed
  PERFORM generate_activity_feed_entry(
    NEW.following_id,
    'new_follower',
    jsonb_build_object(
      'follower_id', NEW.follower_id,
      'timestamp', NEW.created_at
    ),
    NEW.follower_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_follow_activity
  AFTER INSERT ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION handle_follow_activity();