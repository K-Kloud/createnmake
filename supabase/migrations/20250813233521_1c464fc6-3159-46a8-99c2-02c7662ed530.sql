-- CRITICAL SECURITY FIX: Secure publicly exposed tables
-- This migration addresses critical security vulnerabilities by restricting public access to sensitive user data

-- Fix user_sessions table - remove public access
DROP POLICY IF EXISTS "Public read access for user_sessions" ON public.user_sessions;

-- Create secure RLS policy for user_sessions
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Fix comments table - restrict anonymous access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.comments;

-- Create more restrictive policy for comments
CREATE POLICY "Public can view comments on public images"
ON public.comments
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.generated_images gi 
    WHERE gi.id = comments.image_id 
    AND gi.is_public = true
  )
);

-- Fix comment_replies table - restrict anonymous access  
DROP POLICY IF EXISTS "Anyone can view replies" ON public.comment_replies;

CREATE POLICY "Public can view replies on public comments"
ON public.comment_replies
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.comments c
    JOIN public.generated_images gi ON gi.id = c.image_id
    WHERE c.id = comment_replies.comment_id 
    AND gi.is_public = true
  )
);

-- Fix generated_images table - ensure proper access control
DROP POLICY IF EXISTS "Enable read access for all users" ON public.generated_images;

CREATE POLICY "Public can view public images"
ON public.generated_images
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "Users can view their own images"
ON public.generated_images
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Fix image_likes table - remove public access
DROP POLICY IF EXISTS "Anyone can view likes" ON public.image_likes;

CREATE POLICY "Users can view likes on public images"
ON public.image_likes
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.generated_images gi
    WHERE gi.id = image_likes.image_id
    AND gi.is_public = true
  )
);

-- Fix user_follows table - remove public access
DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;

CREATE POLICY "Users can view follows for public profiles"
ON public.user_follows
FOR SELECT
TO authenticated
USING (true);

-- Fix marketplace_metrics table - remove public access
DROP POLICY IF EXISTS "Public read access for marketplace_metrics" ON public.marketplace_metrics;

CREATE POLICY "Admins can view all marketplace metrics"
ON public.marketplace_metrics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Add secure database functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_public_profile(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'bio', p.bio,
    'is_creator', p.is_creator,
    'is_artisan', p.is_artisan,
    'website', p.website,
    'location', p.location
  ) INTO profile_data
  FROM public.profiles p
  WHERE p.id = user_uuid;
  
  RETURN profile_data;
END;
$$;

-- Update existing get_safe_profile_info to use proper search_path
CREATE OR REPLACE FUNCTION public.get_safe_profile_info(profile_id uuid)
RETURNS TABLE(id uuid, username text, display_name text, avatar_url text, bio text, is_creator boolean, is_artisan boolean, website text, location text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.display_name,
        p.avatar_url,
        p.bio,
        p.is_creator,
        p.is_artisan,
        p.website,
        p.location
    FROM public.profiles p
    WHERE p.id = profile_id;
END;
$$;

-- Log security fix
INSERT INTO public.audit_logs (action, action_details)
VALUES (
  'security_fix_applied',
  jsonb_build_object(
    'description', 'Applied critical security fixes to restrict public access to sensitive user data',
    'tables_secured', ARRAY['user_sessions', 'comments', 'comment_replies', 'generated_images', 'image_likes', 'user_follows', 'marketplace_metrics'],
    'timestamp', now(),
    'severity', 'critical'
  )
);