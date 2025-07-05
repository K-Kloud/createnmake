-- Phase 1: Database Schema Updates

-- Create user_follows table for follow/unfollow functionality
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS on user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for user_follows
CREATE POLICY "Users can view follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Add missing fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_user_public ON public.generated_images(user_id, is_public);

-- Create function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'followers_count', (
      SELECT COUNT(*) FROM public.user_follows WHERE following_id = user_uuid
    ),
    'following_count', (
      SELECT COUNT(*) FROM public.user_follows WHERE follower_id = user_uuid
    ),
    'designs_count', (
      SELECT COUNT(*) FROM public.generated_images WHERE user_id = user_uuid AND is_public = true
    ),
    'total_likes', (
      SELECT COALESCE(SUM(likes), 0) FROM public.generated_images WHERE user_id = user_uuid AND is_public = true
    ),
    'total_views', (
      SELECT COALESCE(SUM(views), 0) FROM public.generated_images WHERE user_id = user_uuid AND is_public = true
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;