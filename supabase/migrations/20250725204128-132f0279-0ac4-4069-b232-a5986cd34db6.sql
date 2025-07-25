-- Fix function search path security issues
-- Update all functions to have immutable search_path set to 'public'

-- 1. Fix add_admin_role function
CREATE OR REPLACE FUNCTION public.add_admin_role(target_user_id uuid, admin_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert the admin role
  INSERT INTO admin_roles (user_id, role)
  VALUES (target_user_id, admin_role);
END;
$function$;

-- 2. Fix sync_image_likes_count function
CREATE OR REPLACE FUNCTION public.sync_image_likes_count(p_image_id bigint DEFAULT NULL::bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- 3. Fix get_user_stats function
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- 4. Fix get_conversion_funnel_stats function
CREATE OR REPLACE FUNCTION public.get_conversion_funnel_stats(funnel_name_param text, start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), end_date timestamp with time zone DEFAULT now())
 RETURNS TABLE(step text, step_order integer, total_users bigint, conversion_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH funnel_steps AS (
    SELECT 
      ce.funnel_step,
      ce.step_order,
      COUNT(DISTINCT ce.user_id) as users
    FROM conversion_events ce
    WHERE ce.funnel_name = funnel_name_param
      AND ce.timestamp >= start_date
      AND ce.timestamp <= end_date
      AND ce.completed = true
    GROUP BY ce.funnel_step, ce.step_order
  ),
  step_totals AS (
    SELECT 
      fs.*,
      LAG(fs.users) OVER (ORDER BY fs.step_order) as prev_step_users
    FROM funnel_steps fs
  )
  SELECT 
    st.funnel_step::TEXT,
    st.step_order,
    st.users,
    CASE 
      WHEN st.prev_step_users IS NULL THEN 100.0
      ELSE ROUND((st.users::NUMERIC / st.prev_step_users::NUMERIC) * 100, 2)
    END as conversion_rate
  FROM step_totals st
  ORDER BY st.step_order;
END;
$function$;

-- 5. Fix get_page_performance_stats function
CREATE OR REPLACE FUNCTION public.get_page_performance_stats(start_date timestamp with time zone DEFAULT (now() - '7 days'::interval), end_date timestamp with time zone DEFAULT now())
 RETURNS TABLE(page_path text, avg_load_time_ms numeric, total_views bigint, avg_time_spent_seconds numeric, bounce_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH page_stats AS (
    SELECT 
      pa.page_path,
      AVG(pm.duration_ms) as avg_load_time,
      COUNT(pa.id) as views,
      AVG(pa.time_spent_seconds) as avg_time_spent,
      COUNT(CASE WHEN pa.time_spent_seconds <= 10 THEN 1 END)::NUMERIC / COUNT(pa.id)::NUMERIC * 100 as bounce_rate
    FROM page_analytics pa
    LEFT JOIN performance_metrics pm ON pa.session_id = pm.session_id 
      AND pm.metric_type = 'page_load' 
      AND pm.metric_name = pa.page_path
    WHERE pa.timestamp >= start_date 
      AND pa.timestamp <= end_date
    GROUP BY pa.page_path
  )
  SELECT 
    ps.page_path::TEXT,
    ROUND(ps.avg_load_time, 2),
    ps.views,
    ROUND(ps.avg_time_spent, 2),
    ROUND(ps.bounce_rate, 2)
  FROM page_stats ps
  ORDER BY ps.views DESC;
END;
$function$;

-- 6. Fix handle_new_user_lifecycle function
CREATE OR REPLACE FUNCTION public.handle_new_user_lifecycle()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile if it doesn't exist
  INSERT INTO profiles (id, created_at, monthly_image_limit, images_generated_count)
  VALUES (NEW.id, NOW(), 5, 0)
  ON CONFLICT (id) DO NOTHING;
  
  -- Send welcome notification
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    notification_type,
    metadata
  ) VALUES (
    NEW.id,
    'Welcome to OpenTeknologies!',
    'Start exploring and creating amazing designs today.',
    'welcome',
    jsonb_build_object('onboarding_step', 1)
  );
  
  -- Log user registration
  INSERT INTO audit_logs (
    user_id,
    action,
    action_details
  ) VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object(
      'email', NEW.email,
      'provider', COALESCE(NEW.app_metadata->>'provider', 'email'),
      'registration_time', NOW()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- 7. Fix atomic_like_image function
CREATE OR REPLACE FUNCTION public.atomic_like_image(p_image_id bigint, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Continue with remaining functions...
-- 8. Fix maintain_image_likes_sync function
CREATE OR REPLACE FUNCTION public.maintain_image_likes_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 9. Fix handle_image_engagement function
CREATE OR REPLACE FUNCTION public.handle_image_engagement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  image_owner_id UUID;
BEGIN
  -- Get image owner
  SELECT user_id INTO image_owner_id 
  FROM generated_images 
  WHERE id = NEW.image_id;
  
  -- Notify image owner about new like/comment (avoid self-notifications)
  IF image_owner_id != NEW.user_id THEN
    INSERT INTO user_notifications (
      user_id,
      title,
      message,
      notification_type,
      metadata
    ) VALUES (
      image_owner_id,
      CASE 
        WHEN TG_TABLE_NAME = 'image_likes' THEN 'Your image got a like!'
        WHEN TG_TABLE_NAME = 'comments' THEN 'New comment on your image'
        ELSE 'New engagement on your image'
      END,
      CASE 
        WHEN TG_TABLE_NAME = 'image_likes' THEN 'Someone liked your design'
        WHEN TG_TABLE_NAME = 'comments' THEN 'Someone commented on your design'
        ELSE 'Someone engaged with your design'
      END,
      'engagement',
      jsonb_build_object(
        'image_id', NEW.image_id,
        'engagement_type', TG_TABLE_NAME,
        'from_user_id', NEW.user_id
      )
    );
  END IF;
  
  -- Update user activity metrics
  INSERT INTO activity_metrics (
    user_id,
    metric_type,
    metric_value,
    recorded_at
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN TG_TABLE_NAME = 'image_likes' THEN 'likes_given'
      WHEN TG_TABLE_NAME = 'comments' THEN 'comments_made'
      ELSE 'engagement_action'
    END,
    1,
    NOW()
  );
  
  RETURN NEW;
END;
$function$;

-- 10. Fix handle_subscription_changes function
CREATE OR REPLACE FUNCTION public.handle_subscription_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update profile with new subscription details
  UPDATE profiles 
  SET 
    creator_tier = CASE 
      WHEN NEW.status = 'active' THEN 
        CASE NEW.plan_id
          WHEN 1 THEN 'basic'
          WHEN 2 THEN 'pro'
          WHEN 3 THEN 'enterprise'
          ELSE 'free'
        END
      ELSE 'free'
    END,
    monthly_image_limit = CASE 
      WHEN NEW.status = 'active' THEN 
        COALESCE((SELECT monthly_image_limit FROM subscription_plans WHERE id = NEW.plan_id), 5)
      ELSE 5
    END,
    subscription_updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Send notification about subscription change
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    notification_type,
    metadata
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.status = 'active' THEN 'Subscription Activated!'
      WHEN NEW.status = 'canceled' THEN 'Subscription Canceled'
      ELSE 'Subscription Updated'
    END,
    CASE 
      WHEN NEW.status = 'active' THEN 'Your subscription is now active. Enjoy your new features!'
      WHEN NEW.status = 'canceled' THEN 'Your subscription has been canceled. You can reactivate anytime.'
      ELSE 'Your subscription status has been updated.'
    END,
    'subscription',
    jsonb_build_object(
      'plan_id', NEW.plan_id,
      'status', NEW.status,
      'change_date', NOW()
    )
  );
  
  RETURN NEW;
END;
$function$;