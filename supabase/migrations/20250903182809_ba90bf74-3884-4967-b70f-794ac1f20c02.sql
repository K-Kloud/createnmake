-- Add user activity feed table (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activity_feed') THEN
    CREATE TABLE public.user_activity_feed (
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
    CREATE INDEX idx_user_activity_feed_user_id_created_at ON public.user_activity_feed(user_id, created_at DESC);
    CREATE INDEX idx_user_activity_feed_target_user_id ON public.user_activity_feed(target_user_id);
    CREATE INDEX idx_user_activity_feed_unread ON public.user_activity_feed(user_id, is_read) WHERE is_read = false;

    -- Enable RLS
    ALTER TABLE public.user_activity_feed ENABLE ROW LEVEL SECURITY;

    -- Add RLS policies
    CREATE POLICY "Users can view their own activity feed" ON public.user_activity_feed
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "System can create activity feed entries" ON public.user_activity_feed
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Users can update their own activity feed" ON public.user_activity_feed
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add user preferences table (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    CREATE TABLE public.user_preferences (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL UNIQUE,
      notification_settings jsonb DEFAULT '{"push": true, "email": true, "in_app": true}',
      ui_preferences jsonb DEFAULT '{"theme": "system", "language": "en", "reduced_motion": false}',
      privacy_settings jsonb DEFAULT '{"profile_visibility": "public", "activity_visibility": "public"}',
      performance_settings jsonb DEFAULT '{"image_quality": "high", "auto_play_videos": true, "preload_images": true}',
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

    -- Add RLS policy
    CREATE POLICY "Users can manage their own prefs" ON public.user_preferences
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add user interactions table (skip if exists)  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_interactions') THEN
    CREATE TABLE public.user_interactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      target_user_id uuid,
      target_content_id bigint,
      interaction_type text NOT NULL,
      interaction_data jsonb DEFAULT '{}',
      session_id text,
      created_at timestamp with time zone DEFAULT now()
    );

    -- Add indexes for analytics
    CREATE INDEX idx_user_interactions_user_id_type_created_at 
      ON public.user_interactions(user_id, interaction_type, created_at DESC);
    CREATE INDEX idx_user_interactions_target_content_id 
      ON public.user_interactions(target_content_id) WHERE target_content_id IS NOT NULL;

    -- Enable RLS
    ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their own interactions" ON public.user_interactions
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own interactions" ON public.user_interactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;