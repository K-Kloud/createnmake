-- Comprehensive Database Security and Functionality Fixes

-- 1. Fix Database Functions - Add proper search_path to all functions
CREATE OR REPLACE FUNCTION public.add_admin_role(target_user_id uuid, admin_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert the admin role
  INSERT INTO admin_roles (user_id, role)
  VALUES (target_user_id, admin_role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_image_likes_count(p_image_id bigint DEFAULT NULL::bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'followers_count', (
      SELECT COUNT(*) FROM user_follows WHERE following_id = user_uuid
    ),
    'following_count', (
      SELECT COUNT(*) FROM user_follows WHERE follower_id = user_uuid
    ),
    'designs_count', (
      SELECT COUNT(*) FROM generated_images WHERE user_id = user_uuid AND is_public = true
    ),
    'total_likes', (
      SELECT COALESCE(SUM(likes), 0) FROM generated_images WHERE user_id = user_uuid AND is_public = true
    ),
    'total_views', (
      SELECT COALESCE(SUM(views), 0) FROM generated_images WHERE user_id = user_uuid AND is_public = true
    )
  ) INTO stats;
  
  RETURN stats;
END;
$function$;

-- 2. Fix RLS Policies - Add authenticated user requirement to prevent anonymous access
DROP POLICY IF EXISTS "Admins can view all AB test events" ON public.ab_test_events;
CREATE POLICY "Admins can view all AB test events" 
ON public.ab_test_events 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid() 
  AND admin_roles.role IN ('admin', 'super_admin')
));

DROP POLICY IF EXISTS "Users can view their own activity metrics" ON public.activity_metrics;
CREATE POLICY "Users can view their own activity metrics" 
ON public.activity_metrics 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can select all admin pages" ON public.adminpages;
CREATE POLICY "Admins can select all admin pages" 
ON public.adminpages 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid() 
  AND admin_roles.role IN ('admin', 'super_admin')
));

-- 3. Add Missing RLS Policies for tables without them
-- Add RLS policy for ai_agent table
ALTER TABLE public.ai_agent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage AI agents" 
ON public.ai_agent 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid() 
  AND admin_roles.role IN ('admin', 'super_admin')
));

-- 4. Add Missing Triggers
-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create trigger for image generation count updates
CREATE OR REPLACE TRIGGER on_image_generated
  AFTER INSERT ON public.generated_images
  FOR EACH ROW EXECUTE PROCEDURE public.increment_user_image_count();

-- Create trigger for audit logging on admin role changes
CREATE OR REPLACE TRIGGER admin_role_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
  FOR EACH ROW EXECUTE PROCEDURE public.audit_admin_role_changes();

-- 5. Fix Comment System Foreign Key Issue
-- Update comment_replies to ensure proper foreign key constraints
DO $$
BEGIN
  -- Check if the foreign key constraint exists and drop it if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comment_replies_comment_id_fkey' 
    AND table_name = 'comment_replies'
  ) THEN
    ALTER TABLE public.comment_replies DROP CONSTRAINT comment_replies_comment_id_fkey;
  END IF;

  -- Add the correct foreign key constraint
  ALTER TABLE public.comment_replies 
  ADD CONSTRAINT comment_replies_comment_id_fkey 
  FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;
END $$;